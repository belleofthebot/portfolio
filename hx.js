/* The hero, one change at a time.
 *
 * Nine changes were made to the home page hero. Each one is a toggle here, so
 * the before and the after are not two pictures with a slider between them:
 * they are the same hero with nine decisions switched off and on, and you can
 * see what each decision was actually for.
 *
 * The hero renders in an iframe at a true 1280 and is scaled down to fit the
 * panel, so every number quoted below is the number in the stylesheet. The
 * 72px headline is 72px. Nothing here is a proportional approximation.
 *
 * The content is CambiumPak and the accent is Pine. The real site is my
 * employer's, and the brand blue in the original stylesheet is identifiably
 * theirs, so it is swapped. What is not swapped is the work: every change,
 * every measurement and every reason below is what was actually done, taken
 * from the stylesheet dated 2 June 2026.
 */
(function (global) {
  'use strict';

  var W = 1280;

  var CHANGES = [
    { key: 'bleed', on: true, name: 'Full bleed, edge to edge',
      before: 'Constrained inside a max-width container with side padding',
      after: 'max-width: 100%, padding zeroed',
      why: 'The imagery reads as immersive rather than boxed. A hero inside a ' +
           'content column is a picture of a hero.' },
    { key: 'gap', on: true, name: 'Dead white bar removed',
      before: 'Inherited section padding left a white gap above the hero',
      after: 'Top and bottom padding removed at section level',
      why: 'The hero starts immediately under the nav. The gap was not a ' +
           'decision anybody made, it was inheritance.' },
    { key: 'height', on: true, name: 'Minimum height, 600px',
      before: 'Height driven by content, so it collapsed short',
      after: 'min-height: 600px on the slide',
      why: 'Consistent presence above the fold regardless of how much copy the ' +
           'page happens to carry.' },
    { key: 'cover', on: true, name: 'Image actually fills the frame',
      before: 'Background image not filling its container',
      after: 'position: absolute, 100% × 100%, object-fit: cover',
      why: 'The photography fills the frame at every viewport instead of ' +
           'letterboxing at some of them.' },
    { key: 'align', on: true, name: 'Text bottom-left',
      before: 'Centred',
      after: 'Bottom-left, left-aligned, capped at 700px, 80px side and 70px bottom',
      why: 'Left alignment reads faster, and bottom-left leaves the subject of ' +
           'the photograph visible instead of sitting on top of it.' },
    { key: 'grad', on: true, name: 'Gradient behind the text',
      before: 'Text sat directly on the photo, so legibility varied by image',
      after: 'Left-to-right dark gradient, 85% → 60% → 30% → 0%',
      why: 'Guarantees contrast over any photograph without darkening the whole ' +
           'image. A flat scrim would have cost the picture.' },
    { key: 'head', on: true, name: 'Headline at editorial scale',
      before: 'Default theme size and weight',
      after: '72px / 700 / 1.05, white, over a 3px brand rule',
      why: 'Editorial scale, and the rule ties the hero to the brand colour ' +
           'without dropping a logo lockup into the picture.' },
    { key: 'tiers', on: true, name: 'Two-tier body copy',
      before: 'One undifferentiated paragraph style',
      after: 'Tagline 26px / 400 solid white; supporting copy 20px / 300 at 85%',
      why: 'Creates a reading order inside the hero, so the eye knows which of ' +
           'the two lines is the promise and which is the detail.' }
  ];

  /* The ninth change is conditional, so it needs a second page to prove it. */
  var GRACE = {
    key: 'grace', on: true, name: 'The tagline treatment is conditional',
    before: '—',
    after: '.hero p:first-of-type:not(:last-of-type)',
    why: 'The two-tier treatment only applies when there are two or more ' +
         'paragraphs. On a page with a single-paragraph hero it stands down and ' +
         'the copy renders as ordinary body text, instead of a lonely 26px line ' +
         'that was never designed for.'
  };

  var state = { on: {}, paras: 2 };
  CHANGES.concat([GRACE]).forEach(function (c) { state.on[c.key] = true; });

  function all(v) {
    CHANGES.concat([GRACE]).forEach(function (c) { state.on[c.key] = v; });
  }
  function count() {
    return CHANGES.concat([GRACE]).filter(function (c) { return state.on[c.key]; }).length;
  }

  /* ------------------------------------------------------------ the markup */

  function doc() {
    var s = state.on;
    var css = [
      'html,body{margin:0;background:#fff;font-family:Inter,system-ui,Arial,sans-serif}',
      '.wrap{' + (s.bleed ? 'max-width:100%;padding:0' : 'max-width:1040px;margin:0 auto;padding:0 40px') + '}',
      '.sec{' + (s.gap ? 'padding:0' : 'padding:34px 0') + ';background:#fff}',
      '.hero{position:relative;overflow:hidden;' +
        (s.height ? 'min-height:600px;' : '') +
        'display:flex;' +
        (s.align ? 'align-items:flex-end;justify-content:flex-start'
                 : 'align-items:center;justify-content:center') + '}',
      '.hero img{' + (s.cover
        ? 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'
        : 'position:absolute;top:0;left:50%;transform:translateX(-50%);height:100%;width:auto;max-width:none') + '}',
      '.scrim{position:absolute;inset:0;background:' + (s.grad
        ? 'linear-gradient(to right,rgba(12,20,15,.85) 0%,rgba(12,20,15,.60) 34%,rgba(12,20,15,.30) 62%,rgba(12,20,15,0) 100%)'
        : 'rgba(30,62,48,.32)') + '}',
      '.txt{position:relative;' +
        (s.align ? 'max-width:700px;padding:0 80px 70px;text-align:left'
                 : 'max-width:760px;padding:64px 40px;text-align:center;margin:0 auto') + '}',
      '.txt h1{color:#fff;margin:0 0 14px;' + (s.head
        ? 'font-size:72px;font-weight:700;line-height:1.05;letter-spacing:-1.5px'
        : 'font-size:38px;font-weight:600;line-height:1.2') + '}',
      s.head ? '.rule{display:block;width:64px;height:3px;background:#A87D52;margin:0 0 22px' +
               (s.align ? '' : ';margin-left:auto;margin-right:auto') + '}'
             : '.rule{display:none}',
      s.tiers
        ? '.txt p:first-of-type:not(:last-of-type){font-size:26px;font-weight:400;' +
          'color:#fff;margin:0 0 10px;line-height:1.35}' +
          '\n.txt p{font-size:20px;font-weight:300;color:rgba(255,255,255,.85);' +
          'margin:0;line-height:1.5}'
        : '.txt p{font-size:19px;font-weight:400;color:#EAF0EC;margin:0 0 10px;line-height:1.5}',
      /* with the conditional switched off, the tagline rule applies to any
         first paragraph, including one that is also the last */
      (!s.grace && s.tiers)
        ? '.txt p:first-of-type{font-size:26px;font-weight:400;color:#fff;margin:0 0 10px}'
        : '',
      '.mark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
        'width:520px;opacity:.10}',
      '.cta{display:inline-block;margin-top:24px;background:' +
        (s.head ? '#A87D52;border-radius:5px;padding:13px 24px;font-weight:600;font-size:15px'
                : '#fff;color:#1E4D3B;border-radius:999px;padding:13px 30px;font-weight:700;font-size:14px;letter-spacing:.06em') +
        ';color:' + (s.head ? '#fff' : '#1E4D3B') + ';text-decoration:none}'
    ].join('\n');

    var paras = state.paras === 2
      ? '<p>Eleven product families, seventeen SKUs.</p>' +
        '<p>Corrugated, moulded pulp and paper void fill, specified from one record and documented to the same standard.</p>'
      : '<p>Corrugated, moulded pulp and paper void fill, specified from one record and documented to the same standard.</p>';

    return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head>' +
      '<body><div class="wrap"><section class="sec"><div class="hero">' +
      '<img src="cp-scene-forest.jpg" alt="">' +
      '<svg class="mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">' +
      '<g stroke="#fff" stroke-width="9"><path d="M50 82 A18 18 0 0 1 50 46"/>' +
      '<path d="M50 98 A34 34 0 0 1 50 30"/><path d="M50 54 A18 18 0 0 0 50 18"/>' +
      '<path d="M50 70 A34 34 0 0 0 50 2"/></g></svg>' +
      '<div class="scrim"></div>' +
      '<div class="txt"><h1>Ship in paper.<br>Ship in style.</h1><span class="rule"></span>' +
      paras + '<a class="cta" href="#">' +
      (state.on.head ? 'Request a sample' : 'EXPLORE OUR RANGE') + '</a></div>' +
      '</div></section></div></body></html>';
  }

  /* ---------------------------------------------------------------- render */

  function esc(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function list() {
    return CHANGES.concat([GRACE]).map(function (c, i) {
      var on = state.on[c.key];
      return '<button type="button" class="hx-ch' + (on ? ' on' : '') +
        '" data-ch="' + c.key + '" aria-pressed="' + on + '">' +
        '<span class="hx-n">' + (i + 1) + '</span>' +
        '<span class="hx-b">' +
          '<span class="hx-name">' + esc(c.name) + '</span>' +
          '<span class="hx-ba"><em>was</em> ' + esc(c.before) + '</span>' +
          '<span class="hx-ba"><em>now</em> ' + esc(c.after) + '</span>' +
          '<span class="hx-why">' + esc(c.why) + '</span>' +
        '</span></button>';
    }).join('');
  }

  function fit(root) {
    var box = root.querySelector('.hx-stage');
    if (!box || !box.clientWidth) return;
    var k = box.clientWidth / W;
    var fr = root.querySelector('#hx-frame');
    fr.style.transform = 'scale(' + k + ')';
    box.style.height = Math.round(fr.offsetHeight * k) + 'px';
  }

  function render(root) {
    var fr = root.querySelector('#hx-frame');
    fr.onload = function () {
      try {
        fr.style.height = fr.contentDocument.body.scrollHeight + 'px';
      } catch (e) { /* leave the CSS height */ }
      fit(root);
    };
    fr.srcdoc = doc();

    root.querySelector('.hx-list').innerHTML = list();
    var n = count();
    root.querySelector('.hx-count').textContent =
      n === 9 ? 'all nine applied — as shipped'
              : (n === 0 ? 'none applied — as the agency delivered it'
                         : n + ' of 9 applied');
    root.querySelectorAll('[data-paras]').forEach(function (b) {
      b.classList.toggle('on', +b.getAttribute('data-paras') === state.paras);
    });
    root.querySelector('.hx-grace').hidden = !(state.paras === 1);
  }

  function init() {
    var root = document.getElementById('hx');
    if (!root) return;
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-ch]');
      if (c) { var k = c.getAttribute('data-ch'); state.on[k] = !state.on[k]; render(root); return; }
      var a = e.target.closest('[data-all]');
      if (a) { all(a.getAttribute('data-all') === 'on'); render(root); return; }
      var p = e.target.closest('[data-paras]');
      if (p) { state.paras = +p.getAttribute('data-paras'); render(root); }
    });
    global.addEventListener('resize', function () { fit(root); });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
      document.addEventListener(ev, function () { setTimeout(function () { fit(root); }, 60); });
    });
    render(root);
  }

  global.HeroX = { init: init, doc: doc };
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
