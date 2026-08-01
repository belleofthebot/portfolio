/* The website case study, operable.
 *
 * The site was built by an agency, under contract, and the contract decided
 * what could be touched. Presentation layer in house, anything needing a child
 * theme file routed back to them. So the whole job lived in one stylesheet
 * loaded after theirs, and the only question was how that stylesheet wins.
 *
 * Everything below runs in a real iframe with two real stylesheets, so the
 * cascade genuinely resolves. Nothing here is a picture of a cascade. Switch
 * the approach and the same rendered result is produced twice, once by
 * bludgeoning with !important and once by matching the theme on specificity.
 * The output is identical; the file you hand over is not.
 *
 * The third control is the honest one. One selector had no handle except its
 * position in the document, and no amount of discipline fixes that from the
 * presentation layer. Insert a section and it styles the wrong block, under
 * either approach. That is not a bug this demo hides: it is the thing that got
 * written into the handoff and escalated to the agency, and the fix needs a
 * class only they can add.
 */
(function (global) {
  'use strict';

  var state = { approach: 'spec', page: 'built', handle: 'positional' };

  /* ------------------------------------------------------------ the theme */
  /* Deep descendant selectors, the way an agency theme actually ships. Nothing
     here is !important: the theme is not being unreasonable, it is just
     specific, and that is enough to make a naive override fail silently. */
  var THEME = [
    '.site .page .hero{background:#5B6B76;padding:38px 26px;color:#fff}',
    '.site .page .hero h1{font:600 27px/1.15 Georgia,serif;margin:0 0 8px;color:#fff}',
    '.site .page .hero p{font:15px/1.5 Georgia,serif;margin:0;color:#D6DDE1}',
    '.site .page .hero .cta{display:inline-block;margin-top:16px;background:#8FA1AC;',
    '  color:#fff;padding:10px 18px;border-radius:2px;font:600 13px system-ui}',
    '.site .page .trust{background:#EDEDEA;padding:16px 26px;display:flex;gap:26px;',
    '  flex-wrap:wrap;justify-content:center}',
    '.site .page .trust .t{font:13px/1.4 Georgia,serif;color:#6A6A66}',
    '.site .page .tiles{padding:22px 26px;display:grid;',
    '  grid-template-columns:repeat(3,1fr);gap:14px;background:#fff}',
    '.site .page .tiles .tile{border:1px solid #D9D9D5;border-radius:2px;padding:14px}',
    '.site .page .tiles .tile .h{font:600 14px/1.3 Georgia,serif;color:#333;margin:0 0 5px}',
    '.site .page .tiles .tile .d{font:12px/1.5 system-ui;color:#777;margin:0}',
    '.site .page .foot{background:#3C4750;color:#C8D0D6;padding:18px 26px;',
    '  font:12px/1.6 system-ui}'
  ].join('\n');

  /* ------------------------------------------------------- the two answers */

  /* What almost everybody writes when a theme selector will not budge. It
     works. It also means the next person cannot override anything you did
     without escalating to !important themselves, and the file stops being
     readable as a set of decisions. */
  var FORCE = [
    '.hero{background:#1E4D3B !important;padding:44px 30px !important}',
    '.hero h1{font-family:Inter,system-ui,sans-serif !important;font-size:32px !important;',
    '  font-weight:700 !important;letter-spacing:-.6px !important;color:#F7F4ED !important}',
    '.hero p{font-family:Inter,system-ui,sans-serif !important;font-size:15px !important;',
    '  color:#C7D6CC !important}',
    '.hero .cta{background:#A87D52 !important;border-radius:5px !important;',
    '  font-family:Inter,system-ui,sans-serif !important;font-weight:600 !important;',
    '  padding:11px 20px !important}',
    '.trust{background:#F7F4ED !important;border-top:1px solid #DDD5C6 !important;',
    '  border-bottom:1px solid #DDD5C6 !important}',
    '.trust .t{font-family:Inter,system-ui,sans-serif !important;font-size:12px !important;',
    '  text-transform:uppercase !important;letter-spacing:.09em !important;',
    '  color:#8A6138 !important}',
    '__TILESEL__{border:1px solid #DDD5C6 !important;border-top:3px solid #1E4D3B !important;',
    '  border-radius:6px !important;padding:16px !important;background:#FFFDF8 !important}',
    '__TILESEL__ .h{font-family:Inter,system-ui,sans-serif !important;font-size:15px !important;',
    '  color:#1E4D3B !important}',
    '__TILESEL__ .d{font-family:Inter,system-ui,sans-serif !important;color:#6E7A70 !important}',
    '.foot{background:#143529 !important;color:#A9C4B6 !important;',
    '  font-family:Inter,system-ui,sans-serif !important}'
  ].join('\n');

  /* Same result, by matching the theme on its own terms. The class is repeated
     to raise specificity rather than reaching for the hammer, and every rule
     stays overridable by whoever comes next. */
  var SPEC = [
    '.site .page .hero.hero{background:#1E4D3B;padding:44px 30px}',
    '.site .page .hero.hero h1{font:700 32px/1.12 Inter,system-ui,sans-serif;',
    '  letter-spacing:-.6px;color:#F7F4ED}',
    '.site .page .hero.hero p{font:15px/1.55 Inter,system-ui,sans-serif;color:#C7D6CC}',
    '.site .page .hero.hero .cta{background:#A87D52;border-radius:5px;',
    '  font:600 13px Inter,system-ui,sans-serif;padding:11px 20px}',
    '.site .page .trust.trust{background:#F7F4ED;border-top:1px solid #DDD5C6;',
    '  border-bottom:1px solid #DDD5C6}',
    '.site .page .trust.trust .t{font:600 12px/1.4 Inter,system-ui,sans-serif;',
    '  text-transform:uppercase;letter-spacing:.09em;color:#8A6138}',
    '__TILESEL__{border:1px solid #DDD5C6;border-top:3px solid #1E4D3B;',
    '  border-radius:6px;padding:16px;background:#FFFDF8}',
    '__TILESEL__ .h{font:600 15px/1.3 Inter,system-ui,sans-serif;color:#1E4D3B}',
    '__TILESEL__ .d{font:12px/1.55 Inter,system-ui,sans-serif;color:#6E7A70}',
    '.site .page .foot.foot{background:#143529;color:#A9C4B6;',
    '  font:12px/1.6 Inter,system-ui,sans-serif}'
  ].join('\n');

  /* The one selector with no handle of its own, and the class that fixes it.
     Only the agency can add the class, which is why it went in the handoff
     rather than into the stylesheet. */
  var SEL = {
    positional: {
      force: '.page > section:nth-of-type(3) .tile',
      spec:  '.site .page > section:nth-of-type(3) .tile.tile'
    },
    hook: {
      force: '.cp-solutions .tile',
      spec:  '.site .page .cp-solutions.cp-solutions .tile'
    }
  };

  function sheet() {
    var base = state.approach === 'force' ? FORCE : SPEC;
    var sel = SEL[state.handle][state.approach];
    return base.split('__TILESEL__').join(sel);
  }

  /* ---------------------------------------------------------------- markup */

  function page() {
    var tiles =
      '<section class="tiles cp-solutions">' +
        '<div class="tile"><p class="h">Protective</p><p class="d">Corner, wrap and void fill for fragile goods.</p></div>' +
        '<div class="tile"><p class="h">Shipping</p><p class="d">Cartons and mailers, flat packed, tape free.</p></div>' +
        '<div class="tile"><p class="h">Retail ready</p><p class="d">Trays and inserts that go straight to shelf.</p></div>' +
      '</section>';

    var hero =
      '<section class="hero"><h1>Ship in paper. Ship in style.</h1>' +
      '<p>Eleven product families. Seventeen SKUs. Forty-four documents.</p>' +
      '<a class="cta" href="#">Request a sample</a></section>';

    var trust =
      '<section class="trust"><span class="t">Recycled fiber</span>' +
      '<span class="t">Tape-free closure</span><span class="t">Made in New Mexico</span></section>';

    /* The agency drops a promo band in above solutions, without telling
       anyone. It is a tile band too, which is what makes the positional
       selector land on it rather than simply fall off. */
    var promo =
      '<section class="tiles cp-promo">' +
        '<div class="tile"><p class="h">Winter freight</p><p class="d">Rates held through February.</p></div>' +
        '<div class="tile"><p class="h">Order by 15 Dec</p><p class="d">For delivery before the shutdown.</p></div>' +
        '<div class="tile"><p class="h">Sample packs</p><p class="d">Two working days, no charge.</p></div>' +
      '</section>';

    var body = state.page === 'moved'
      ? hero + trust + promo + tiles
      : hero + trust + tiles;

    return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style>html,body{margin:0;background:#fff}' + THEME + '</style>' +
      '<style>' + sheet() + '</style></head>' +
      '<body><div class="site"><div class="page">' + body +
      '<section class="foot">CambiumPak &middot; agency build, presentation layer reworked in house</section>' +
      '</div></div></body></html>';
  }

  /* --------------------------------------------------------------- metrics */

  function specificity(sel) {
    var s = sel.replace(/\s*[>+~]\s*/g, ' ').trim();
    var ids = (s.match(/#[\w-]+/g) || []).length;
    var cls = (s.match(/\.[\w-]+/g) || []).length +
              (s.match(/\[[^\]]+\]/g) || []).length +
              (s.match(/:(?!:)(?!nth-of-type|nth-child|not)[\w-]+/g) || []).length +
              (s.match(/:nth-of-type\([^)]*\)|:nth-child\([^)]*\)/g) || []).length;
    var el = (s.split(/\s+/).filter(function (p) {
      return /^[a-z]/i.test(p.replace(/[.#:\[].*$/, '')) && p.replace(/[.#:\[].*$/, '');
    })).length;
    return [ids, cls, el];
  }

  function stats() {
    var css = sheet();
    var bangs = (css.match(/!important/g) || []).length;
    var sels = css.split('}').map(function (b) { return b.split('{')[0].trim(); })
                  .filter(Boolean);
    var deepest = [0, 0, 0], deepSel = '';
    sels.forEach(function (s) {
      var sp = specificity(s);
      var v = sp[0] * 10000 + sp[1] * 100 + sp[2];
      var d = deepest[0] * 10000 + deepest[1] * 100 + deepest[2];
      if (v > d) { deepest = sp; deepSel = s; }
    });
    return {
      bangs: bangs,
      rules: sels.length,
      deepest: deepest.join(','),
      deepSel: deepSel,
      positional: (css.match(/:nth-of-type|:nth-child/g) || []).length
    };
  }

  /* -------------------------------------------------------------- rendering */

  function esc(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function note() {
    var broken = state.page === 'moved' && state.handle === 'positional';
    if (broken) {
      return '<div class="cx-note cx-bad"><b>The wrong section is styled.</b> ' +
        'The agency dropped a promo band in above solutions, and the only handle ' +
        'that selector had was <em>third section on the page</em>. The promo band ' +
        'is now wearing the solutions treatment and the tiles have reverted to ' +
        'the theme. Note what did <em>not</em> save it: the approach toggle. ' +
        'Force and specificity break identically, because the fragility is in the ' +
        'handle, not in the weight.</div>';
    }
    if (state.page === 'moved') {
      return '<div class="cx-note cx-ok"><b>Holds.</b> The section moved and the ' +
        'styling went with it, because it is attached to a class on the section ' +
        'rather than to its position. This is the class I asked the agency for. ' +
        'Adding it is a child theme change, which the contract put on their side ' +
        'of the line, so it went into the handoff as a request rather than into ' +
        'my stylesheet as a fix.</div>';
    }
    if (state.handle === 'positional') {
      return '<div class="cx-note"><b>Works, and I flagged it anyway.</b> One ' +
        'selector had nothing to hold on to except its position in the document. ' +
        'It renders correctly today. Switch the page above to see what it does ' +
        'the first time somebody adds a section.</div>';
    }
    return '<div class="cx-note cx-ok"><b>Durable.</b> Every selector is anchored ' +
      'to a class, so nothing here depends on the order of the page.</div>';
  }

  function render(root) {
    var st = stats();
    root.querySelectorAll('[data-g]').forEach(function (b) {
      b.classList.toggle('on', state[b.getAttribute('data-g')] === b.getAttribute('data-k'));
    });

    /* The tiles are the thing that breaks, so the frame has to be tall enough
       to show them. Size it to its own content rather than guessing. */
    var fr = root.querySelector('#cx-frame');
    fr.onload = function () {
      try {
        var h = fr.contentDocument.body.scrollHeight;
        fr.style.height = Math.min(Math.max(h + 2, 320), 720) + 'px';
      } catch (e) { /* nothing to do, the CSS height stands */ }
    };
    fr.srcdoc = page();
    root.querySelector('.cx-code').textContent = sheet();

    root.querySelector('.cx-stats').innerHTML =
      '<div class="cx-s' + (st.bangs ? ' bad' : ' good') + '">' +
        '<b>' + st.bangs + '</b><span>!important declarations</span></div>' +
      '<div class="cx-s"><b>' + st.rules + '</b><span>rules in the override sheet</span></div>' +
      '<div class="cx-s"><b>' + st.deepest + '</b><span>deepest specificity, ids/classes/elements</span></div>' +
      '<div class="cx-s' + (st.positional ? ' bad' : ' good') + '">' +
        '<b>' + st.positional + '</b><span>selectors that depend on page order</span></div>';

    root.querySelector('.cx-verdict').innerHTML = note();
  }

  function init() {
    var root = document.getElementById('cssx');
    if (!root) return;
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]');
      if (!b) return;
      state[b.getAttribute('data-g')] = b.getAttribute('data-k');
      render(root);
    });
    render(root);
  }

  global.CSSX = { init: init, stats: stats, sheet: sheet, specificity: specificity };
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
