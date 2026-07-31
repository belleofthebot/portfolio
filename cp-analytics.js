/* CambiumPak analytics dashboard — the interactive demonstrator.
 *
 * Every number here is invented. It is generated from a seeded pseudo-random
 * series rather than typed, so the parts stay consistent with each other: the
 * tiles agree with the charts, the per-family splits sum to the total, and the
 * funnel stages are monotonic. A dashboard whose totals do not add up is worse
 * than no dashboard, and that is as true of a demonstration as of a real one.
 *
 * The point of the page is the toggle. Almost everything a packaging
 * manufacturer needs to know about its own site is invisible in a default
 * analytics install: which document a buyer opened, for which product, and
 * whether they came back for a sample. Switching to "default install" empties
 * those panels, which is the argument made in one interaction rather than in
 * three paragraphs.
 *
 * Colour note. The brand pair, Pine #1E4D3B and Kraft #A87D52, fails two of the
 * six palette checks — the lightness band and the chroma floor — because the
 * brand is deliberately deep and desaturated. It passes the checks that decide
 * whether a reader can actually tell two series apart: CVD separation dE 20.3
 * on protanopia against a floor of 8, normal-vision dE 26.3 against a floor of
 * 15, and contrast against Paper above 3:1. Lightening Pine to satisfy the band
 * dropped CVD separation to 10.3, so the brand value is also the accessible one.
 * Magnitude charts use a single-hue Pine ramp; the two-hue pair appears only
 * where two series must be distinguished, and both carry direct labels anyway.
 */
(function (global) {
  'use strict';

  var PINE = '#1E4D3B', PINE_MID = '#2F6B52', PINE_SOFT = '#8FAC9D',
      KRAFT = '#A87D52', KRAFT_DEEP = '#8A6138',
      INK = '#232A26', PAPER = '#F7F4ED', HAIR = '#DDD5C6', MUTE = '#6E7A70';

  /* single-hue ramp for magnitude, light to dark, monotonic in lightness */
  var RAMP = ['#C3D2C8', '#9CB6A6', '#6E937E', '#47765C', '#1E4D3B'];

  var DAYS = 120;

  /* --------------------------------------------------------------- the data */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var FAMILIES = [
    ['CP-CTN', 'Shipping carton, RSC', 0.235],
    ['CP-MLR', 'Corrugated mailer', 0.205],
    ['CP-PPE', 'Paper-padded envelope', 0.115],
    ['CP-VF-HC24', 'Honeycomb wrap', 0.098],
    ['CP-PLP-T12', 'Pulp tray, 12 cavity', 0.082],
    ['CP-BWM', 'Book-wrap mailer', 0.071],
    ['CP-TP', 'Water-activated tape', 0.063],
    ['CP-DIV', 'Divider inserts', 0.048],
    ['CP-VF-CR18', 'Crinkle void fill', 0.033],
    ['CP-PLP-T06', 'Pulp tray, 6 cavity', 0.028],
    ['CP-PLP-CNR', 'Corner protector', 0.022]
  ];

  var SHEETS = [
    ['Spec sheet', 0.44], ['Comparison sheet', 0.21],
    ['Features and benefits', 0.20], ['Assembly instructions', 0.15]
  ];

  var USERS = [['Distributors', 0.58], ['Agents', 0.27], ['Internal staff', 0.15]];

  function build() {
    var days = [], rnd = mulberry32(20260731);
    var today = new Date();
    for (var i = DAYS - 1; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      var dow = d.getDay();
      var weekend = (dow === 0 || dow === 6) ? 0.38 : 1;
      var trend = 1 + (DAYS - i) / DAYS * 0.22;          // slow growth
      var noise = 0.82 + rnd() * 0.36;
      var sessions = Math.round(74 * weekend * trend * noise);

      /* a session that downloads takes more than one sheet, which is the whole
         finding: four documents, and a buyer needs three of them */
      var downloaders = Math.round(sessions * (0.24 + rnd() * 0.05));
      var perDownloader = 1.9 + rnd() * 0.5;
      var downloads = Math.round(downloaders * perDownloader);

      days.push({
        date: d,
        sessions: sessions,
        productViews: Math.round(sessions * (0.61 + rnd() * 0.08)),
        downloaders: downloaders,
        downloads: downloads,
        samples: Math.round(downloaders * (0.11 + rnd() * 0.05)),
        compares: Math.round(sessions * (0.07 + rnd() * 0.03)),
        logins: Math.round(31 * weekend * trend * (0.85 + rnd() * 0.3)),
        r: rnd()
      });
    }
    return days;
  }

  var DATA = build();

  function slice(n) { return DATA.slice(DATA.length - n); }
  function prior(n) { return DATA.slice(DATA.length - n * 2, DATA.length - n); }
  function sum(rows, k) { return rows.reduce(function (a, r) { return a + r[k]; }, 0); }

  /* split a total across weighted buckets, deterministically, and make the parts
     add back to the whole — a rounding drift here is what makes a real dashboard
     look untrustworthy */
  function split(total, weights, jitterSeed) {
    var rnd = mulberry32(jitterSeed);
    var raw = weights.map(function (w) { return total * w * (0.93 + rnd() * 0.14); });
    var s = raw.reduce(function (a, b) { return a + b; }, 0);
    var out = raw.map(function (v) { return Math.round(v / s * total); });
    out[0] += total - out.reduce(function (a, b) { return a + b; }, 0);
    return out;
  }

  /* ------------------------------------------------------------- formatting */
  function fmt(n) { return n.toLocaleString('en-US'); }
  function pct(n) { return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function delta(now, before) {
    if (!before) return null;
    return (now - before) / before * 100;
  }

  /* ---------------------------------------------------------------- charts */
  /* Every chart is hand-built SVG. No chart library, for the same reason the
     rest of this project has no dependencies: it has to open from a file with
     nothing installed. */

  function areaChart(rows, key, opts) {
    opts = opts || {};
    var W = 720, H = 190, PADL = 44, PADB = 26, PADT = 12;
    var vals = rows.map(function (r) { return r[key]; });
    var max = Math.max.apply(null, vals) * 1.12;
    var x = function (i) { return PADL + i / (rows.length - 1) * (W - PADL - 12); };
    var y = function (v) { return PADT + (1 - v / max) * (H - PADT - PADB); };

    var line = vals.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var area = line + ' L' + x(rows.length - 1).toFixed(1) + ' ' + (H - PADB) +
               ' L' + x(0).toFixed(1) + ' ' + (H - PADB) + ' Z';

    var ticks = [0, 0.5, 1].map(function (t) {
      var v = max * t, yy = y(v);
      return '<line x1="' + PADL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - 12) +
        '" y2="' + yy.toFixed(1) + '" stroke="' + HAIR + '" stroke-width="1"/>' +
        '<text x="' + (PADL - 8) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" ' +
        'class="axl">' + fmt(Math.round(v)) + '</text>';
    }).join('');

    var every = Math.max(1, Math.round(rows.length / 6));
    var xlab = rows.map(function (r, i) {
      if (i % every || i > rows.length - 3) return '';
      return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" class="axl">' +
        r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</text>';
    }).join('');

    var hot = rows.map(function (r, i) {
      return '<rect class="hit" x="' + (x(i) - (W - PADL) / rows.length / 2).toFixed(1) +
        '" y="' + PADT + '" width="' + ((W - PADL) / rows.length).toFixed(1) +
        '" height="' + (H - PADT - PADB) + '" fill="transparent"' +
        ' data-x="' + x(i).toFixed(1) + '" data-y="' + y(r[key]).toFixed(1) + '"' +
        ' data-label="' + r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        '" data-value="' + fmt(r[key]) + ' ' + esc(opts.unit || '') + '"/>';
    }).join('');

    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      esc(opts.alt || '') + '">' + ticks +
      '<path d="' + area + '" fill="' + PINE + '" fill-opacity=".10"/>' +
      '<path d="' + line + '" fill="none" stroke="' + PINE + '" stroke-width="2" ' +
      'stroke-linejoin="round"/>' + xlab +
      '<g class="cross" style="display:none"><line stroke="' + KRAFT_DEEP +
      '" stroke-width="1" stroke-dasharray="3 3"/><circle r="4.5" fill="' + PINE +
      '" stroke="' + PAPER + '" stroke-width="2"/></g>' + hot + '</svg>';
  }

  function barsChart(items, opts) {
    opts = opts || {};
    var rowH = 34, W = 720, LAB = opts.labelWidth || 176, PADR = 62;
    var H = items.length * rowH + 6;
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }));
    var body = items.map(function (it, i) {
      var y = i * rowH + 6;
      var w = Math.max(2, (it.value / max) * (W - LAB - PADR));
      var fill = opts.ramp ? RAMP[Math.min(RAMP.length - 1,
        Math.round((1 - i / Math.max(1, items.length - 1)) * (RAMP.length - 1)))] : PINE;
      return '<text x="0" y="' + (y + 16) + '" class="bl">' + esc(it.label) + '</text>' +
        '<rect class="hit bar" x="' + LAB + '" y="' + (y + 4) + '" width="' + w.toFixed(1) +
        '" height="18" rx="4" fill="' + fill + '"' +
        ' data-label="' + esc(it.label) + '" data-value="' + fmt(it.value) + ' ' +
        esc(opts.unit || '') + '"/>' +
        '<text x="' + (LAB + w + 10).toFixed(1) + '" y="' + (y + 18) + '" class="bv">' +
        fmt(it.value) + '</text>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      esc(opts.alt || '') + '">' + body + '</svg>';
  }

  function funnelChart(stages) {
    var W = 720, H = 128, gap = 14, bw = (W - gap * 2) / 3;
    var max = stages[0].value;
    var body = stages.map(function (s, i) {
      var x = i * (bw + gap);
      var h = Math.max(10, s.value / max * 66);
      var fill = RAMP[Math.min(RAMP.length - 1, 4 - i)];
      var drop = i ? Math.round(s.value / stages[i - 1].value * 100) : null;
      return '<rect class="hit" x="' + x + '" y="' + (78 - h) + '" width="' + bw +
        '" height="' + h + '" rx="4" fill="' + fill + '"' +
        ' data-label="' + esc(s.label) + '" data-value="' + fmt(s.value) + ' sessions"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (78 - h - 10) + '" text-anchor="middle" class="fv">' +
        fmt(s.value) + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="98" text-anchor="middle" class="fl">' +
        esc(s.label) + '</text>' +
        (drop !== null ? '<text x="' + (x + bw / 2) + '" y="118" text-anchor="middle" class="fd">' +
          drop + '% of the step before</text>' : '');
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Buyer journey funnel">' + body + '</svg>';
  }

  /* ----------------------------------------------------------------- render */
  var RANGES = [[7, '7 days'], [28, '28 days'], [90, '90 days']];
  var state = { days: 28, mode: 'built' };

  function tile(label, value, d, built, opts_note) {
    var body = built && state.mode === 'ga4'
      ? '<span class="tv na">not collected</span><span class="tn">a default install has no ' +
        'event for this</span>'
      : '<span class="tv">' + value + '</span>' +
        (d === null ? '' : '<span class="td ' + (d >= 0 ? 'up' : 'down') + '">' + pct(d) +
          ' on the period before</span>');
    return '<div class="tile' + (built ? ' isbuilt' : '') + '"><span class="tl">' +
      esc(label) + '</span>' + body +
      (opts_note && !(built && state.mode === 'ga4')
        ? '<span class="tn">' + esc(opts_note) + '</span>' : '') +
      '<span class="chip ' + (built ? 'b' : 'g') + '">' +
      (built ? 'built' : 'default') + '</span></div>';
  }

  function panel(title, note, built, chart) {
    var body = built && state.mode === 'ga4'
      ? '<div class="empty"><b>Not available.</b> ' + esc(note) + '</div>'
      : chart;
    return '<section class="panel' + (built ? ' isbuilt' : '') + '">' +
      '<div class="ph"><h4>' + esc(title) + '</h4>' +
      '<span class="chip ' + (built ? 'b' : 'g') + '">' +
      (built ? 'built' : 'default') + '</span></div>' + body + '</section>';
  }

  function render(root) {
    var rows = slice(state.days), was = prior(state.days);
    var sessions = sum(rows, 'sessions'), downloads = sum(rows, 'downloads');
    var downloaders = sum(rows, 'downloaders'), samples = sum(rows, 'samples');
    var perSession = downloads / Math.max(1, downloaders);

    var wasSessions = sum(was, 'sessions'), wasDownloads = sum(was, 'downloads');
    var wasPer = wasDownloads / Math.max(1, sum(was, 'downloaders'));

    var sheetVals = split(downloads, SHEETS.map(function (s) { return s[1]; }), 11 + state.days);
    var famVals = split(downloads, FAMILIES.map(function (f) { return f[2]; }), 22 + state.days);
    var loginVals = split(sum(rows, 'logins'), USERS.map(function (u) { return u[1]; }), 33 + state.days);

    var html =
      '<div class="tiles">' +
        tile('Sessions', fmt(sessions), delta(sessions, wasSessions), false,
             'the one number on this row you get for free') +
        tile('Sheets downloaded', fmt(downloads), delta(downloads, wasDownloads), true,
             'any of the four sheets, on any product page') +
        tile('Sheets per session', perSession.toFixed(2),
             delta(perSession, wasPer), true,
             'counted across sessions that opened at least one') +
        tile('Sample requests', fmt(samples), delta(samples, sum(was, 'samples')), true,
             'the request form on a product page, not the contact form') +
      '</div>' +

      panel('Sessions', '', false,
        areaChart(rows, 'sessions', { unit: 'sessions', alt: 'Daily sessions' })) +

      panel('Which sheet they opened',
            'A default install records a file download as one undifferentiated event. ' +
            'Which of the four sheets it was takes a lookup table built by hand.',
            true,
            barsChart(SHEETS.map(function (s, i) {
              return { label: s[0], value: sheetVals[i] };
            }), { ramp: true, unit: 'downloads', alt: 'Downloads by sheet type' })) +

      panel('Which product they were reading about',
            'The product code lives in the filename, not in the URL. Pulling it out ' +
            'needs a custom variable, and without it every download looks the same.',
            true,
            barsChart(FAMILIES.slice(0, 6).map(function (f, i) {
              return { label: f[0] + '  ' + f[1], value: famVals[i] };
            }), { ramp: true, labelWidth: 260, unit: 'downloads',
                  alt: 'Downloads by product family' })) +

      panel('From product page to sample request',
            'The stages are three separate interactions on three different templates. ' +
            'Nothing joins them up unless you decide in advance that they belong together.',
            true,
            funnelChart([
              { label: 'Viewed a product page', value: sum(rows, 'productViews') },
              { label: 'Opened at least one sheet', value: downloaders },
              { label: 'Requested a sample', value: samples }
            ])) +

      panel('Who is actually logging in to the portal',
            'The distinction between a distributor, an agent and someone internal is ' +
            'in a class on the page body. Reading it turns a number into an audience.',
            true,
            barsChart(USERS.map(function (u, i) {
              return { label: u[0], value: loginVals[i] };
            }), { ramp: true, unit: 'logins', alt: 'Portal logins by user type' }));

    root.querySelector('.cpa-body').innerHTML = html;
    wire(root);
  }

  /* ------------------------------------------------------------ interaction */
  function wire(root) {
    var tip = root.querySelector('.cpa-tip');
    root.querySelectorAll('.chart').forEach(function (svg) {
      svg.addEventListener('mousemove', function (e) {
        var t = e.target;
        if (!t.classList || !t.classList.contains('hit')) return;
        tip.innerHTML = '<b>' + t.getAttribute('data-label') + '</b>' +
                        '<span>' + t.getAttribute('data-value') + '</span>';
        tip.style.display = 'block';
        var box = root.getBoundingClientRect();
        tip.style.left = (e.clientX - box.left + 14) + 'px';
        tip.style.top = (e.clientY - box.top - 10) + 'px';
        var cross = svg.querySelector('.cross');
        if (cross && t.hasAttribute('data-x')) {
          var x = t.getAttribute('data-x'), y = t.getAttribute('data-y');
          cross.style.display = '';
          cross.querySelector('line').setAttribute('x1', x);
          cross.querySelector('line').setAttribute('x2', x);
          cross.querySelector('line').setAttribute('y1', 12);
          cross.querySelector('line').setAttribute('y2', 164);
          cross.querySelector('circle').setAttribute('cx', x);
          cross.querySelector('circle').setAttribute('cy', y);
        }
      });
      svg.addEventListener('mouseleave', function () {
        tip.style.display = 'none';
        var c = svg.querySelector('.cross');
        if (c) c.style.display = 'none';
      });
    });
  }

  function init() {
    var root = document.getElementById('cpa');
    if (!root) return;

    root.querySelector('.cpa-ranges').innerHTML = RANGES.map(function (r) {
      return '<button type="button" class="rb' + (r[0] === state.days ? ' on' : '') +
        '" data-days="' + r[0] + '">' + r[1] + '</button>';
    }).join('');

    root.addEventListener('click', function (e) {
      var b = e.target.closest('.rb');
      if (b) {
        state.days = +b.getAttribute('data-days');
        root.querySelectorAll('.rb').forEach(function (x) {
          x.classList.toggle('on', x === b);
        });
        render(root);
        return;
      }
      var m = e.target.closest('.mb');
      if (m) {
        state.mode = m.getAttribute('data-mode');
        root.querySelectorAll('.mb').forEach(function (x) {
          x.classList.toggle('on', x === m);
        });
        render(root);
      }
    });

    render(root);
  }

  global.CPAnalytics = { init: init, _data: DATA };
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
