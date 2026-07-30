# Wardrobe

A jewel-toned professional capsule wardrobe, and every outfit it makes.

118 pieces. 269 outfits, 158 of which use only things already owned. Tap any single
piece to see every outfit it appears in.

Ported from Netlify to Vercel so it can be improved incrementally.

---

## Deploying it

**1. Make the repo.** On GitHub, new repository — `wardrobe` is a good name. Upload
everything in this folder: `index.html`, `api/`, `images/`, `package.json`,
`vercel.json`, `.gitignore`.

**2. Import it to Vercel.** Add New → Project → pick the repo. Framework preset
**Other**, no build command, output directory left alone. Deploy. The look book
works immediately. The stylist will politely refuse until step 3 and 4.

**3. Give the stylist somewhere to keep her receipts.** In the Vercel project:
Storage → add a **Redis** store (Upstash) → connect it to this project. That injects
`KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. `UPSTASH_REDIS_REST_URL`
and `UPSTASH_REDIS_REST_TOKEN` work too, whichever names appear.

This is what the spending limit is counted in. Without it the function refuses to
call the API at all, on purpose — see below.

**4. Add your key.** Settings → Environment Variables:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your key |
| `STYLIST_BUDGET_USD` | `50` (optional, this is the default) |

Redeploy after adding variables so the function picks them up.

---

## How the $50 limit works

Every reply reports how many tokens it used. The function converts that to dollars,
adds it to a running total in Redis, and returns the remaining balance, which shows
up as a quiet line at the top of the chat panel. When the total reaches the budget,
the stylist stops answering and says she has spent her allowance and is lying down.

**Rates.** Priced at $3 per million input tokens and $15 per million output tokens
by default. Check those against current pricing and override with
`PRICE_IN_PER_MTOK` and `PRICE_OUT_PER_MTOK` if they have moved. The total is an
estimate, not an invoice — treat it as a ceiling with a safety margin, not accounting.

**Topping it up.** Open the Redis store's data browser and set `wardrobe:spend`
back to `0`, or to whatever you have already spent. Raising `STYLIST_BUDGET_USD`
works too.

**Why it fails closed.** If the Redis variables are missing, the function returns an
error instead of calling the API. An endpoint that spends money with no counter
attached is how you find out later that someone else enjoyed your key.

---

## Other guards

- **The system prompt lives here, not in the browser.** The old version sent the
  persona and personal profile from page source with every request, which meant two
  things: anyone could read it, and anyone could POST a *different* system prompt to
  the endpoint and use it as a free Claude proxy. The function now supplies its own
  and ignores whatever a caller sends.
- **Rate limits.** 8 requests per minute and 40 per day per IP, so one person cannot
  drain the budget in an afternoon.
- **Input caps.** Last 8 messages, 1200 characters each, 600 max output tokens.

---

## What changed in the port

| | Before | Now |
|---|---|---|
| Host | Netlify | Vercel |
| Function | `netlify/functions/stylist.js` | `api/stylist.js` |
| Endpoint | `/.netlify/functions/stylist` | `/api/stylist` |
| System prompt | sent from the browser | server side |
| Spending | unlimited | capped, tracked, reported |
| Images | 130 PNG, 20.1 MB | 130 JPEG, 2.9 MB |
| Filename case | 7 references wrong | fixed |

Those seven filenames matter more than they look. macOS does not care about
capitalisation; Linux does. `lip_Diva.png` on disk as `lip_diva.png` loads fine
locally and 404s the moment it is deployed. One filename also had a space in it,
now hyphenated.

---

## Files

```
index.html          the whole app: data, styles, logic
api/stylist.js      the serverless function, the persona, the spending limit
images/             130 pieces, hair, lips, nails
package.json        one dependency, the Anthropic SDK
vercel.json         a year of cache on the images
```

Everything is in `index.html` — the wardrobe object, the outfits, the styles and the
logic. That is fine at this size and will stop being fine. When it does, the split
worth making first is the data: `wardrobe.js`, `outfits-owned.js`, `outfits-full.js`.
