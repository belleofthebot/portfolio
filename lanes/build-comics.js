#!/usr/bin/env node
/* Builds one reader page per published comic, from the per-story panels.json
   manifests plus the normalised images in /comics. Run: node lanes/build-comics.js */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = '/root/comics';
const files = JSON.parse(fs.readFileSync(SRC + '/manifest_files.json', 'utf8'));

const STORIES = [
  { dir:'nib', slug:'nib-prop8',
    title:'It’s Been a Decade Since Prop 8. Marriage Equality Isn’t Enough.',
    outlet:'The Nib', outletUrl:'https://thenib.com/', role:'Written and illustrated by Elizabeth Beier',
    dek:'Ten years after California voted to take marriage away, three organisers on what was won, what was not, and who is still being targeted.',
    note:'This piece reports on family rejection and includes a statistic on suicide among queer teenagers.' },
  { dir:'stonewall', slug:'lily-stonewall',
    title:'I went to the Stonewall Inn expecting history. I found something better.',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Reported, written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'A reported visit to the bar where Pride began, fifty years on, where the merchandise is louder than the plaque and the people are the point.' },
  { dir:'convo', slug:'lily-conversation',
    title:'Ten steps for talking to someone you love about something you deeply disagree on',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'A service comic, built as ten numbered steps, on having the conversation instead of avoiding it.' },
  { dir:'weight', slug:'lily-weight',
    title:'Weight, health, and appearance',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'On the contradictory noise about women’s bodies that gets loudest every January, and on drawing a quiet circle inside it.',
    note:'This piece is about diet culture and messages women receive about body size.' },
  { dir:'scotus', slug:'lily-scotus',
    title:'The Supreme Court will decide whether LGBT workers can be fired for who they are',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'An explainer on three employment discrimination cases, the state by state patchwork underneath them, and what the ruling could reach.' },
  { dir:'sa', slug:'lily-openletter',
    title:'An open letter to anyone who is suffering after a rape',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'What helped, offered directly, from one survivor to another.',
    note:'This piece is written for survivors and is about recovering after a rape.',
    resource:'The comic closes with RAINN, which runs a 24 hour hotline at <a href="https://www.rainn.org/" target="_blank" rel="noopener">rainn.org</a>.' },
  { dir:'hm', slug:'lily-goosebumps',
    title:'The Haunted Mask, and learning to love reading',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'On growing up inside R. L. Stine’s Goosebumps, and the one that stuck.' },
  { dir:'safeprotest', slug:'lily-safeprotest',
    title:'How to protest safely',
    outlet:'The Lily', outletUrl:'https://www.thelily.com/', role:'Written and illustrated by Elizabeth Beier · Art direction by Rachel Orr',
    dek:'A do’s and don’ts guide for the street: eyes, masks, water, heat, gas, phones, medics and your rights if detained.',
    note:'This guide was drawn in 2020 and reflects the conditions and public health advice of that moment. It refers to tear gas, pepper spray and police detention. Treat it as a record of the piece as published, not as current safety advice.' },
];

const esc = s => String(s).replace(/&(?![a-z#0-9]+;)/gi,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function page(st, panels) {
  const map = new Map(files[st.dir].panels.map(p => [p.orig, p]));
  const imgs = panels.map(p => {
    const f = map.get(p.file);
    if (!f) return null;
    return `<figure class="cpanel"><img src="comics/${f.file}" width="${f.w}" height="${f.h}" loading="lazy" decoding="async" alt="${esc(p.alt)}"></figure>`;
  }).filter(Boolean);

  const note = st.note ? `<div class="cnote"><p class="h">before you read</p><p>${esc(st.note)}</p>${
    st.resource ? `<p>${st.resource}</p>` : ''}</div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(st.title)} · Elizabeth Beier</title>
<meta name="description" content="${esc(st.dek)}">
<meta name="author" content="Elizabeth Beier">
<meta name="theme-color" content="#17121C">
<!-- Republished by the author on her own site. The outlet holds first publication;
     noindex keeps this out of search so it does not compete with the original. -->
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to the comic</a>
<header class="nav"><div class="nav-in">
<a class="mark" href="index.html">elizabeth<span class="bot">beier</span><span class="cur">_</span></a>
<a class="link" href="index.html">work</a><a class="link" href="resume.html">résumé</a><a class="link" href="work-comics-journalism.html">journalism</a><a class="link" href="index.html#contact">contact</a></div></header>
<main id="main">
<div class="wrap narrow case-hero">
<a class="backlink" href="work-comics-journalism.html">← back to comics journalism</a>
<span class="kicker">${esc(st.outlet.toLowerCase())} · ${panels.length} panels</span>
<h1>${esc(st.title)}</h1>
<p class="meta">${esc(st.role)}</p>
<p class="oneline">${esc(st.dek)}</p>
</div>
<div class="wrap narrow">
${note}
<div class="comic">
${imgs.join('\n')}
</div>
<div class="cfoot">
<p>Originally published by <a href="${st.outletUrl}" target="_blank" rel="noopener">${esc(st.outlet)}</a>. Republished here by the author, who holds the rights. Every panel carries a description for screen readers.</p>
<p><a class="backlink" href="work-comics-journalism.html">← all comics journalism</a></p>
</div>
</div>
<div class="contact"><div class="wrap">
<p class="avail"><span class="pulse-dot"></span> open to communications, content and editorial roles</p>
<h2>Let’s talk.</h2>
<p>If you have something complicated that has to land with people who are not paid to care, that is the work I want.</p>
<div class="contact-links">
<a class="clink primary" href="mailto:elizabethbportfolio@gmail.com">elizabethbportfolio@gmail.com</a>
<a class="clink" href="resume.html">résumé</a>
<a class="clink" href="work-comics-journalism.html">more journalism</a>
</div></div></div>
<footer><div class="wrap"><span>elizabeth beier · albuquerque, new mexico</span><span>designed, built, and measured by me</span></div></footer>
</main>
</body>
</html>
`;
}

const index = [];
for (const st of STORIES) {
  const panels = JSON.parse(fs.readFileSync(`${SRC}/${st.dir}/panels.json`, 'utf8'));
  const html = page(st, panels);
  fs.writeFileSync(path.join(ROOT, `read-${st.slug}.html`), html);
  index.push({ ...st, count: panels.length, href: `read-${st.slug}.html` });
  console.log('wrote read-' + st.slug + '.html ·', panels.length, 'panels');
}
fs.writeFileSync(SRC + '/stories.json', JSON.stringify(index, null, 1));
console.log(STORIES.length + ' readers built, ' + index.reduce((a,b)=>a+b.count,0) + ' panels total.');
