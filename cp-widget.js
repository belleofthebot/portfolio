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

  var current = null, built = null, blobUrl = null, previewUrl = null, slide = 0;
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
      preview();
      input.focus();
    });
    chips.appendChild(b);
  });

  /* -------------------------------------------------- resolve and preview */
  function row(label, value, cls) {
    return '<div class="res-row' + (cls ? ' ' + cls : '') + '"><span>' + esc(label) +
      '</span><b>' + value + '</b></div>';
  }

  function preview() {
    var fam = window.CPDeck.resolve(input.value, data);
    current = fam;
    go.disabled = !fam;
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

    var claimable = fam.badges_claimable;
    var onlySome = fam.badges_held_somewhere.filter(function (b) {
      return claimable.indexOf(b) === -1;
    });
    var pages = ['spec', 'comparison', 'features', 'assembly'].reduce(function (a, k) {
      return a + fam.documents[k].pages;
    }, 0);
    var pcts = fam.skus.map(function (s) { return s.recycled_pct; });
    var pctLabel = Math.min.apply(null, pcts) === Math.max.apply(null, pcts)
      ? pcts[0] + '%'
      : Math.min.apply(null, pcts) + '–' + Math.max.apply(null, pcts) + '%';

    reskey.textContent = fam.prefix;
    resgrid.innerHTML =
      row('Product', esc(fam.name)) +
      row('Codes in the family', fam.skus.map(function (s) {
        return '<span class="res-sku">' + esc(s.code) + '</span>';
      }).join('')) +
      row('Internal dimensions', fam.skus.map(function (s) {
        return esc(s.internal_dimensions);
      }).join('<br>')) +
      row('Badge row, family level', claimable.map(function (b) {
        return '<span class="res-badge">' + esc(b) + '</span>';
      }).join('') + (onlySome.length
        ? '<span class="res-excl">' + esc(onlySome.join(', ')) +
          ' held by some sizes only, so not a family claim</span>'
        : ''), onlySome.length ? 'is-note' : '') +
      row('Recycled content', '<span class="res-moss">' + pctLabel +
        '</span> by weight, band ' + esc(fam.recycled.band)) +
      row('Documents', '4 sheets, ' + pages + ' pages') +
      row('Step drawings', fam.stepCount
        ? fam.stepCount + ' available, first ' + fam.steps.length + ' used'
        : '<span class="res-missing">none built for this family yet</span>',
        fam.stepCount ? '' : 'is-note');

    resolved.hidden = false;
    status.textContent = 'Matched ' + fam.prefix + '. Press create.';
    status.className = 'try-status is-good';
  }

  /* ---------------------------------------------------------- build it */
  function create() {
    if (!current) return;
    var t0 = (window.performance && performance.now) ? performance.now() : 0;
    try {
      built = window.CPDeck.build(current, data);
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

  input.addEventListener('input', preview);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && current) { e.preventDefault(); create(); }
  });
  go.addEventListener('click', create);
})();
