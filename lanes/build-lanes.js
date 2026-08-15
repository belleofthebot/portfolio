#!/usr/bin/env node
/* ============================================================================
   build-lanes.js — generates the five lane pages from cards.data.js.
   One deck, five orderings. Run:  node lanes/build-lanes.js
   Writes ai.html, marketing.html, comms.html, nonprofit.html, design.html
   into the repo root.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const { LANES, LANE_META, CARDS } = require('./cards.data.js');

const ROOT = path.resolve(__dirname, '..');

/* hero image per lane. Chosen from assets that actually exist in the repo. */
const HERO = {
  ai:        { src: 'thumb-deck-generator.jpg', alt: 'Three slides built automatically by the product deck generator.' },
  marketing: { src: 'thumb-studio.jpg',         alt: 'The studio dashboard: time-window controls above revenue, orders, average order and pieces sold.' },
  comms:     { src: 'belleofthebot-spotlight.jpg', alt: 'The Belle of the Bot homepage: the mascot Belle waving beside the headline "AI is complicated. Let’s learn about it together."' },
  nonprofit: { src: 'cd-preview.jpg',           alt: 'Three drawings for Choose Democracy: people embracing beneath a rising sun, a crowd holding placards, and a We the People 2.0 scroll.' },
  design:    { src: 'pts-airport-vitrine.jpg', alt: 'A lit display case beneath the ALBUQUERQUE letters at the airport, holding roughly a dozen framed Southwest landscape paintings, the Painting the Southwest raven sign with a QR code and artist card, a spread oracle deck, the Flowers of New Mexico print, a 2026 moon calendar and rows of postcards.' },
};

const esc = (s) => String(s).replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* esc() alone is not safe inside a double-quoted attribute: an alt or a meta
   description containing a quotation mark closes the attribute early and spills
   the rest into the markup. Anything going into an attribute uses attr(). */
const attr = (s) => esc(s).replace(/"/g, '&quot;');

/* ---------------------------------------------------------------- nav ----- */
function nav(lane) {
  const items = LANES.map((l) => {
    const m = LANE_META[l];
    const cur = l === lane ? ' aria-current="page"' : '';
    return `<li><a href="${m.slug}.html"${cur}>${esc(m.navLabel)}</a></li>`;
  }).join('');
  return `<header class="nav"><div class="nav-in">
<a class="mark" href="index.html">elizabeth<span class="bot">beier</span><span class="cur">_</span></a>
<details class="wdrop" id="wdrop">
  <summary aria-haspopup="true">work <span class="caret" aria-hidden="true">▾</span></summary>
  <ul class="wdrop-menu">
    <li><a href="index.html">everything</a></li>
    ${items}
  </ul>
</details>
<a class="link" href="resume.html">résumé</a><a class="link" href="index.html#stack">stack</a><a class="link" href="index.html#about">about</a><a class="link" href="index.html#contact">contact</a></div></header>`;
}

/* -------------------------------------------------------------- pills ----- */
function pills(lane) {
  const inner = LANES.map((l) => {
    const m = LANE_META[l];
    const on = l === lane;
    return `<a class="lpill${on ? ' on' : ''}" href="${m.slug}.html"${on ? ' aria-current="page"' : ''}>${esc(m.pill)}</a>`;
  }).join('');
  return `<nav class="lpills" aria-label="Choose a view of the same work">
<span class="lpills-lb" id="lpl">same work, five views</span>
<span class="lpills-in" role="group" aria-labelledby="lpl"><a class="lpill" href="index.html">everything</a>${inner}</span>
</nav>`;
}

/* -------------------------------------------------------- proof strips ---- */
function proof(m) {
  if (m.proofStyle === 'numbers') {
    return `<div class="metrics lp-metrics">${m.proof.map((p) =>
      `<div class="metric${p.pulse ? ' pulse' : ''}"><span class="n">${esc(p.n)}</span><span class="l">${esc(p.l)}</span></div>`).join('')}</div>`;
  }
  if (m.proofStyle === 'press') {
    return `<div class="pressband"><h2 class="pb-h">On the record</h2><ul class="pb-list">${m.press.map((p) =>
      `<li><blockquote>${esc(p.q)}</blockquote><cite>${p.href ? `<a href="${p.href}" target="_blank" rel="noopener">${esc(p.s)}</a>` : esc(p.s)}</cite></li>`).join('')}</ul>
<ul class="pb-also">${(m.stage || []).map((s) =>
      `<li><a href="${s.href}" target="_blank" rel="noopener">${esc(s.l)}</a></li>`).join('')}</ul></div>`;
  }
  if (m.proofStyle === 'clients') {
    return `<div class="clientstrip"><h2 class="cs-h">Where the work has been</h2>
<ul>${m.clients.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>`;
  }
  return '';
}

/* extra press band for lanes that lead with numbers but still carry quotes */
function extraPress(m) {
  if (m.proofStyle === 'press' || !m.press) return '';
  return `<section class="lp-sec"><div class="wrap"><div class="pressband"><h2 class="pb-h">${esc(m.pressHead || 'On the record')}</h2>
<ul class="pb-list">${m.press.map((p) =>
    `<li><blockquote>${esc(p.q)}</blockquote><cite>${p.href ? `<a href="${p.href}" target="_blank" rel="noopener">${esc(p.s)}</a>` : esc(p.s)}</cite></li>`).join('')}</ul></div></div></section>`;
}

/* --------------------------------------------------------- card render ---- */
function thumb(c, lazy) {
  if (c.thumb.drawn) return c.thumb.drawn;
  const t = c.thumb;
  return `<div class="thumb lp-shot"><img src="${t.src}"${t.w ? ` width="${t.w}" height="${t.h}"` : ''} ${lazy ? 'loading="lazy" ' : ''}decoding="async" alt="${attr(t.alt)}"></div>`;
}

function leadCard(c, lane, i) {
  const L = c.lanes[lane];
  const ext = c.external ? ' target="_blank" rel="noopener"' : '';
  const credit = c.credit ? `<span class="lp-credit">${esc(c.credit)}</span>` : '';
  const pend = c.imagePending ? `<span class="lp-pending">Artwork for this card is on the way. The writing is final.</span>` : '';
  return `<a class="wcard lp-lead" href="${c.href}"${ext}>
${thumb(c, i > 0)}
<span class="ptag">${esc(c.tag)}</span>
<h3>${esc(c.title)}</h3>
<p>${esc(L.line)}</p>
${credit}${pend}
<span class="foot"><span class="read">${c.external ? 'visit the site →' : 'read →'}</span></span>
</a>`;
}

function tile(c, lane) {
  const L = c.lanes[lane];
  const ext = c.external ? ' target="_blank" rel="noopener"' : '';
  /* the held-back work carries its artwork too, so the second section reads as
     more of the same deck rather than a list of leftovers. Cropped shallower
     than a lead card, and always lazy: this section is below the fold. */
  const t = c.thumb;
  const shot = t && t.src
    ? `<div class="lt-shot"><img src="${t.src}"${t.w ? ` width="${t.w}" height="${t.h}"` : ''} loading="lazy" decoding="async" alt="${attr(t.alt)}"></div>`
    : '';
  return `<a class="ltile${shot ? ' has-shot' : ''}" href="${c.href}"${ext}>
${shot}<span class="lt-tag">${esc(c.tag)}</span>
<h3>${esc(c.title)}</h3>
<p>${esc(L.line)}</p>
<span class="lt-go" aria-hidden="true">→</span>
</a>`;
}

/* ------------------------------------------------------------- footer ----- */
function laneFooter(lane) {
  const others = LANES.filter((l) => l !== lane).map((l) =>
    `<a href="${LANE_META[l].slug}.html">${esc(LANE_META[l].navLabel)}</a>`).join('');
  return `<nav class="lanefoot" aria-label="The other views of this work">
<span class="lf-h">Same work, arranged for a different reader</span>
<span class="lf-links"><a href="index.html">everything</a>${others}</span>
</nav>`;
}

/* --------------------------------------------------------------- page ----- */
function page(lane) {
  const m = LANE_META[lane];
  const deck = CARDS.filter((c) => c.lanes[lane] && c.lanes[lane].rank)
    .sort((a, b) => a.lanes[lane].rank - b.lanes[lane].rank);
  const lead = deck.slice(0, 3);
  const more = deck.slice(3);
  const h = HERO[lane];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)} · Elizabeth Beier</title>
<meta name="description" content="${attr(m.metaDesc)}">
<meta name="author" content="Elizabeth Beier">
<meta name="theme-color" content="#17121C">
<!-- One portfolio, five arrangements. Search should index the homepage, not five
     near-duplicate orderings of the same deck. -->
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="https://elizabethbportfolio.com/">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:title" content="${attr(m.title)} · Elizabeth Beier">
<meta property="og:description" content="${attr(m.metaDesc)}">
<link rel="stylesheet" href="styles.css">
</head>
<body data-lane="${lane}">
<a class="skip" href="#main">Skip to content</a>
${nav(lane)}
<main id="main">

<section class="lp-hero"><div class="wrap">
${pills(lane)}
<div class="lp-hero-in">
  <div class="lp-hero-copy">
    <span class="kicker">${esc(m.navLabel)}</span>
    <h1>${esc(m.hero)}</h1>
    <p class="lede">${esc(m.sub)}</p>
    <div class="cta-row">
      <a class="btn" href="mailto:elizabethbportfolio@gmail.com">Email me</a>
      <a class="btn ghost" href="resume.html">Résumé</a>
    </div>
  </div>
  <div class="lp-hero-art"><img src="${h.src}" alt="${attr(h.alt)}" decoding="async"></div>
</div>
${proof(m)}
</div></section>

<section class="lp-sec"><div class="wrap">
<div class="sec-head"><h2>${esc(m.leadHead)}</h2><p>${esc(m.leadNote)}</p></div>
<div class="cards">${lead.map((c, i) => leadCard(c, lane, i)).join('\n')}</div>
</div></section>

${more.length ? `<section class="lp-sec"><div class="wrap">
<div class="sec-head"><h2>${esc(m.moreHead)}</h2><p>${esc(m.moreNote)}</p></div>
<div class="ltiles">${more.map((c) => tile(c, lane)).join('\n')}</div>
</div></section>` : ''}

${extraPress(m)}

<div class="contact" id="contact"><div class="wrap">
<p class="avail"><span class="pulse-dot"></span> open to marketing operations, analytics and martech roles</p>
<h2>Let’s talk.</h2>
<p>${esc(m.close[0])}</p>
<p>${esc(m.close[1])}</p>
<div class="contact-links">
<a class="clink primary" href="mailto:elizabethbportfolio@gmail.com">elizabethbportfolio@gmail.com</a>
<a class="clink" href="resume.html">résumé</a>
<a class="clink" href="https://github.com/belleofthebot" target="_blank" rel="noopener">github</a>
<a class="clink" href="https://whatthebot.vercel.app/" target="_blank" rel="noopener">belle of the bot</a>
</div></div></div>

<footer><div class="wrap lanefoot-wrap">${laneFooter(lane)}</div>
<div class="wrap"><span>elizabeth beier · albuquerque, new mexico</span><span>designed, built, and measured by me</span></div></footer>
</main>
<script>
/* One analytics event per lane view. Works whether the page is measured by a
   gtag.js snippet or by a Tag Manager container; harmless if neither is present.
   TODO: the portfolio carries no GA4 measurement ID yet. See the delivery note. */
(function () {
  var lane = document.body.getAttribute('data-lane');
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'lane_view', lane: lane });
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'lane_view', { lane: lane, page_group: 'lane_page' });
  }
})();

/* The work menu is a native <details>, so it opens with Enter or Space and is
   reachable by keyboard with no script at all. This only adds the two niceties
   a native disclosure does not give you: Escape closes it, and so does a click
   outside. Focus returns to the summary on Escape. */
(function () {
  var d = document.getElementById('wdrop');
  if (!d) return;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && d.open) { d.open = false; d.querySelector('summary').focus(); }
  });
  document.addEventListener('click', function (e) {
    if (d.open && !d.contains(e.target)) d.open = false;
  });
})();
</script>
</body>
</html>
`;
}

let n = 0;
for (const lane of LANES) {
  const out = path.join(ROOT, LANE_META[lane].slug + '.html');
  fs.writeFileSync(out, page(lane));
  const deck = CARDS.filter((c) => c.lanes[lane] && c.lanes[lane].rank).length;
  console.log('wrote', path.basename(out), '·', deck, 'cards shown,', CARDS.length - deck, 'held back');
  n++;
}
console.log(n + ' lane pages built from ' + CARDS.length + ' cards.');
