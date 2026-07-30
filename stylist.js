// The stylist, with a spending limit.
//
// Runs as a Vercel serverless function at /api/stylist. Three things it does
// that the old Netlify version did not:
//
//   1. Owns the system prompt. The persona and Elizabeth's personal profile
//      live here, not in page source, and a caller cannot substitute their own.
//      Before this, anyone could POST any system prompt to the endpoint and use
//      it as a free Claude proxy.
//   2. Keeps a running total of what it has spent and stops at the budget.
//   3. Rate limits per IP so one person cannot drain the budget in a minute.
//
// Required environment variables (set these in Vercel, never in the repo):
//   ANTHROPIC_API_KEY        your key
//   KV_REST_API_URL          from a Redis store added to the project
//   KV_REST_API_TOKEN        ditto
//     (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN also work)
//
// Optional:
//   STYLIST_BUDGET_USD       default 50
//   STYLIST_MODEL            default claude-sonnet-4-20250514
//   PRICE_IN_PER_MTOK        default 3    — confirm against current pricing
//   PRICE_OUT_PER_MTOK       default 15   — confirm against current pricing

const Anthropic = require('@anthropic-ai/sdk');

const BUDGET     = Number(process.env.STYLIST_BUDGET_USD || 50);
const MODEL      = process.env.STYLIST_MODEL || 'claude-sonnet-4-20250514';
const PRICE_IN   = Number(process.env.PRICE_IN_PER_MTOK  || 3);
const PRICE_OUT  = Number(process.env.PRICE_OUT_PER_MTOK || 15);

const MAX_TOKENS      = 600;   // caps the cost of any single reply
const MAX_HISTORY     = 8;     // messages kept from the conversation
const MAX_CHARS       = 1200;  // per message
const RATE_PER_MIN    = 8;
const RATE_PER_DAY    = 40;

const SPEND_KEY = 'wardrobe:spend';

const SYSTEM = `You are Trixie and Katya — the dual voice of Elizabeth's personal style assistant. Warm, surreal, specific, dry wit, occasionally geological. Notes are punchy. No em-dashes. Third-person "her" when describing how she looks. Humour lives in the observation itself.

ABOUT ELIZABETH:
- Works at NICOR in marketing, building her professional reputation thoughtfully
- Figure: soft hourglass — wrap necklines, V-necks, peplums, wide-legs, defined waist are her best silhouettes. 5'8", long legs
- Colouring: pale cool-neutral skin, striking grey-green eyes, dark brown hair, rose gold glasses
- Palette: teal/ocean, emerald, plum/violet, black/jet. Accents: berry, navy, blue-violet
- Silver jewellery only — gold eliminated entirely
- Signature pieces: malachite necklace, luna moth necklace, malachite/labradorite/moonstone drop earrings
- Wide-leg trousers always require Mary Janes or pumps — never ankle boots (legs are long; boots disappear)
- Tights only with skirts and dresses, never trousers

OWNED WARDROBE (updated):
Tops: Ocean/Berry/Jet peplum blouses, Emerald vintage tunic, Emerald V-neck vintage blouse, Berry cowl blouse, Merlot bishop sleeve blouse, Violet round-neck shell (NEW), Slate floral pussy-bow shell (NEW)
Bottoms: Jet wide-legs, Ocean wide-legs, Jet/Navy/Slate pencil skirts, Navy pleated skirt, Jet leather skirt (NEW), Ocean/Merlot/Navy/Jet tiered maxi skirts, Merlot chinos
Dresses: Merlot wrap, Jet wrap, Navy wrap, Navy ruched sheath (NEW), Jet buttoned sheath, Cerulean colorblock sheath, Pearl flutter-sleeve sheath, Jet V-notch belted sheath
Outerwear: Slate oversized blazer, Merlot slim blazer, Jet structured blazer (NEW), Jet leather moto jacket (NEW), Orchid ribbed cardigan
Shoes: Jet low-heel ankle boots, Jet Mary Janes (silver buckle), Jet round-toe mid-heel pumps (NEW), Jet platform buckle ankle boots (NEW)
Belts: Jet leather belt, Merlot leather belt (NEW)
Tights: Sheer jet, Opaque jet, Merlot opaque, Navy opaque, Ocean opaque, Knee-high pattern, Scallop pattern
Scarves: Lagoon long scarf, Emerald orchid silk scarf, Lagoon chiffon scarf
Jewellery necklaces: Malachite statement, Luna moth, Pink & silver bead, Spoon & pearl, Garnet & pearl, Moonstone pendant, Rose quartz pendant, Botanical drop pendant
Jewellery earrings: Malachite/labradorite/moonstone drops, Butterfly earrings, Pink & silver drops, Plum floral teardrop, Lapis bead teardrop, Pearl studs, Dark baroque pearl drops (NEW), Berry gem drops (NEW), Raven hoops with garnet & moonstone drops (NEW)
Hairsticks: Garnet & moonstone raven hairstick, Berry & petal silver swirl hairstick

BEAUTY:
Lip options: On the Mauve (everyday/subtle), MAC Rebel (mid-register berry), MAC Diva (full statement deep crimson-plum)
Nails: OPI Cable Carpool Lane/Essie Bordeaux (default burgundy), OPI Bubble Bath (nude, swap Thursday evenings)
Eyes: Kitten liner upper lash line only, volume mascara

Respond warmly and directly. Give specific outfit suggestions using pieces she owns. Keep responses concise — 2-4 sentences unless she asks for more. Always suggest a lip and hair choice with outfit suggestions.`;

// ---------------------------------------------------------------- redis
const REDIS_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(...command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const data = await r.json();
  return data.result;
}

async function overRateLimit(ip) {
  const minute = Math.floor(Date.now() / 60000);
  const day    = Math.floor(Date.now() / 86400000);
  const mKey = `wardrobe:rl:m:${ip}:${minute}`;
  const dKey = `wardrobe:rl:d:${ip}:${day}`;
  const [m, d] = await Promise.all([redis('INCR', mKey), redis('INCR', dKey)]);
  await Promise.all([redis('EXPIRE', mKey, 120), redis('EXPIRE', dKey, 172800)]);
  return Number(m) > RATE_PER_MIN || Number(d) > RATE_PER_DAY;
}

// ---------------------------------------------------------------- handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'The stylist has no API key. Set ANTHROPIC_API_KEY in Vercel.' });
  }
  if (!REDIS_URL || !REDIS_TOKEN) {
    // Fail closed on purpose: without somewhere to keep the running total there
    // is no spending limit, and an unmetered endpoint is how you find out your
    // card was charged for someone else's fun.
    return res.status(500).json({
      error: 'The stylist has no way to track her spending yet, so she is staying in. Add a Redis store to this Vercel project.'
    });
  }

  try {
    // ---- validate what the caller sent -------------------------------
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    let messages = Array.isArray(body.messages) ? body.messages : [];
    messages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Nothing to reply to.' });
    }

    // ---- rate limit --------------------------------------------------
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (await overRateLimit(ip)) {
      return res.status(429).json({
        reply: 'Slow down, gorgeous. The stylist needs a moment between consultations.',
        remaining: Math.max(0, BUDGET - Number(await redis('GET', SPEND_KEY) || 0)),
        budget: BUDGET
      });
    }

    // ---- budget ------------------------------------------------------
    const spent = Number(await redis('GET', SPEND_KEY) || 0);
    if (spent >= BUDGET) {
      return res.status(200).json({
        exhausted: true,
        reply: 'The stylist has spent her entire allowance and is lying down in a dark room with a cold compress and a glass of something. She will be back when Elizabeth tops her up.',
        remaining: 0,
        budget: BUDGET
      });
    }

    // ---- ask ---------------------------------------------------------
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      messages
    });

    const inTok  = response.usage?.input_tokens  || 0;
    const outTok = response.usage?.output_tokens || 0;
    const cost   = (inTok / 1e6) * PRICE_IN + (outTok / 1e6) * PRICE_OUT;

    const newSpend = Number(await redis('INCRBYFLOAT', SPEND_KEY, cost.toFixed(6)));
    const reply = response.content?.[0]?.text || 'Sorry, I had trouble with that. Try again?';

    return res.status(200).json({
      reply,
      remaining: Math.max(0, BUDGET - newSpend),
      budget: BUDGET
    });

  } catch (err) {
    console.error('stylist error:', err);
    return res.status(500).json({ error: 'The stylist is having a moment. Try again shortly.' });
  }
};
