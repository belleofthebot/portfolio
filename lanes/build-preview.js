#!/usr/bin/env node
/* Builds ONE self-contained file so Elizabeth can review all five lanes from a
   phone with no server and no repo. Styles inlined, images inlined as data
   URIs, lane switching done in the file. Review artifact only, never deployed. */
const fs = require('fs');
const path = require('path');
const { LANES, LANE_META } = require('./cards.data.js');
const ROOT = path.resolve(__dirname, '..');

const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const cache = new Map();
function dataUri(src) {
  if (cache.has(src)) return cache.get(src);
  const f = path.join(ROOT, src);
  let out = src;
  if (fs.existsSync(f)) out = `data:${mime[path.extname(f).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;
  cache.set(src, out);
  return out;
}

const panes = LANES.map((lane) => {
  let html = fs.readFileSync(path.join(ROOT, LANE_META[lane].slug + '.html'), 'utf8');
  let main = html.slice(html.indexOf('<main id="main">') + 16, html.indexOf('</main>'));
  main = main.replace(/src="([^"]+)"/g, (m, s) => (/^(https?:|data:)/.test(s) ? m : `src="${dataUri(s)}"`));
  // In the preview every lane lives in one document, so the pill and menu links
  // switch panes instead of navigating to a file that is not next to this one.
  main = main.replace(/href="(ai|marketing|comms|nonprofit|design)\.html"/g, 'href="#$1" data-go="$1"');
  main = main.replace(/href="index\.html"/g, 'href="#" data-go="index"');
  return `<div class="pane" id="pane-${lane}"${lane === 'ai' ? '' : ' hidden'}>${main}</div>`;
}).join('\n');

const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Lane pages, preview · Elizabeth Beier</title>
<style>${css}
.pvbar{position:sticky;top:0;z-index:200;background:var(--panel);border-bottom:1px solid var(--line);
  padding:10px var(--space-4);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pvbar b{font-family:var(--mono);font-size:var(--size-mono);color:var(--mint);
  text-transform:lowercase;font-weight:400;margin-right:auto}
.pvbar button{font-family:var(--mono);font-size:var(--size-mono);text-transform:lowercase;
  padding:6px 15px;border-radius:999px;border:1px solid var(--line);background:var(--tile);
  color:var(--text-2);cursor:pointer}
.pvbar button[aria-pressed="true"]{background:var(--rose);border-color:var(--rose);color:var(--on-rose)}
.pvnote{background:var(--mint-tint);color:var(--on-mint-tint);font-size:var(--size-small);
  line-height:1.6;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--line)}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="pvbar">
  <b>lane pages · review copy</b>
  ${LANES.map((l) => `<button type="button" data-p="${l}" aria-pressed="${l === 'ai'}">${LANE_META[l].pill}</button>`).join('')}
</div>
<p class="pvnote">One file, five lanes, everything inlined so it opens from a phone with no repo and no server.
This is a review copy, not a deploy. The real pages are ai.html, marketing.html, comms.html, nonprofit.html and design.html,
and on the live site the pills and the work menu navigate to those URLs so applications can deep link a lane.</p>
<main id="main">
${panes}
</main>
<script>
(function () {
  var btns = document.querySelectorAll('.pvbar button');
  function show(lane) {
    document.querySelectorAll('.pane').forEach(function (p) { p.hidden = p.id !== 'pane-' + lane; });
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.p === lane)); });
    window.scrollTo(0, 0);
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.p); }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.go === 'index') { alert('On the live site this goes to the homepage, which is unchanged in this build.'); return; }
    show(a.dataset.go);
  });
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'LANE_PREVIEW.html'), doc);
console.log('LANE_PREVIEW.html written ·', (Buffer.byteLength(doc) / 1048576).toFixed(2), 'MB');
