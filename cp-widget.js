/* The "try it" widget on the deck-generator case study.
 *
 * Wiring only: resolve what the visitor typed, show what was found, build the
 * deck, run the checks, put the result in an iframe. The generator itself is
 * cp-deck.js.
 */
(function () {
  'use strict';

  var data = window.CP_DATA;
  if (!data || !window.CPDeck) return;

  var $ = function (id) { return document.getElementById(id); };
  var input = $('cp-input'), go = $('cp-go'), status = $('cp-status'),
      chips = $('cp-chips'), resolved = $('cp-resolved'), reskey = $('cp-reskey'),
      resgrid = $('cp-resgrid'), checksBox = $('cp-checks'), chklist = $('cp-chklist'),
      out = $('cp-out'), outname = $('cp-outname'), frame = $('cp-frame');

  var current = null, edited = null, built = null;
  var blobUrl = null, previewUrl = null, slide = 0;
  var SLIDE_W = 1280, SLIDE_H = 720, TOTAL = 9;

  /* Paging talks to the preview over postMessage rather than reaching into
     contentWindow.scrollTo. A blob URL served from a file:// page gets a null
     origin, so the direct call is blocked there and fails silently, which is
     the worst way for a control to not work. postMessage crosses that boundary
     and behaves the same however the page is served. Preview only: the file
     that gets downloaded carries no script. */
  var PREVIEW_SCRIPT =
    '<script>addEventListener("message",function(e){' +
    'var d=e.data;if(d&&typeof d.cpSlide==="number"){' +
    'scrollTo(0,d.cpSlide*' + 720 + ');}},false);<' + '/script>';
  var esc = window.CPDeck.esc;

  /* ------------------------------------------------------------- the chips */
  data.families.forEach(function (f) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'try-chip';
    b.innerHTML = '<span class="chip-key">' + esc(f.prefix) + '</span>' +
                  '<span class="chip-name">' + esc(f.name) + '</span>';
    b.addEventListener('click', function () {
      input.value = f.url;
      go.disabled = false;
      extract();
    });
    chips.appendChild(b);
  });

  /* ---------------------------------------------- step one: extraction */
  /* The employer tool put an editable field review between the URL and the
     download, because extraction is never perfect and a salesperson needs to
     fix a line without opening the file. Same shape here. */
  function fieldRow(label, name, value, kind) {
    var input = kind === 'area'
      ? '<textarea data-f="' + name + '" rows="3">' + esc(value) + '</textarea>'
      : '<input data-f="' + name + '" type="text" value="' + esc(value) + '">';
    return '<div class="res-row"><label>' + esc(label) + '</label>' + input + '</div>';
  }

  function readOnlyRow(label, value, cls) {
    return '<div class="res-row' + (cls ? ' ' + cls : '') + '"><label>' +
      esc(label) + '</label><div class="res-fixed">' + value + '</div></div>';
  }

  function extract() {
    var fam = window.CPDeck.resolve(input.value, data);
    current = fam;
    checksBox.hidden = true;
    out.hidden = true;

    if (!fam) {
      resolved.hidden = true;
      status.textContent = input.value.trim()
        ? 'Nothing in the record matches that. Try a product URL or a SKU code.'
        : 'Paste a URL, or pick one below.';
      status.className = 'try-status' + (input.value.trim() ? ' is-bad' : '');
      return;
    }
    edited = JSON.parse(JSON.stringify(fam));
    renderFields();
    resolved.hidden = false;
    status.textContent = 'Extracted ' + fam.prefix + '. Check the fields, then build.';
    status.className = 'try-status is-good';
    resolved.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderFields() {
    var fam = edited;
    var claimable = fam.badges_claimable;
    var onlySome = fam.badges_held_somewhere.filter(function (b) {
      return claimable.indexOf(b) === -1;
    });
    var pages = ['spec', 'comparison', 'features', 'assembly'].reduce(function (a, k) {
      return a + fam.documents[k].pages;
    }, 0);

    reskey.textContent = fam.prefix;
    var html = fieldRow('Product name', 'name', fam.name) +
      fieldRow('Tagline', 'tagline', fam.tagline) +
      fieldRow('Description', 'description', fam.description, 'area');

    fam.skus.forEach(function (sk, i) {
      html += '<div class="res-sku-block"><p class="res-sku-head">' + esc(sk.code) + '</p>' +
        fieldRow('Code', 'sku.' + i + '.code', sk.code) +
        fieldRow('Internal, L x W x D', 'sku.' + i + '.internal_dimensions',
                 sk.internal_dimensions) +
        fieldRow('Recycled, % by weight', 'sku.' + i + '.recycled_pct', sk.recycled_pct) +
        fieldRow('Minimum order', 'sku.' + i + '.minimum_order', sk.minimum_order) +
        fieldRow('Lead time', 'sku.' + i + '.lead_time', sk.lead_time) +
        '</div>';
    });

    html += readOnlyRow('Badge row, computed',
      claimable.map(function (b) {
        return '<span class="res-badge">' + esc(b) + '</span>';
      }).join('') + (onlySome.length
        ? '<span class="res-excl">' + esc(onlySome.join(', ')) +
          ' held by some sizes only, so not a family claim</span>' : ''),
      onlySome.length ? 'is-note' : '');
    html += readOnlyRow('Documents', '4 sheets, ' + pages + ' pages, all linked on slide 9');
    html += readOnlyRow('Step drawings', fam.stepCount
      ? fam.stepCount + ' available, first ' + fam.steps.length + ' used'
      : '<span class="res-missing">none drawn yet, a written sequence is used</span>',
      fam.stepCount ? '' : 'is-note');

    resgrid.innerHTML = html;
  }

  function readFields() {
    var fam = JSON.parse(JSON.stringify(current));
    resgrid.querySelectorAll('[data-f]').forEach(function (el) {
      var path = el.getAttribute('data-f').split('.');
      var v = el.value;
      if (path[0] === 'sku') {
        var sk = fam.skus[+path[1]], key = path[2];
        sk[key] = key === 'recycled_pct' ? parseFloat(v) : v;
      } else {
        fam[path[0]] = v;
      }
    });
    return fam;
  }

  /* ---------------------------------------------------------- build it */
  function create() {
    if (!current) return;
    edited = readFields();
    var t0 = (window.performance && performance.now) ? performance.now() : 0;
    try {
      built = window.CPDeck.build(edited, data);
    } catch (e) {
      status.textContent = 'The build stopped: ' + e.message;
      status.className = 'try-status is-bad';
      return;
    }
    var ms = t0 ? Math.max(1, Math.round(performance.now() - t0)) : null;

    chklist.innerHTML = built.checks.map(function (c) {
      return '<li class="' + (c.pass ? 'chk-ok' : 'chk-no') + '"><span class="chk-mark">' +
        (c.pass ? '&#10003;' : '&#10007;') + '</span>' + esc(c.label) +
        (c.pass ? '' : ' <em>' + esc(c.why) + '</em>') + '</li>';
    }).join('');
    checksBox.hidden = false;

    if (blobUrl) URL.revokeObjectURL(blobUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    blobUrl = URL.createObjectURL(new Blob([built.html], { type: 'text/html' }));

    /* The preview is a second copy with the deck's own page padding removed, so
       one slide fills the frame exactly and slide n starts at n * 720. The file
       you download and open is the untouched one. */
    previewUrl = URL.createObjectURL(new Blob([
      built.html
        .replace('</style>', '.deck{padding:0;gap:0}</style>')
        .replace('</body>', PREVIEW_SCRIPT + '</body>')
    ], { type: 'text/html' }));

    outname.textContent = built.filename;
    out.hidden = false;          /* before fitFrame: a hidden box measures zero,
                                    which scaled the whole preview to nothing */
    frame.onload = function () { goTo(0); };
    frame.src = previewUrl;
    slide = 0;
    fitFrame();
    updateNav();

    status.textContent = 'Nine slides built' + (ms ? ' in ' + ms + ' ms' : '') +
      ', straight from the record.';
    status.className = 'try-status is-good';
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ------------------------------------------------- fitting and paging */
  /* The deck is authored at a fixed 1280 x 720 because that is what it has to
     be when it prints. Scaling the iframe rather than the deck keeps the file
     that gets downloaded identical to the file that gets printed. */
  function fitFrame() {
    var box = frame.parentNode;
    if (!box.clientWidth) return;   /* still hidden; fit again once it is shown */
    var s = box.clientWidth / SLIDE_W;
    frame.style.width = SLIDE_W + 'px';
    frame.style.height = SLIDE_H + 'px';
    frame.style.transform = 'scale(' + s + ')';
    frame.style.transformOrigin = '0 0';
    box.style.height = Math.round(SLIDE_H * s) + 'px';
  }

  function goTo(n) {
    slide = Math.max(0, Math.min(TOTAL - 1, n));
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ cpSlide: slide }, '*');
    }
    updateNav();
  }

  function updateNav() {
    var c = $('cp-count');
    if (c) c.textContent = (slide + 1) + ' / ' + TOTAL;
    $('cp-prev').disabled = slide === 0;
    $('cp-next').disabled = slide === TOTAL - 1;
  }

  $('cp-prev').addEventListener('click', function () { goTo(slide - 1); });
  $('cp-next').addEventListener('click', function () { goTo(slide + 1); });
  window.addEventListener('resize', function () { if (built) fitFrame(); });

  /* ------------------------------------------------------------- actions */
  $('cp-open').addEventListener('click', function () {
    if (blobUrl) window.open(blobUrl, '_blank', 'noopener');
  });
  $('cp-download').addEventListener('click', function () {
    if (!built) return;
    var a = document.createElement('a');
    a.href = blobUrl;
    a.download = built.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
  $('cp-print').addEventListener('click', function () {
    if (!frame.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  });

  input.addEventListener('input', function () {
    go.disabled = !window.CPDeck.resolve(input.value, data);
    if (!input.value.trim()) {
      status.textContent = 'Paste a URL, or pick one below.';
      status.className = 'try-status';
    }
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !go.disabled) { e.preventDefault(); extract(); }
  });
  go.addEventListener('click', extract);
  $('cp-build').addEventListener('click', create);
  $('cp-reset').addEventListener('click', function () {
    edited = JSON.parse(JSON.stringify(current));
    renderFields();
    status.textContent = 'Fields reset to what was extracted.';
    status.className = 'try-status';
  });
})();
