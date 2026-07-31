/* The CambiumPak design system, live.
 *
 * Every surface below is driven by the same custom properties the real system
 * ships: --pine, --kraft, --moss, --paper, the type stack, the photography
 * treatment. Change one and the change propagates, because that is what a
 * token system is for and because a claim like "brand compliance enforced by
 * code" is worth nothing as a sentence.
 *
 * The harder half is the verdict panel. Colour choices in a portfolio usually
 * arrive as assertions, so this one computes: WCAG contrast against Paper,
 * CIEDE2000 separation from Kraft, and the same separation again under
 * simulated protanopia and deuteranopia, using the Vienot 1999 transform. Two
 * of the four alternatives are eliminated by those numbers.
 *
 * The other two are not, and that is the point. Teal passes every check and
 * loses on meaning. Plum scores highest of the five and loses to the one
 * constraint no colour tool knows about. That gap between what a checker can
 * settle and what it cannot is the argument this panel exists to make.
 */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- colour */

  function hex2rgb(h) {
    h = h.replace('#', '');
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; });
  }
  function toLin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function unLin(c) {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
  function rgb2hex(r, g, b) {
    return '#' + [r, g, b].map(function (x) {
      var v = Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16);
      return v.length < 2 ? '0' + v : v;
    }).join('').toUpperCase();
  }
  function relLum(h) {
    var c = hex2rgb(h).map(toLin);
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var l1 = relLum(a), l2 = relLum(b);
    if (l1 < l2) { var t = l1; l1 = l2; l2 = t; }
    return (l1 + 0.05) / (l2 + 0.05);
  }
  function rgb2lab(h) {
    var c = hex2rgb(h).map(toLin), r = c[0], g = c[1], b = c[2];
    var X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    var Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    var Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
    function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
    var fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }

  /* CIEDE2000. Long, but it is the metric that actually tracks whether two
     colours look different to a person, and a shorter formula would not. */
  function de00(h1, h2) {
    var a = rgb2lab(h1), b = rgb2lab(h2);
    var L1 = a[0], a1 = a[1], b1 = a[2], L2 = b[0], a2 = b[1], b2 = b[2];
    var C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
    var G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
    if (!isFinite(G)) G = 0;
    var a1p = (1 + G) * a1, a2p = (1 + G) * a2;
    var C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
    var h1p = (Math.atan2(b1, a1p) * 180 / Math.PI + 360) % 360;
    var h2p = (Math.atan2(b2, a2p) * 180 / Math.PI + 360) % 360;
    var dLp = L2 - L1, dCp = C2p - C1p, dhp;
    if (C1p * C2p === 0) dhp = 0;
    else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
    else dhp = h2p - h1p + 360;
    var dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);
    var Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2, hbp;
    if (C1p * C2p === 0) hbp = h1p + h2p;
    else if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) hbp = (h1p + h2p + 360) / 2;
    else hbp = (h1p + h2p - 360) / 2;
    var rad = Math.PI / 180;
    var T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) +
            0.32 * Math.cos((3 * hbp + 6) * rad) - 0.20 * Math.cos((4 * hbp - 63) * rad);
    var dth = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
    var Rc = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
    var Sl = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
    var Sc = 1 + 0.045 * Cbp, Sh = 1 + 0.015 * Cbp * T;
    var Rt = -Math.sin(2 * dth * rad) * Rc;
    return Math.sqrt(Math.pow(dLp / Sl, 2) + Math.pow(dCp / Sc, 2) +
                     Math.pow(dHp / Sh, 2) + Rt * (dCp / Sc) * (dHp / Sh));
  }

  /* Vienot, Brettel and Mollon 1999. A linear approximation, not a claim about
     anyone's experience, but it is the standard one and it is reproducible. */
  function cvd(h, kind) {
    var c = hex2rgb(h).map(toLin), r = c[0], g = c[1], b = c[2];
    var L = 17.8824 * r + 43.5161 * g + 4.11935 * b;
    var M = 3.45565 * r + 27.1554 * g + 3.86714 * b;
    var S = 0.0299566 * r + 0.184309 * g + 1.46709 * b;
    if (kind === 'p') L = 2.02344 * M - 2.52581 * S;
    else M = 0.494207 * L + 1.24827 * S;
    return rgb2hex(
      unLin(0.080944 * L - 0.130504 * M + 0.116721 * S),
      unLin(-0.010248 * L + 0.054019 * M - 0.113614 * S),
      unLin(-0.000365 * L - 0.004125 * M + 0.693513 * S));
  }

  function shift(h, amt) {
    var c = hex2rgb(h).map(function (x) {
      return amt < 0 ? x * (1 + amt) : x + (1 - x) * amt;
    });
    return rgb2hex(c[0], c[1], c[2]);
  }

  /* ------------------------------------------------------------- the options */

  var PAPER = '#F7F4ED', KRAFT = '#A87D52', MOSS = '#7D9161';

  var ACCENTS = [
    { key: 'pine', name: 'Pine', hex: '#1E4D3B', chosen: true,
      verdict: 'chosen', tone: 'ok',
      why: 'The only candidate that is dark enough to set body copy and headings, ' +
           'far enough from Kraft to survive colour blindness, and warm enough not ' +
           'to fight a brown substrate. It reads as fibre without shouting eco, ' +
           'which matters when the buyer is an operations manager who has been ' +
           'sold greenwash before.' },
    { key: 'sky', name: 'Sky blue', hex: '#3A7CA5',
      verdict: 'fails on contrast', tone: 'no',
      why: 'Separates from Kraft better than Pine does, and then cannot be used ' +
           'for the thing an accent is for. Below 4.5:1 on Paper it fails as body ' +
           'copy, as a heading and as a link. Darkening it to pass turns it navy, ' +
           'and navy on kraft board reads as electronics packaging.' },
    { key: 'orange', name: 'Burnt orange', hex: '#B4531F',
      verdict: 'passes, with no margin', tone: 'warn',
      why: 'Every check passes. Two of them pass by a hair: 15.4 against a floor ' +
           'of 15, and 9.7 against a floor of 8. A floor is a minimum, not a ' +
           'target. Pine clears that same deuteranopia check at 30.2, three times ' +
           'the margin, and margin is what absorbs a bad screen, a photocopied ' +
           'spec sheet, and water-based flexo on uncoated board. Kraft carries ' +
           'SKUs and the accent carries headings; at 9.7 a deuteranopic reader is ' +
           'being asked to tell them apart at the edge of the standard, on brown ' +
           'card, in a warehouse.' },
    { key: 'teal', name: 'Teal', hex: '#1E5F63',
      verdict: 'passes, rejected anyway', tone: 'warn',
      why: 'No measurement rejects this one. I did. Teal reads clinical: medical ' +
           'device, water utility, SaaS dashboard. The brief was sober mid-market ' +
           'B2B, faintly conservative, and teal is a 2019 startup. This is where ' +
           'the checker runs out and taste has to do the work.' },
    { key: 'plum', name: 'Plum', hex: '#5B2E4E',
      verdict: 'best numbers, disqualified', tone: 'warn',
      why: 'The highest scoring candidate of the five, and disqualified by a ' +
           'constraint no colour tool knows about: plum and rose are my own ' +
           'portfolio palette. If a generated CambiumPak deck came out in my ' +
           'colours, the demo quietly says my tool makes things in my style, when ' +
           'the whole claim is that it applies somebody else’s system.' }
  ];

  var FONTS = [
    { key: 'inter', name: 'Inter', chosen: true,
      stack: "'Inter','Source Sans 3','Helvetica Neue',Arial,sans-serif",
      verdict: 'chosen',
      why: 'One family, four weights, no display face. A spec sheet is a table of ' +
           'numbers, and Inter has tabular figures and a tall x-height that ' +
           'survives 8pt on uncoated stock. One family also means the deck ' +
           'generator has no font decision available to get wrong.' },
    { key: 'serif', name: 'Transitional serif',
      stack: "Georgia,'Times New Roman',serif",
      verdict: 'wrong register',
      why: 'Reads publisher, not manufacturer. It also costs you the table: ' +
           'old-style figures are lovely in a paragraph and a nuisance in a column ' +
           'of board grades you are meant to compare down the page.' },
    { key: 'geo', name: 'Geometric sans',
      stack: "'Futura','Century Gothic','Avenir Next',sans-serif",
      verdict: 'costs legibility',
      why: 'The single-storey a and the perfect-circle o look considered at 40pt ' +
           'and get harder to read at 10, which is where nearly all of this system ' +
           'actually lives. Most of the words in a packaging system are captions.' },
    { key: 'cond', name: 'Condensed grotesque',
      stack: "'Arial Narrow','Helvetica Neue Condensed',sans-serif",
      verdict: 'wins then loses',
      why: 'Buys column width in a spec table and gives it straight back in a ' +
           'four-badge row. The tight counters also fill in when printed ' +
           'water-based flexo on uncoated kraft, which is how these sheets are ' +
           'actually reproduced.' }
  ];

  var PHOTOS = [
    { key: 'colour', name: 'Full colour', chosen: true, verdict: 'chosen',
      why: 'Kraft brown is the product. Every photograph in the library is a ' +
           'picture of the material, and the material is the argument.' },
    { key: 'bw', name: 'Black and white', verdict: 'says less',
      why: 'Looks more designed and communicates less. It also breaks the ' +
           'recycled-content story, because you cannot see fibre colour, and ' +
           'fibre colour is how a buyer judges recycled content by eye.' },
    { key: 'duo', name: 'Duotone', verdict: 'ties the library to the accent',
      why: 'Cohesive, and it makes every photograph a derivative of the accent. ' +
           'Change the green and the whole library has to be re-rendered. Watch ' +
           'the pictures move when you change the colour above.' }
  ];

  var state = { accent: 'pine', font: 'inter', photo: 'colour' };

  function accent() { return ACCENTS.filter(function (a) { return a.key === state.accent; })[0]; }
  function font() { return FONTS.filter(function (f) { return f.key === state.font; })[0]; }
  function photo() { return PHOTOS.filter(function (p) { return p.key === state.photo; })[0]; }

  /* ------------------------------------------------------------------ metrics */

  var FLOOR_CONTRAST = 4.5, FLOOR_CVD = 8;

  function metrics(hex) {
    return {
      contrast: contrast(hex, PAPER),
      kraft: de00(hex, KRAFT),
      protan: de00(cvd(hex, 'p'), cvd(KRAFT, 'p')),
      deutan: de00(cvd(hex, 'd'), cvd(KRAFT, 'd')),
      moss: de00(hex, MOSS)
    };
  }

  function metricRow(label, value, floor, unit, note, ref) {
    var pass = value >= floor;
    var fmt = function (v) { return v.toFixed(v < 20 ? 2 : 1) + (unit || ''); };
    return '<div class="dsx-m' + (pass ? '' : ' bad') + '">' +
      '<span class="dsx-ml">' + label + '</span>' +
      '<span class="dsx-mv">' + fmt(value) + '</span>' +
      '<span class="dsx-mf">floor ' + floor +
        (ref == null ? '' : ' \u00b7 pine ' + fmt(ref)) + '</span>' +
      '<span class="dsx-mp">' + (pass ? 'pass' : 'fail') + '</span>' +
      (note ? '<span class="dsx-mn">' + note + '</span>' : '') +
      '</div>';
  }

  /* --------------------------------------------------------------- rendering */

  function applyTokens(root) {
    var a = accent(), hex = a.hex;
    var s = root.style;
    s.setProperty('--pine', hex);
    s.setProperty('--pine-deep', shift(hex, -0.32));
    s.setProperty('--pine-mid', shift(hex, 0.18));
    s.setProperty('--pine-tint', shift(hex, 0.88));
    s.setProperty('--badge-bd', shift(hex, 0.72));
    /* Moss is deliberately not set here. It carries recycled-content figures
       and nothing else, so it is not the accent's to change. Watch the 90%
       stay green while everything around it moves: that is rule two, visible. */
    s.setProperty('--dsx-font', font().stack);
    root.setAttribute('data-photo', state.photo);

    /* the duotone ramp is built from the live accent, so switching the colour
       re-renders every photograph rather than leaving a stale tint behind */
    var dark = hex2rgb(shift(hex, -0.18)), light = hex2rgb(PAPER);
    ['R', 'G', 'B'].forEach(function (ch, i) {
      var f = root.querySelector('#dsxDuo' + ch);
      if (f) f.setAttribute('tableValues', dark[i].toFixed(4) + ' ' + light[i].toFixed(4));
    });
  }

  function chips(list, group, cur) {
    return list.map(function (o) {
      var sw = o.hex ? '<i style="background:' + o.hex + '"></i>' : '';
      return '<button type="button" class="dsx-c' + (o.key === cur ? ' on' : '') +
        (o.chosen ? ' isch' : '') + '" data-g="' + group + '" data-k="' + o.key + '">' +
        sw + o.name + (o.chosen ? '<b>chosen</b>' : '') + '</button>';
    }).join('');
  }

  function verdict(root) {
    var a = accent(), m = metrics(a.hex), f = font(), p = photo();
    var kindClass = a.tone === 'ok' ? 'ok' : (a.tone === 'no' ? 'no' : 'hmm');
    /* what shipped, alongside, so a thin pass reads as thin */
    var base = a.chosen ? null : metrics(ACCENTS[0].hex);
    var r = function (k) { return base ? base[k] : null; };

    var numbers =
      metricRow('Contrast against Paper', m.contrast, FLOOR_CONTRAST, ':1',
                'body copy, headings and links all sit on Paper', r('contrast')) +
      metricRow('Separation from Kraft', m.kraft, 15, ' ΔE',
                'Kraft carries SKUs and must never be mistaken for the accent', r('kraft')) +
      metricRow('Separation, protanopia', m.protan, FLOOR_CVD, ' ΔE', '', r('protan')) +
      metricRow('Separation, deuteranopia', m.deutan, FLOOR_CVD, ' ΔE',
                'about one man in twelve', r('deutan')) +
      metricRow('Separation from Moss', m.moss, 15, ' ΔE',
                'Moss carries recycled figures and nothing else', r('moss'));

    root.querySelector('.dsx-verdict').innerHTML =
      '<div class="dsx-vh dsx-' + kindClass + '">' +
        '<span class="dsx-vk">' + a.name + ' · ' + a.verdict + '</span>' +
        '<p>' + a.why + '</p>' +
      '</div>' +
      '<div class="dsx-nums">' + numbers + '</div>' +
      '<div class="dsx-two">' +
        '<div class="dsx-vsm"><span class="dsx-vk">' + f.name + ' · ' + f.verdict +
        '</span><p>' + f.why + '</p></div>' +
        '<div class="dsx-vsm"><span class="dsx-vk">' + p.name + ' · ' + p.verdict +
        '</span><p>' + p.why + '</p></div>' +
      '</div>';
  }

  function render(root) {
    applyTokens(root);
    root.querySelector('.dsx-accents').innerHTML = chips(ACCENTS, 'accent', state.accent);
    root.querySelector('.dsx-fonts').innerHTML = chips(FONTS, 'font', state.font);
    root.querySelector('.dsx-photos').innerHTML = chips(PHOTOS, 'photo', state.photo);
    verdict(root);

    var off = ACCENTS.filter(function (a) { return !a.chosen; })
      .some(function (a) { return a.key === state.accent; }) ||
      state.font !== 'inter' || state.photo !== 'colour';
    root.querySelector('.dsx-reset').hidden = !off;
  }

  function init() {
    var root = document.getElementById('dsx');
    if (!root) return;
    root.addEventListener('click', function (e) {
      var c = e.target.closest('.dsx-c');
      if (c) {
        state[c.getAttribute('data-g')] = c.getAttribute('data-k');
        render(root);
        return;
      }
      if (e.target.closest('.dsx-reset')) {
        state = { accent: 'pine', font: 'inter', photo: 'colour' };
        render(root);
      }
    });
    render(root);
  }

  global.DSX = { init: init, metrics: metrics, de00: de00, contrast: contrast, cvd: cvd };
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
