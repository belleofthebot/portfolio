/* The campaign email generator, running in the browser.
 *
 * The employer tool fetches a product page server-side, hands the copy to a
 * model against a system prompt that encodes the brand and the email spec,
 * and then audits the output. A browser cannot fetch cambiumpak.com, so this
 * resolves the URL against the bundled product record instead. Everything
 * after the lookup is the real thing: the same 600px table layout, the same
 * UTM taxonomy, and the same deterministic audit reading the actual output
 * HTML rather than asking a model whether it did the job.
 *
 * The point of the page is the tagging switch. Turn enforcement off and the
 * email still looks perfect, which is exactly why hand-tagged campaigns rot:
 * nothing about a mistagged link looks wrong until the reporting is already
 * wrong. The audit is the only thing that can see it.
 */
(function (global) {
  'use strict';

  var PINE = '#1E4D3B', KRAFT = '#A87D52', KRAFT_DEEP = '#8A6138', INK = '#232A26',
      PAPER = '#F7F4ED', HAIR = '#DDD5C6', MUTE = '#6E7A70';

  /* The taxonomy. utm_medium carries the element type, which is the whole
     reason a report can tell a hero image from a footer link. */
  var SOURCE = 'newsletter';
  var ELEMENTS = {
    headerLogo:  'header-logo',
    heroImage:   'hero-image',
    cta:         'action-cta',
    doc:         'document-download',
    sectionImg:  'section-image',
    sectionLink: 'section-text-link',
    footerLogo:  'footer-logo',
    footerLink:  'footer-link',
    social:      'social'
  };

  var state = { key: null, tagging: 'on', view: 'email' };
  var DATA = null, FAM = null, LINKS = [];

  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function families() {
    return (DATA && DATA.families) || [];
  }

  /* ------------------------------------------------------------- tagging */

  /* Exempt by rule, not by accident: a mailto has nowhere to put a campaign,
     an in-message anchor never leaves the message, and a merge tag is resolved
     by the sending platform after we are done with it. */
  function exempt(url) {
    return /^mailto:/i.test(url) || /^#/.test(url) || /^\s*\{\{/.test(url) ||
           /^tel:/i.test(url);
  }

  function tag(url, medium, campaign) {
    if (exempt(url)) return url;
    if (state.tagging !== 'on') return url;
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    return url + sep + 'utm_source=' + SOURCE + '&utm_medium=' + medium +
           '&utm_campaign=' + campaign;
  }

  /* Every link in the email goes through here, so the audit and the markup
     cannot disagree about what was emitted. */
  function link(href, medium, label, campaign) {
    var out = tag(href, medium, campaign);
    LINKS.push({ element: medium, label: label, href: href, out: out,
                 exempt: exempt(href) });
    return out;
  }

  /* --------------------------------------------------------------- email */

  function button(href, label) {
    /* VML for Outlook, a real anchor for everything else. Outlook on Windows
       renders neither padding nor border-radius on an anchor, so the shape has
       to be drawn as a vector rectangle it does understand. */
    return '' +
      '<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" ' +
      'xmlns:w="urn:schemas-microsoft-com:office:word" href="' + esc(href) +
      '" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="12%" ' +
      'strokecolor="' + PINE + '" fillcolor="' + PINE + '">' +
      '<w:anchorlock/><center style="color:' + PAPER + ';font-family:Arial,sans-serif;' +
      'font-size:15px;font-weight:bold;">' + esc(label) + '</center>' +
      '</v:roundrect><![endif]-->' +
      '<!--[if !mso]><!-- -->' +
      '<a href="' + esc(href) + '" style="background:' + PINE + ';border-radius:5px;' +
      'color:' + PAPER + ';display:inline-block;font-family:Arial,Helvetica,sans-serif;' +
      'font-size:15px;font-weight:bold;line-height:44px;text-align:center;' +
      'text-decoration:none;width:260px;-webkit-text-size-adjust:none;">' +
      esc(label) + '</a>' +
      '<!--<![endif]-->';
  }

  function row(inner, pad) {
    return '<tr><td style="padding:' + (pad || '0 32px') + ';">' + inner + '</td></tr>';
  }

  /* Right-for lines. A campaign email is not a spec sheet: the buyer wants to
     know whether this is for them before they want to know its burst strength.
     Invented, like the rest of CambiumPak. */
  var USES = {
    MLR:  ['Direct-to-consumer apparel and books', 'Anything that ships flat and makes up at the bench', 'Returns, because it closes twice'],
    CTN:  ['Case packing and pallet shipping', 'Mixed-SKU order consolidation', 'Anything over 10kg'],
    BWM:  ['Books, prints and framed work', 'Variable-depth items on one SKU', 'Subscription boxes'],
    PPE:  ['Small parts, cosmetics, jewellery', 'Replacing bubble mailers outright', 'Letterbox-friendly despatch'],
    DIV:  ['Glassware and bottled goods', 'Kitting multiple items in one carton', 'Anything that must not touch'],
    T06:  ['Bottles, jars and cans, six-up', 'Retail-ready presentation', 'Cold chain and produce'],
    T12:  ['High-volume bottling and canning', 'Twelve-up case packing', 'Retail-ready presentation'],
    CNR:  ['Furniture, panels and framed goods', 'Edge protection on palletised loads', 'Anything with a corner to lose'],
    HC24: ['Wrapping irregular shapes', 'Replacing bubble wrap on the line', 'Fragile goods with no fixed size'],
    CR18: ['Void fill in mixed-SKU cartons', 'Gift and subscription presentation', 'Anything that rattles'],
    TP70: ['Tamper-evident carton closure', 'High-volume despatch benches', 'Anywhere plastic tape is being designed out']
  };

  function tags(fam) {
    return (fam.tags || []).slice(0, 4).map(function (t) {
      return '<span style="display:inline-block;border:1px solid ' + HAIR + ';border-radius:3px;' +
        'padding:4px 9px;margin:0 6px 6px 0;font-family:Arial,Helvetica,sans-serif;' +
        'font-size:12px;color:' + KRAFT_DEEP + ';">' + esc(t) + '</span>';
    }).join('');
  }

  function buildEmail(fam) {
    LINKS = [];
    var camp = 'cp-' + fam.key.toLowerCase() + '-launch';
    var site = (DATA.site || 'https://cambiumpak.com').replace(/\/$/, '');
    var docs = fam.documents || {};
    var spec = docs.spec;
    var first = (fam.description || '').split(/(?<=\.)\s+/)[0] || '';
    var rec = fam.recycled || {};
    var pct = rec.low_pct === rec.high_pct
      ? rec.low_pct + '%'
      : rec.low_pct + '–' + rec.high_pct + '%';
    var uses = USES[fam.key] || ['Everyday despatch', 'Mixed-SKU orders', 'Anything fragile'];

    /* two other families, so the mail reads as a campaign rather than a
       one-product announcement */
    var others = families().filter(function (f) { return f.key !== fam.key; }).slice(0, 2);

    var A = 'font-family:Arial,Helvetica,sans-serif;';
    var pad = '0 34px';

    function cell(inner, p) {
      return '<tr><td style="padding:' + (p || pad) + ';">' + inner + '</td></tr>';
    }

    var head =
      '<tr><td style="padding:22px 34px 16px;border-bottom:1px solid ' + HAIR + ';">' +
      '<a href="' + esc(link(site + '/', ELEMENTS.headerLogo, 'Header logo', camp)) + '" ' +
      'style="' + A + 'font-size:19px;font-weight:bold;color:' + PINE +
      ';text-decoration:none;letter-spacing:-0.3px;">Cambium' +
      '<span style="color:' + KRAFT + ';">Pak</span></a></td></tr>';

    /* hero photograph, full bleed */
    var hero =
      '<tr><td style="padding:0;">' +
      '<a href="' + esc(link(fam.url, ELEMENTS.heroImage, 'Hero image', camp)) + '">' +
      '<img src="cp-scene-board.jpg" width="600" alt="Corrugated board" ' +
      'style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>';

    var intro = cell(
      '<p style="margin:0 0 8px;' + A + 'font-size:12px;font-weight:bold;' +
      'letter-spacing:1.4px;text-transform:uppercase;color:' + KRAFT_DEEP + ';">New this quarter</p>' +
      '<h1 style="margin:0 0 4px;' + A + 'font-size:28px;line-height:1.15;color:' + PINE + ';">' +
      esc(fam.name) + '</h1>' +
      '<p style="margin:0 0 14px;' + A + 'font-size:15px;color:' + MUTE + ';">' +
      esc(fam.tagline || '') + '</p>' +
      '<p style="margin:0 0 16px;' + A + 'font-size:16px;line-height:1.62;color:' + INK + ';">' +
      esc(first) + '</p>' + tags(fam), '26px 34px 0');

    /* the product itself, beside what it is for */
    var feature = cell(
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;margin:22px 0 0;"><tr>' +
      '<td width="228" valign="top" style="padding:0 18px 0 0;">' +
      '<a href="' + esc(link(fam.url, ELEMENTS.sectionImg, 'Product image', camp)) + '">' +
      '<img src="' + esc(fam.cover || '') + '" width="228" alt="' + esc(fam.name) + '" ' +
      'style="display:block;width:228px;max-width:100%;height:auto;border:1px solid ' +
      HAIR + ';border-radius:4px;"></a></td>' +
      '<td valign="top">' +
      '<p style="margin:0 0 10px;' + A + 'font-size:12px;font-weight:bold;letter-spacing:1.2px;' +
      'text-transform:uppercase;color:' + MUTE + ';">Right for</p>' +
      uses.map(function (u) {
        return '<p style="margin:0 0 8px;' + A + 'font-size:14px;line-height:1.5;color:' +
          INK + ';">&bull;&nbsp; ' + esc(u) + '</p>';
      }).join('') +
      '</td></tr></table>');

    var cta = cell('<div style="padding:22px 0 4px;">' +
      button(link(fam.url, ELEMENTS.cta, 'Primary call to action', camp),
             'See the range') + '</div>');

    /* the values half, which is why a packaging buyer opened this at all */
    var green =
      '<tr><td style="padding:26px 0 0;">' +
      '<a href="' + esc(link(site + '/sustainability.html', ELEMENTS.sectionImg,
                             'Sustainability image', camp)) + '">' +
      '<img src="cp-scene-forest.jpg" width="600" alt="" ' +
      'style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>' +
      '<tr><td style="padding:20px 34px;background:#EDF1E7;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
      '<td width="140" valign="top" style="padding-right:14px;">' +
      '<p style="margin:0;' + A + 'font-size:30px;font-weight:bold;' +
      'color:#5C6E45;line-height:1;white-space:nowrap;">' + pct + '</p>' +
      '<p style="margin:5px 0 0;' + A + 'font-size:11px;color:#5C6E45;">band ' +
      esc(rec.band || '') + '</p></td>' +
      '<td valign="top"><p style="margin:0 0 8px;' + A + 'font-size:14px;line-height:1.6;color:' +
      INK + ';">Post-consumer recycled content, verified by mill declaration and lot ' +
      'sampling rather than asserted on a label.</p>' +
      '<p style="margin:0;' + A + 'font-size:13px;line-height:1.6;color:' + MUTE + ';">' +
      'Plastic-free, kerbside recyclable, and printed water-based on uncoated kraft.</p>' +
      '</td></tr></table></td></tr>';

    /* one document, not four. A campaign asks for one thing. */
    var docBlock = cell(
      '<p style="margin:24px 0 10px;' + A + 'font-size:15px;line-height:1.6;color:' + INK + ';">' +
      'Want the numbers? The spec sheet has the board grades, the burst strength and ' +
      'the full size table.</p>' +
      '<p style="margin:0 0 6px;' + A + 'font-size:15px;">' +
      '<a href="' + esc(link(site + '/documents/' + (spec ? spec.file : 'spec.pdf'),
                             ELEMENTS.doc, 'Spec sheet download', camp)) +
      '" style="color:' + PINE + ';font-weight:bold;">Download the spec sheet</a>' +
      '<span style="color:' + MUTE + ';">&nbsp; ' + (spec ? spec.pages : 4) + ' pages, PDF</span></p>' +
      '<p style="margin:0;' + A + 'font-size:15px;">' +
      '<a href="' + esc(link(site + '/samples.html', ELEMENTS.sectionLink,
                             'Sample request link', camp)) +
      '" style="color:' + PINE + ';">Or ask us for a sample pack</a>' +
      '<span style="color:' + MUTE + ';">&nbsp; two working days, no charge</span></p>');

    var alsoCells = others.map(function (o) {
      return '<td width="50%" valign="top" style="padding:0 8px;">' +
        '<a href="' + esc(link(o.url, ELEMENTS.sectionImg, 'Also new, ' + o.name, camp)) + '">' +
        '<img src="' + esc(o.cover || '') + '" width="256" alt="' + esc(o.name) + '" ' +
        'style="display:block;width:100%;height:auto;border:1px solid ' + HAIR +
        ';border-radius:4px;"></a>' +
        '<p style="margin:9px 0 0;' + A + 'font-size:14px;font-weight:bold;">' +
        '<a href="' + esc(link(o.url, ELEMENTS.sectionLink, 'Also new link, ' + o.name, camp)) +
        '" style="color:' + PINE + ';text-decoration:none;">' + esc(o.name) + '</a></p>' +
        '<p style="margin:3px 0 0;' + A + 'font-size:12px;color:' + MUTE + ';">' +
        esc(o.tagline || '') + '</p></td>';
    }).join('');

    var also = cell(
      '<p style="margin:26px 0 12px;' + A + 'font-size:12px;font-weight:bold;letter-spacing:1.2px;' +
      'text-transform:uppercase;color:' + MUTE + ';border-top:1px solid ' + HAIR +
      ';padding-top:20px;">Also new</p>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;"><tr>' + alsoCells + '</tr></table>' +
      '<div style="height:26px;"></div>', '0 26px');

    /* The compliance block. Assembled from a constant, with no argument,
       setting or model output that can remove it. */
    var footer =
      '<tr><td style="padding:22px 34px 30px;background:#F0ECE2;' +
      'border-top:1px solid ' + HAIR + ';">' +
      '<a href="' + esc(link(site + '/', ELEMENTS.footerLogo, 'Footer logo', camp)) + '" ' +
      'style="' + A + 'font-size:14px;font-weight:bold;color:' + PINE +
      ';text-decoration:none;">CambiumPak</a>' +
      '<p style="margin:8px 0 0;' + A + 'font-size:12px;line-height:1.6;color:' + MUTE + ';">' +
      '<a href="' + esc(link('https://www.linkedin.com/company/cambiumpak',
                             ELEMENTS.social + '-linkedin', 'Social, LinkedIn', camp)) +
      '" style="color:' + MUTE + ';">LinkedIn</a> &nbsp;&middot;&nbsp; ' +
      '<a href="' + esc(link(site + '/contact.html', ELEMENTS.footerLink,
                             'Footer link', camp)) +
      '" style="color:' + MUTE + ';">Contact</a></p>' +
      '<p style="margin:12px 0 0;' + A + 'font-size:12px;line-height:1.6;color:' + MUTE + ';">' +
      'You are receiving this because you requested packaging information from ' +
      'CambiumPak.<br>' +
      '<a href="' + esc(link('{{unsubscribe_url}}', 'compliance', 'Opt-out', camp)) +
      '" style="color:' + MUTE + ';text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp; ' +
      '<a href="' + esc(link('mailto:hello@cambiumpak.com', 'compliance',
                             'Contact address', camp)) +
      '" style="color:' + MUTE + ';text-decoration:underline;">hello@cambiumpak.com</a>' +
      '<br>CambiumPak, 1400 Kraft Way, Albuquerque NM 87102</p></td></tr>';

    var preheader =
      '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' +
      esc(fam.name) + ' is here, plus ' + pct + ' recycled fibre and a sample pack ' +
      'on request.' + '&#8203;'.repeat(60) + '</div>';

    return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<!--[if mso]><xml><o:OfficeDocumentSettings>' +
      '<o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->' +
      '<title>' + esc(fam.name) + '</title></head>' +
      '<body style="margin:0;padding:0;background:#E8E3D7;">' + preheader +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#E8E3D7;"><tr><td align="center" style="padding:22px 12px;">' +
      '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" ' +
      'style="width:600px;max-width:600px;background:' + PAPER + ';border-collapse:collapse;">' +
      head + hero + intro + feature + cta + green + docBlock + also + footer +
      '</table></td></tr></table></body></html>';
  }

  /* --------------------------------------------------------------- audit */

  /* Deterministic, and run against the emitted HTML rather than against the
     intention. If the markup and the link log ever disagreed, this is what
     would catch it. */
  function audit(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var rows = [];
    var anchors = doc.querySelectorAll('a[href]');
    /* Match the log to the markup by walking both in order, not by looking up
       the href. With tagging off, the header logo and the footer logo are the
       same string, and so are the hero image and the call to action, so a
       lookup by href attributes half the rows to the wrong element. An audit
       that mislabels its own findings is worse than no audit. */
    var pi = 0;
    anchors.forEach(function (a) {
      var href = a.getAttribute('href');
      var rec = null;
      for (var i = pi; i < LINKS.length; i++) {
        if (LINKS[i].out === href) { rec = LINKS[i]; pi = i + 1; break; }
      }
      var isExempt = exempt(href);
      var tagged = /utm_source=/.test(href) && /utm_medium=/.test(href) &&
                   /utm_campaign=/.test(href);
      rows.push({
        label: rec ? rec.label : (a.textContent.trim().slice(0, 24) || 'link'),
        element: rec ? rec.element : '-',
        href: href,
        verdict: isExempt ? 'exempt' : (tagged ? 'tagged' : 'untagged')
      });
    });
    /* The VML button is an Outlook-only path, so its href never appears in the
       DOM parse above. It is a real link to a real recipient and it counts. */
    var mso = html.match(/<v:roundrect[^>]*href="([^"]+)"/);
    if (mso) {
      var h = mso[1].replace(/&amp;/g, '&');
      rows.push({ label: 'Primary call to action, Outlook', element: ELEMENTS.cta,
        href: h, verdict: /utm_source=/.test(h) ? 'tagged' : 'untagged' });
    }
    return rows;
  }

  /* ------------------------------------------------------------- render */

  function pill(v) {
    return '<span class="ea-v ea-' + v + '">' + v + '</span>';
  }

  function renderAudit(rows) {
    var untagged = rows.filter(function (r) { return r.verdict === 'untagged'; }).length;
    var head = untagged
      ? '<p class="ea-fail"><b>' + untagged + ' of ' + rows.length +
        ' links carry no campaign tag.</b> The email looks finished. Every click ' +
        'it earns will land in the report as direct traffic, and nobody will ' +
        'notice until somebody asks which campaign worked.</p>'
      : '<p class="ea-pass"><b>' + rows.length + ' links, all accounted for.</b> ' +
        'Checked against the emitted HTML, not against what the generator meant ' +
        'to emit.</p>';
    return head +
      '<div class="ea-tbl"><div class="ea-th"><span>element</span><span>what it is</span>' +
      '<span>destination</span><span>verdict</span></div>' +
      rows.map(function (r) {
        var d = r.href.length > 74 ? r.href.slice(0, 74) + '…' : r.href;
        return '<div class="ea-tr"><span class="ea-el">' + esc(r.element) + '</span>' +
          '<span>' + esc(r.label) + '</span>' +
          '<span class="ea-href">' + esc(d) + '</span>' + pill(r.verdict) + '</div>';
      }).join('') + '</div>';
  }

  function render() {
    var root = document.getElementById('eml');
    if (!root || !FAM) return;
    var html = buildEmail(FAM);
    var rows = audit(html);

    root.querySelector('.ea-out').hidden = false;
    var frame = root.querySelector('#ea-frame');
    frame.srcdoc = html;

    root.querySelector('.ea-audit').innerHTML = renderAudit(rows);
    root.querySelector('.ea-src').textContent = html;

    root.querySelectorAll('[data-view]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-view') === state.view);
    });
    ['email', 'audit', 'src'].forEach(function (v) {
      root.querySelector('.ea-pane-' + v).hidden = state.view !== v;
    });
  }

  function pick(key) {
    FAM = families().filter(function (f) { return f.key === key; })[0] || families()[0];
    state.key = FAM && FAM.key;
    var f = document.getElementById('ea-url');
    if (f && FAM) f.value = FAM.url;
    render();
  }

  function resolve(text) {
    var t = (text || '').trim().toLowerCase();
    if (!t) return null;
    return families().filter(function (f) {
      return f.url.toLowerCase() === t || t.indexOf(f.prefix.toLowerCase()) > -1 ||
             t.indexOf('/' + f.prefix.toLowerCase() + '.html') > -1 ||
             f.key.toLowerCase() === t;
    })[0] || null;
  }

  function init() {
    var root = document.getElementById('eml');
    if (!root) return;
    DATA = global.CP_DATA || global.CPDATA || null;
    if (!DATA || !DATA.families) {
      root.querySelector('.ea-note').textContent =
        'The product record did not load, so the demo cannot run here.';
      return;
    }

    root.querySelector('.ea-pickers').innerHTML = families().map(function (f) {
      return '<button type="button" class="ea-p" data-key="' + f.key + '">' +
        esc(f.prefix) + '</button>';
    }).join('');

    root.addEventListener('click', function (e) {
      var p = e.target.closest('.ea-p');
      if (p) { pick(p.getAttribute('data-key')); return; }
      var b = e.target.closest('[data-build]');
      if (b) {
        var f = resolve(document.getElementById('ea-url').value);
        if (!f) {
          root.querySelector('.ea-err').textContent =
            'No CambiumPak product matches that. Try a code like CP-MLR, or pick one above.';
          return;
        }
        root.querySelector('.ea-err').textContent = '';
        pick(f.key);
        return;
      }
      var t = e.target.closest('[data-tagging]');
      if (t) {
        state.tagging = t.getAttribute('data-tagging');
        root.querySelectorAll('[data-tagging]').forEach(function (x) {
          x.classList.toggle('on', x === t);
        });
        render();
        return;
      }
      var v = e.target.closest('[data-view]');
      if (v) { state.view = v.getAttribute('data-view'); render(); return; }
      var lock = e.target.closest('[data-lock]');
      if (lock) {
        var n = root.querySelector('.ea-locknote');
        n.hidden = !n.hidden;
      }
    });

    var url = document.getElementById('ea-url');
    if (url) url.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); root.querySelector('[data-build]').click(); }
    });

    pick('MLR');
  }

  global.EmailDemo = { init: init };
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
