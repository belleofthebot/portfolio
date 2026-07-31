/* CambiumPak deck generator — browser port of deck/build_deck.py.
 *
 * Same nine slides, same brand rules, same checks. It runs here rather than on
 * a server because this portfolio is static HTML with no build step, and because
 * a demonstration nobody can press a button on is a screenshot.
 *
 * The one honest difference from the employer tool it stands in for: that one
 * fetched the product page, found the spec-sheet PDF in the markup and sent it
 * to a model for structured extraction. This resolves the same URL against a
 * bundled copy of the product record instead. A browser cannot fetch
 * cambiumpak.com directly — no CORS headers, and it should not have them — so
 * the record travels with the page. Everything downstream of the lookup is the
 * real thing.
 *
 * Depends on window.CP_DATA (cp-data.js), generated from record.json.
 */
(function (global) {
  'use strict';

  var PINE = '#1E4D3B', PINE_DEEP = '#143529', KRAFT = '#A87D52',
      KRAFT_DEEP = '#8A6138', MOSS = '#7D9161', PAPER = '#F7F4ED',
      HAIR = '#DDD5C6', MUTE = '#6E7A70';

  var REAL_MARKS = ['FSC', 'BPI Compostable', 'How2Recycle', 'SFI', 'ISTA'];

  var SITE = 'https://cambiumpak.com';
  var UTM_SOURCE = 'product-deck', UTM_MEDIUM = 'sales-deck';

  /* Every outbound link is tagged, on the same principle as the email
     generator: the content parameter names the element, so a click can be
     attributed to the slide it came from instead of landing in direct. */
  function tag(url, key, content) {
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    return url + sep + 'utm_source=' + UTM_SOURCE + '&utm_medium=' + UTM_MEDIUM +
      '&utm_campaign=cp-' + key.toLowerCase() + '&utm_content=' + content;
  }

  /* Plausible make-up sequences for the families whose step drawings are not
     drawn yet, so a deck is presentable before the artwork exists. Kept in step
     with deck/build_deck.py in the cambiumpak repo. */
  var FALLBACK_STEPS = {
    "CP-BWM": [
      "Lay the blank flat, printed face down, and set the item against the base panel.",
      "Fold the side walls up and crease on the score that matches the depth of the item.",
      "Bring the long flap over, press the crease, and fold the end tabs in.",
      "Peel the liner and press the seal strip down along its full length."
    ],
    "CP-PPE": [
      "Check the internal size against the item. The liner runs the full width of the pocket.",
      "Slide the item in flat, keeping it clear of the seal flap.",
      "Peel the liner from the flap and fold it over, pressing from the center outwards.",
      "Apply the shipping label straight onto the kraft face. No carrier sheet."
    ],
    "CP-DIV": [
      "Take one set of strips from the carton and separate the long from the short.",
      "Stand the long strips on edge with the slots facing up.",
      "Drop the short strips into the slots at right angles until each one seats fully.",
      "Lower the grid into the carton. The cells should sit square to the walls."
    ],
    "CP-PLP-T06": [
      "Take a stack from the pallet layer and hold it by the flange.",
      "Twist the top tray a quarter turn to break the nest, then lift it clear.",
      "Load one item per cavity, seated to the base rather than resting on the rim.",
      "Close with a board lid, or invert a second tray onto the flange."
    ],
    "CP-PLP-T12": [
      "Take a stack from the pallet layer and hold it by the flange.",
      "Twist the top tray a quarter turn to break the nest, then lift it clear.",
      "Load one item per cavity, seated to the base rather than resting on the rim.",
      "Close with a board lid, or invert a second tray onto the flange."
    ],
    "CP-PLP-CNR": [
      "Make up and load the carton, then close and seal it as usual.",
      "Slide one guard onto each top corner so both legs sit flush to the faces.",
      "Repeat on the base corners wherever the load stacks more than two high.",
      "Strap or stretch-wrap over the guards, never between them."
    ],
    "CP-VF-HC24": [
      "Mount the roll on the bar and draw off an arm's length. It expands as it comes.",
      "Set the item on the expanded sheet and bring the edges up around it.",
      "Tuck the ends in on themselves. The cells interlock and hold without tape.",
      "Tear against the bar and place the wrapped item in the carton."
    ],
    "CP-VF-CR18": [
      "Open the carton and loosen the fill by hand. It opens out to about 105 liters.",
      "Lay a base of roughly 40 mm before the item goes in.",
      "Fill around the sides to the wall line, working down as you go.",
      "Top off, close the flaps, and shake. Nothing inside should move."
    ],
    "CP-TP": [
      "Set the dispenser to a length that overhangs each end of the seam by 50 mm.",
      "Wet the gum evenly. It darkens before it touches the board.",
      "Lay one strip down the center seam and press from the middle outwards.",
      "Give it a minute to bond into the fiber before the carton is handled."
    ]
  };

  /* ------------------------------------------------------------- helpers */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function mossFigure(pct) {
    /* NaN is a number, and a person can now type into this field, so the
       guard has to reject it explicitly or "abc%" reaches a slide. */
    if (typeof pct !== 'number' || !isFinite(pct)) {
      throw new Error('recycled content must be a number, got "' + pct + '"');
    }
    return '<span class="moss">' + pct + '%</span>';
  }

  function splitPair(value) {
    var parts = String(value || '').split('·').map(function (x) { return x.trim(); })
                  .filter(Boolean);
    if (parts.length < 2) return parts;
    var m = /[\d.,]+\s*(.+)$/.exec(parts[parts.length - 1]);
    var unit = m ? m[1].trim() : '';
    return parts.map(function (x) {
      return (unit && /^[\d.,]+$/.test(x)) ? x + ' ' + unit : x;
    });
  }

  /* --------------------------------------------------------- brand marks */
  function lockup(variant, width) {
    var c = { primary: [PINE, PINE, KRAFT],
              reversed: [PAPER, '#FFFFFF', '#E4D3BE'] }[variant || 'primary'];
    return '<svg class="lockup" viewBox="0 0 364 100" style="width:' + width +
      'px" role="img" aria-label="CambiumPak">' +
      '<g transform="translate(0 6) scale(0.88)" fill="none" stroke="' + c[0] +
      '" stroke-width="10" stroke-linecap="butt">' +
      '<path d="M50 82 A18 18 0 0 1 50 46"/><path d="M50 98 A34 34 0 0 1 50 30"/>' +
      '<path d="M50 54 A18 18 0 0 0 50 18"/><path d="M50 70 A34 34 0 0 0 50 2"/></g>' +
      '<text x="106" y="64" font-family="Inter,Arial,sans-serif" font-weight="700" ' +
      'font-size="40" letter-spacing="-0.6"><tspan fill="' + c[1] + '">Cambium</tspan>' +
      '<tspan fill="' + c[2] + '">Pak</tspan></text></svg>';
  }

  var CERT_ART = {
    'CircleFibre 90': function (c) {
      return '<path d="M40 24a16 16 0 1 1-6-12.5"/><path d="M40 8v8h-8"/>' +
        '<text x="24" y="30" text-anchor="middle" font-family="Inter,Arial,sans-serif" ' +
        'font-size="15" font-weight="700" fill="' + c + '" stroke="none">90</text>';
    },
    'ReturnReady': function () {
      return '<rect x="7" y="7" width="34" height="34" rx="7"/><path d="M16 25l6 6 11-13"/>';
    },
    'SoilSafe 180': function (c) {
      return '<circle cx="24" cy="27" r="15"/>' +
        '<path d="M24 34c-6 0-8-4-8-8 5 0 8 3 8 8zM24 34c6 0 8-4 8-8-5 0-8 3-8 8z"/>' +
        '<text x="24" y="9" text-anchor="middle" font-family="Inter,Arial,sans-serif" ' +
        'font-size="11" font-weight="700" fill="' + c + '" stroke="none">180</text>';
    },
    'ChainMark': function () {
      return '<path d="M24 5l14 5v13c0 10-7 16-14 20-7-4-14-10-14-20V10z"/>' +
        '<circle cx="19" cy="22" r="6"/><circle cx="29" cy="22" r="6"/>';
    },
    'DropRated D3': function (c) {
      return '<path d="M8 15h32v26H8zM8 15l6-8h20l6 8M24 7v8"/>' +
        '<text x="24" y="34" text-anchor="middle" font-family="Inter,Arial,sans-serif" ' +
        'font-size="13" font-weight="700" fill="' + c + '" stroke="none">D3</text>';
    }
  };

  function certMark(name, colour, size) {
    size = size || 54;
    return '<svg viewBox="0 0 48 48" style="width:' + size + 'px;height:' + size +
      'px" fill="none" stroke="' + colour + '" stroke-width="3" stroke-linecap="butt" ' +
      'role="img" aria-label="' + esc(name) + '">' + CERT_ART[name](colour) + '</svg>';
  }

  /* ------------------------------------------------------------ graphics */
  function fluteSection(kind, label, caliper, wid) {
    wid = wid || 300;
    var y = 14, parts = [], base;

    function liner(yy) {
      return '<line x1="16" y1="' + yy + '" x2="' + (wid - 16) + '" y2="' + yy +
        '" stroke="' + KRAFT_DEEP + '" stroke-width="3"/>';
    }
    function flutes(y0, y1, half) {
      var x = 16, atBottom = true, d = ['M16 ' + y1];
      while (x < wid - 16) {
        var x2 = Math.min(x + half, wid - 16);
        var tgt = atBottom ? y0 : y1, cur = atBottom ? y1 : y0;
        d.push('C' + (x + half * 0.42) + ' ' + cur + ' ' + (x2 - half * 0.42) + ' ' +
               tgt + ' ' + x2 + ' ' + tgt);
        atBottom = !atBottom;
        x = x2;
      }
      return '<path d="' + d.join(' ') + '" fill="none" stroke="' + KRAFT +
        '" stroke-width="2.2"/>';
    }

    parts.push(liner(y));
    if (kind === 'single') {
      parts.push(flutes(y + 2, y + 32, 15), liner(y + 34));
      base = y + 34;
    } else {
      parts.push(flutes(y + 2, y + 16, 9), liner(y + 18),
                 flutes(y + 20, y + 50, 15), liner(y + 52));
      base = y + 52;
    }
    var hei = base + 52;
    parts.push('<line x1="' + (wid - 8) + '" y1="' + y + '" x2="' + (wid - 8) + '" y2="' +
      base + '" stroke="' + PINE + '" stroke-width="1.2"/>' +
      '<line x1="' + (wid - 12) + '" y1="' + y + '" x2="' + (wid - 4) + '" y2="' + y +
      '" stroke="' + PINE + '" stroke-width="1.2"/>' +
      '<line x1="' + (wid - 12) + '" y1="' + base + '" x2="' + (wid - 4) + '" y2="' +
      base + '" stroke="' + PINE + '" stroke-width="1.2"/>' +
      '<text x="16" y="' + (base + 26) + '" font-family="Inter,Arial,sans-serif" ' +
      'font-size="15" font-weight="600" fill="' + PINE + '">' + esc(label) + '</text>' +
      '<text x="16" y="' + (base + 45) + '" font-family="Inter,Arial,sans-serif" ' +
      'font-size="12.5" fill="' + MUTE + '">' + esc(caliper) + ' caliper</text>');
    return '<svg viewBox="0 0 ' + wid + ' ' + hei + '" style="width:100%;height:auto" ' +
      'role="img" aria-label="' + esc(label) + ' cross-section">' + parts.join('') + '</svg>';
  }

  function bandScale(band, wid) {
    wid = wid || 520;
    var bands = ['0–39', '40–69', '70–100'], seg = (wid - 4) / 3, d = [];
    d.push('<svg viewBox="0 0 ' + wid + ' 30" style="width:100%;height:auto" role="img" ' +
           'aria-label="recycled content band ' + esc(band) + '">');
    bands.forEach(function (b, i) {
      var x = i * (seg + 2), on = b === band;
      d.push('<rect x="' + x.toFixed(1) + '" y="0" width="' + seg.toFixed(1) +
        '" height="26" rx="3" fill="' + (on ? MOSS : 'none') + '" stroke="' +
        (on ? MOSS : HAIR) + '" stroke-width="' + (on ? 0 : 1.5) + '"/>');
      d.push('<text x="' + (x + seg / 2).toFixed(1) + '" y="17.5" text-anchor="middle" ' +
        'font-family="Inter,Arial,sans-serif" font-size="13" font-weight="' +
        (on ? 600 : 500) + '" fill="' + (on ? PAPER : MUTE) + '">' + b + '</text>');
    });
    d.push('</svg>');
    return d.join('');
  }

  /* ------------------------------------------------------------ checking */
  function checkBadgeIntersection(fam) {
    var computed = fam.skus.reduce(function (acc, s) {
      return acc === null ? s.badges.slice()
                          : acc.filter(function (b) { return s.badges.indexOf(b) > -1; });
    }, null) || [];
    var declared = fam.badges_claimable;
    var same = computed.length === declared.length &&
               computed.every(function (b) { return declared.indexOf(b) > -1; });
    if (!same) {
      throw new Error(fam.key + ': badge intersection mismatch. Computed [' +
        computed.join(', ') + '], record claims [' + declared.join(', ') + '].');
    }
    return declared.filter(function (b) { return computed.indexOf(b) > -1; });
  }

  function runChecks(markup, fam) {
    var results = [];
    function ok(label, fn) {
      try { fn(); results.push({ label: label, pass: true }); }
      catch (e) { results.push({ label: label, pass: false, why: e.message }); }
    }
    var text = markup.replace(/<[^>]+>/g, ' ');

    ok('Badge row is the intersection of its member SKUs', function () {
      checkBadgeIntersection(fam);
    });
    ok('Moss carries recycled-content figures and nothing else', function () {
      var re = /<span class="moss">(.*?)<\/span>/g, m;
      while ((m = re.exec(markup))) {
        if (!/^\d{1,3}%$/.test(m[1].trim())) throw new Error('non-figure in Moss: ' + m[1]);
      }
    });
    ok('No real certification body appears', function () {
      REAL_MARKS.forEach(function (mk) {
        if (new RegExp('\\b' + mk + '\\b').test(text)) throw new Error(mk);
      });
    });
    ok('Dimensions emitted verbatim from the record', function () {
      fam.skus.forEach(function (s) {
        if (markup.indexOf(esc(s.internal_dimensions)) === -1) {
          throw new Error(s.internal_dimensions);
        }
      });
    });
    ok('Recycled content shown as both a band and a figure', function () {
      if (markup.indexOf('the figure, by weight') === -1 ||
          markup.indexOf('the band, for comparison') === -1) {
        throw new Error('one of the two is missing');
      }
    });
    ok('No em dash in published copy', function () {
      var m = /.{0,50}—.{0,50}/.exec(text);
      if (m) throw new Error(m[0].replace(/\s+/g, ' ').trim());
    });
    ok('No double-escaped entity', function () {
      var m = /&amp;[a-z]+;/.exec(markup);
      if (m) throw new Error(m[0]);
    });
    return results;
  }

  /* -------------------------------------------------------------- slides */
  /* The footer used to name which of the four sheets each fact came from. It
     was useful while the generator was being built and is noise to a buyer. */
  function shell(n, total, kicker, body, code, opts) {
    opts = opts || {};
    var head = kicker === null ? '' :
      '<div class="rail"><span class="kick">' + esc(kicker) + '</span>' +
      lockup(opts.dark ? 'reversed' : 'primary', 156) + '</div>';
    var gapbit = opts.gap ? '<span class="fgap">' + esc(opts.gap) + '</span>' : '';
    return '<section class="slide' + (opts.dark ? ' dark' : '') + '">' + head +
      '<div class="body' + (opts.pad === false ? ' nopad' : '') + '">' + body + '</div>' +
      '<div class="foot"><div class="foot-r1"><span></span>' +
      '<span class="pg">' + esc(code) + ' &nbsp;·&nbsp; ' + n + ' / ' + total + '</span></div>' +
      '<div class="foot-r2"><span class="disc">CambiumPak is an invented company. ' +
      'This deck is a portfolio demonstration.</span>' + gapbit + '</div></div></section>';
  }

  function buildSlides(fam, data) {
    var certDefs = data.certifications;
    var skus = fam.skus, docs = fam.documents, total = 9, code = fam.prefix;
    var claimable = checkBadgeIntersection(fam);
    var onlySome = fam.badges_held_somewhere.filter(function (b) {
      return claimable.indexOf(b) === -1;
    });

    var spec = {}, meas = {};
    fam.specification.forEach(function (d) { spec[d.label] = d.value; });
    fam.measurements.forEach(function (d) { meas[d.label] = d.value; });

    function sget() {
      var names = Array.prototype.slice.call(arguments), i, k;
      for (i = 0; i < names.length; i++) {
        if (spec[names[i]] !== undefined) return spec[names[i]];
        if (meas[names[i]] !== undefined) return meas[names[i]];
      }
      var stem = names[0].split(',')[0];
      for (k in spec) if (k.indexOf(stem) === 0) return spec[k];
      for (k in meas) if (k.indexOf(stem) === 0) return meas[k];
      return null;
    }
    function materialOf(sku) {
      var names = sku ? ['Board grade, ' + sku.split('-').pop()] : [];
      return sget.apply(null, names.concat(['Board grade', 'Material', 'Outer face', 'Backing']));
    }
    function img(src, cls, alt) {
      return '<img class="' + cls + '" src="' + src + '" alt="' + esc(alt) + '">';
    }

    var S = [];

    /* 1 — cover */
    S.push(shell(1, total, null,
      '<div class="cover"><div class="cover-l">' + lockup('reversed', 300) +
      '<p class="cov-kick">Product presentation</p><h1>' + esc(fam.name) + '</h1>' +
      '<p class="cov-tag">' + esc(fam.tagline) + '</p><div class="cov-codes">' +
      skus.map(function (s) { return '<span>' + esc(s.code) + '</span>'; }).join('') +
      '</div></div><div class="cover-r"><div class="coverplate">' +
      (fam.diagram ? img(fam.diagram, 'coverart', fam.name + ' technical diagram') : '') +
      '</div></div></div>', code, { dark: true, pad: false }));

    /* 2 — why this specification */
    var load = sget('Max gross load', 'Cell load');
    var mat = materialOf(skus[0].code);
    var q1 = load
      ? 'Maximum gross load is the first gate. It is ' + esc(load) +
        ', and it is held per size, not per family.'
      : 'Maximum gross load is the first gate, and it is held per size rather than ' +
        'per family. The spec sheet states it against each code.';
    var q2 = mat
      ? esc(mat) + '. Specified against the duty, not against habit.'
      : 'The material and grade are stated per size on the spec sheet, because on ' +
        'this range they are not the same across the sizes.';
    S.push(shell(2, total, 'why this specification',
      '<h2>Three questions decide the pack.</h2>' +
      '<p class="lede">Most packaging is re-ordered on last year\'s part number. These ' +
      'are the three answers that change what should be on the purchase order.</p>' +
      '<div class="qcols">' +
      '<div class="qcol"><span class="qn">01</span><h3>What does it carry?</h3><p>' +
      q1 + '</p><p class="src">spec sheet</p></div>' +
      '<div class="qcol"><span class="qn">02</span><h3>What is it made of?</h3><p>' +
      q2 + '</p><p class="src">spec sheet</p></div>' +
      '<div class="qcol"><span class="qn">03</span><h3>Is it the right format at all?</h3>' +
      '<p>Void-fill need, second-trip behavior and what to specify instead sit on the ' +
      'comparison sheet, not on this one.</p><p class="src">comparison sheet</p></div></div>' +
      '<p class="pull">' +
      esc(fam.description.split('. ').pop().replace(/\.$/, '')) + '.</p>',
      code, {}));

    /* 3 — the product */
    S.push(shell(3, total, 'the product',
      '<div class="split"><div class="split-l"><h2>' + esc(fam.name) + '</h2>' +
      '<p class="tagline">' + esc(fam.tagline) + '</p>' +
      '<p class="desc">' + esc(fam.description) + '</p><div class="chips">' +
      fam.tags.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') +
      '</div></div><div class="split-r">' +
      (fam.diagram ? img(fam.diagram, 'prodart', fam.name + ', dimensioned diagram') : '') +
      '</div></div>', code, {}));

    /* 4 — the range */
    var grades = skus.map(function (s) { return materialOf(s.code); });
    var showGrade = grades.some(Boolean);
    var rows = skus.map(function (s, i) {
      return '<tr><td class="sku">' + esc(s.code) + '</td><td>' +
        esc(s.internal_dimensions) + '</td>' +
        (showGrade ? '<td>' + esc(grades[i] || '') + '</td>' : '') +
        '<td>' + esc(s.minimum_order) + '</td><td>' + esc(s.lead_time) + '</td></tr>';
    }).join('');
    var sfx = skus[0].code.split('-').pop();
    var facts = [
      [sget('Blank size, ' + sfx, 'Blank size', 'Roll width', 'Carton size'), 'flat blank'],
      [sget('Flat-pack thickness', 'Total wall thickness', 'Wall thickness'), 'wall thickness'],
      [sget('Pack quantity'), 'supplied'],
      [sget('Pallet fit, ' + sfx, 'Pallet fit', 'Yield, loosened'), 'palletized']
    ].filter(function (f) { return f[0]; });
    S.push(shell(4, total, 'the range',
      '<h2>' + (skus.length === 2 ? 'Two sizes, two duties' : 'The range') + '</h2>' +
      '<p class="lede">Dimensions are internal, in millimeters, in length &times; width ' +
      '&times; depth order, on every document CambiumPak issues.</p>' +
      '<table class="skut"><tr><th>code</th><th>internal, L &times; W &times; D</th>' +
      (showGrade ? '<th>grade</th>' : '') +
      '<th>minimum order</th><th>lead time</th></tr>' + rows + '</table>' +
      '<div class="factrow">' + facts.map(function (f) {
        return '<div><b>' + esc(f[0]) + '</b><span>' + f[1] + '</span></div>';
      }).join('') + '</div>',
      code, {}));

    /* 5 — construction */
    var burst = splitPair(sget('Burst strength')),
        cal = splitPair(sget('Board caliper')),
        loads = splitPair(sget('Max gross load'));
    var distinct = grades.filter(Boolean).filter(function (g, i, a) { return a.indexOf(g) === i; });
    var body5, src5;
    if (skus.length >= 2 && distinct.length >= 2 &&
        burst.length >= 2 && cal.length >= 2 && loads.length >= 2) {
      var s1 = skus[0].code.split('-').pop(), s2 = skus[1].code.split('-').pop();
      body5 = '<h2>Where the strength comes from</h2>' +
        '<p class="lede">Same pack, two board specifications. The difference is one ' +
        'liner and one flute, and it changes what the carton will carry.</p>' +
        '<div class="flutes"><div class="flutebox">' +
        fluteSection('single', s1 + ' · ' + grades[0], cal[0]) +
        '<div class="fstats"><div><b>' + esc(burst[0]) + '</b><span>burst</span></div>' +
        '<div><b>' + esc(loads[0]) + '</b><span>max gross load</span></div></div></div>' +
        '<div class="flutebox">' +
        fluteSection('double', s2 + ' · ' + grades[1], cal[1]) +
        '<div class="fstats"><div><b>' + esc(burst[1]) + '</b><span>burst</span></div>' +
        '<div><b>' + esc(loads[1]) + '</b><span>max gross load</span></div></div></div></div>';
      src5 = null;
    } else {
      body5 = '<h2>The specification in full</h2>' +
        '<p class="lede">Every tested figure. Provisional, and not independently ' +
        'certified.</p><div class="specgrid">' +
        fam.specification.concat(fam.measurements).map(function (d) {
          return '<div class="specrow"><span>' + esc(d.label) + '</span><b>' +
            esc(d.value) + '</b></div>';
        }).join('') + '</div>';
      src5 = null;
    }
    S.push(shell(5, total, 'construction', body5, code, {}));

    /* 6 — certifications */
    var cards = claimable.map(function (b) {
      return '<div class="cert">' + certMark(b, certDefs[b].colour) + '<b>' + esc(b) +
        '</b><p>' + esc(certDefs[b].criterion) + '</p></div>';
    }).join('');
    var note = '';
    if (onlySome.length) {
      var holders = [];
      skus.forEach(function (s) {
        onlySome.forEach(function (b) {
          if (s.badges.indexOf(b) > -1 && holders.indexOf(s.code) === -1) holders.push(s.code);
        });
      });
      note = '<div class="badgenote"><b>Not a family claim.</b> ' + esc(onlySome.join(', ')) +
        ' ' + (onlySome.length === 1 ? 'is' : 'are') + ' held by ' + esc(holders.sort().join(', ')) +
        ' only. The row above shows what every size in the family can support, never the ' +
        'total of what any one size holds.</div>';
    }
    var head6 = onlySome.length
      ? (claimable.length === 3 ? 'Three' : claimable.length) + ' marks, and one that is not on the row'
      : 'What it is certified for';
    S.push(shell(6, total, 'what it is certified for',
      '<h2>' + esc(head6) + '</h2>' +
      '<p class="lede">Badges are resolved from the SKU record, never placed by hand. A ' +
      'family row shows only what every size in the range can support.</p>' +
      '<div class="certs c' + claimable.length + '">' + cards + '</div>' + note,
      code, {}));

    /* 7 — recycled content */
    var figs = skus.slice(0, 3).map(function (s) {
      return '<div><span class="recbig">' + mossFigure(s.recycled_pct) +
        '</span><span class="recsku">' + esc(s.code) + '</span></div>';
    }).join('');
    S.push(shell(7, total, 'recycled content',
      '<h2>Recycled content</h2><div class="recycled"><div class="rec-l">' +
      '<p class="reclab">the figure, by weight</p><div class="recfigs">' + figs + '</div>' +
      '<p class="prov">Provisional, not independently certified.</p>' +
      '</div><div class="rec-r">' +
      '<p class="reclab">the band, for comparison</p>' + bandScale(fam.recycled.band) +
      '<p class="recnote">Recycled content is banded, never implied. The band is what ' +
      'compares across formats; the figure is what this pack is made of. Both are stated, ' +
      'and neither stands in for the other.</p></div></div>',
      code, {}));

    /* 8 — at the pack bench */
    var fourth = docs.assembly.title, verb = fourth.split(' ')[0];
    var cells, lede8, head8, gap8 = null;
    if (fam.steps.length) {
      cells = fam.steps.map(function (st, i) {
        return '<div class="step"><span class="sn">' + (i + 1) + '</span>' +
          img(st.src, 'stepart', st.caption) + '<p>' + esc(st.caption) + '</p></div>';
      }).join('');
      lede8 = 'The first ' + fam.steps.length + ' of ' + fam.stepCount +
        '. Timings, handling cautions and what to do when it will not close ' +
        'travel with the pack.';
      head8 = verb + ' in ' + fam.stepCount + ' steps';
    } else {
      var written = FALLBACK_STEPS[fam.prefix] || [];
      cells = written.length
        ? written.map(function (t, i) {
            return '<div class="step nodraw"><span class="sn">' + (i + 1) +
              '</span><p>' + esc(t) + '</p></div>';
          }).join('')
        : [1, 2, 3, 4].map(function (i) {
            return '<div class="step"><span class="sn">' + i +
              '</span><p class="nostep">sequence not written yet</p></div>';
          }).join('');
      lede8 = 'Four steps at the bench. The full sequence travels with the pack.';
      head8 = verb + ' in four steps';
      gap8 = 'written sequence, step drawings not yet made';
    }
    S.push(shell(8, total, 'at the pack bench',
      '<h2>' + esc(head8) + '</h2><p class="lede">' + esc(lede8) + '</p>' +
      '<div class="steps">' + cells + '</div>', code, { gap: gap8 }));

    /* 9 — the close */
    var order = [docs.spec, docs.comparison, docs.features, docs.assembly];
    var doclist = order.map(function (d) {
      var stem = d.file.replace(/\.pdf$/, '');
      var content = stem.split(fam.prefix + '-').pop();
      var href = tag(SITE + '/assets/docs/' + d.file, fam.key, content);
      return '<li><a href="' + href + '" target="_blank" rel="noopener"><b>' +
        esc(d.title) + '</b><span>' + esc(d.question) + '</span><em>' +
        d.pages + ' pp &nbsp;&rarr;</em></a></li>';
    }).join('');
    var pages = order.reduce(function (a, d) { return a + d.pages; }, 0);
    S.push(shell(9, total, null,
      '<div class="close"><div class="close-l">' +
      '<p class="cov-kick">The full pack</p>' +
      '<h2 class="closeh">Everything behind this deck</h2>' +
      '<ul class="doclist">' + doclist + '</ul>' +
      '<p class="closefoot">' + pages + ' pages across four documents. Every one of ' +
      'them opens from this slide, and from the product page behind the code.</p>' +
      '</div><div class="close-r">' +
      '<div class="qrbox">' + (fam.qr || '') + '</div>' +
      '<p class="qrurl"><a href="' + tag(fam.url, fam.key, 'qr-close') +
      '" target="_blank" rel="noopener">' + esc(fam.url.replace('https://', '')) +
      '</a></p>' +
      '<div class="orderbox"><div><b>' +
      esc(skus.map(function (s) { return s.minimum_order; }).join(' / ')) +
      '</b><span>minimum order, ' +
      esc(skus.map(function (s) { return s.code.split('-').pop(); }).join(' / ')) +
      '</span></div><div><b>' +
      esc(skus.map(function (s) { return s.lead_time; }).join(' / ')) +
      '</b><span>lead time</span></div></div></div></div>' +
      '<p class="fulldisc">' + esc(data.disclaimer) + '</p>',
      code, { dark: true }));

    return S;
  }

  /* ------------------------------------------------------------- the API */
  function resolve(input, data) {
    var q = String(input || '').trim().toLowerCase();
    if (!q) return null;
    var fams = data.families, i, j;
    /* a full product URL, or just the cp-xxx.html part of one */
    var m = /\/products\/cp-([a-z0-9]+)\.html/.exec(q) || /^cp-([a-z0-9]+)\.html$/.exec(q);
    if (m) {
      for (i = 0; i < fams.length; i++) {
        if (fams[i].key.toLowerCase() === m[1]) return fams[i];
      }
      return null;
    }
    /* a SKU code, exact */
    for (i = 0; i < fams.length; i++) {
      for (j = 0; j < fams[i].skus.length; j++) {
        if (fams[i].skus[j].code.toLowerCase() === q) return fams[i];
      }
    }
    /* a series prefix or a bare key */
    for (i = 0; i < fams.length; i++) {
      if (fams[i].prefix.toLowerCase() === q || fams[i].key.toLowerCase() === q) return fams[i];
    }
    /* the leading part of a SKU, so CP-CTN matches CP-CTN-RSC1 */
    for (i = 0; i < fams.length; i++) {
      for (j = 0; j < fams[i].skus.length; j++) {
        if (fams[i].skus[j].code.toLowerCase().indexOf(q) === 0) return fams[i];
      }
    }
    return null;
  }

  function build(fam, data) {
    var slides = buildSlides(fam, data);
    var markup = slides.join('');
    var checks = runChecks(markup, fam);
    var html = '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n<title>' +
      esc(fam.name) + ' | ' + fam.prefix + ' product deck | CambiumPak</title>\n' +
      '<meta name="description" content="Nine-slide product presentation generated from ' +
      'the CambiumPak product record. CambiumPak is an invented company; this is a ' +
      'portfolio demonstration.">\n<style>' + global.CP_DECK_CSS + '</style></head>\n' +
      '<body><div class="deck">' + markup + '</div></body></html>\n';
    return { html: html, slides: slides, checks: checks, filename:
      'CambiumPak-' + fam.prefix + '-sales-deck.html' };
  }

  global.CPDeck = { resolve: resolve, build: build, esc: esc };
})(window);
