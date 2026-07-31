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

  var PINE = '#1E4D3B', KRAFT = '#A87D52', INK = '#232A26',
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

  function buildEmail(fam) {
    LINKS = [];
    var camp = 'cp-' + fam.key.toLowerCase() + '-launch';
    var site = (DATA.site || 'https://cambiumpak.com').replace(/\/$/, '');
    var docs = fam.documents || {};
    var spec = docs.spec, feat = docs.features;
    var first = (fam.description || '').split(/(?<=\.)\s+/)[0] || fam.description || '';
    var second = (fam.description || '').split(/(?<=\.)\s+/).slice(1, 3).join(' ');

    var head =
      '<tr><td style="padding:26px 32px 18px;border-bottom:1px solid ' + HAIR + ';">' +
      '<a href="' + esc(link(site + '/', ELEMENTS.headerLogo, 'Header logo', camp)) + '" ' +
      'style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;' +
      'color:' + PINE + ';text-decoration:none;letter-spacing:-0.3px;">Cambium' +
      '<span style="color:' + KRAFT + ';">Pak</span></a></td></tr>';

    /* The product shots are square-ish. At the full 600px one of them fills a
       phone screen on its own and the copy never gets seen, so the hero sits
       at 320 in a padded cell, centred, the way a real product email runs. */
    var hero =
      '<tr><td align="center" style="padding:22px 32px 4px;">' +
      '<a href="' + esc(link(fam.url, ELEMENTS.heroImage, 'Hero image', camp)) + '">' +
      '<img src="' + esc(fam.cover || '') + '" width="320" alt="' + esc(fam.name) + '" ' +
      'style="display:block;width:320px;max-width:100%;height:auto;border:0;"></a></td></tr>';

    var body =
      row('<h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;' +
          'font-size:26px;line-height:1.2;color:' + PINE + ';">' + esc(fam.name) + '</h1>' +
          '<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;' +
          'color:' + KRAFT + ';text-transform:uppercase;letter-spacing:1px;">' +
          esc(fam.tagline || '') + '</p>' +
          '<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:16px;' +
          'line-height:1.6;color:' + INK + ';">' + esc(first) + '</p>' +
          '<p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;' +
          'line-height:1.6;color:' + INK + ';">' + esc(second) + '</p>',
          '26px 32px 0');

    var cta = row('<div style="padding-bottom:26px;">' +
      button(link(fam.url, ELEMENTS.cta, 'Primary call to action', camp),
             'See the range') + '</div>');

    var specs = (fam.specification || []).slice(0, 3).map(function (x) {
      return '<tr><td style="padding:7px 0;border-bottom:1px solid ' + HAIR + ';' +
        'font-family:Arial,Helvetica,sans-serif;font-size:14px;color:' + MUTE + ';">' +
        esc(x.label) + '</td><td style="padding:7px 0;border-bottom:1px solid ' + HAIR +
        ';font-family:Arial,Helvetica,sans-serif;font-size:14px;color:' + INK +
        ';text-align:right;font-weight:bold;">' + esc(x.value) + '</td></tr>';
    }).join('');

    var specBlock = row(
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="border-collapse:collapse;margin-bottom:24px;">' + specs + '</table>');

    var docRows = [];
    if (spec) docRows.push(['spec', spec, ELEMENTS.doc, 'Spec sheet download']);
    if (feat) docRows.push(['features', feat, ELEMENTS.doc, 'Features sheet download']);
    var docBlock = row(
      '<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;' +
      'text-transform:uppercase;letter-spacing:1px;color:' + MUTE + ';">The documents</p>' +
      docRows.map(function (d) {
        var href = site + '/documents/' + d[1].file;
        return '<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;">' +
          '<a href="' + esc(link(href, d[2], d[3], camp)) + '" style="color:' + PINE +
          ';text-decoration:underline;">' + esc(d[1].title) + '</a>' +
          '<span style="color:' + MUTE + ';"> &nbsp;' + d[1].pages + ' pages</span></p>';
      }).join('') +
      '<p style="margin:14px 0 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;">' +
      '<a href="' + esc(link(site + '/samples.html', ELEMENTS.sectionLink,
                             'Section text link', camp)) +
      '" style="color:' + PINE + ';text-decoration:underline;">Request a sample</a></p>');

    /* The compliance block. It is assembled here, from a constant, and there
       is no argument, setting or model output that can remove it. */
    var footer =
      '<tr><td style="padding:22px 32px 30px;background:#F0ECE2;' +
      'border-top:1px solid ' + HAIR + ';">' +
      '<a href="' + esc(link(site + '/', ELEMENTS.footerLogo, 'Footer logo', camp)) + '" ' +
      'style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;' +
      'color:' + PINE + ';text-decoration:none;">CambiumPak</a>' +
      '<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;' +
      'line-height:1.6;color:' + MUTE + ';">' +
      '<a href="' + esc(link('https://www.linkedin.com/company/cambiumpak',
                             ELEMENTS.social + '-linkedin', 'Social, LinkedIn', camp)) +
      '" style="color:' + MUTE + ';">LinkedIn</a> &nbsp;&middot;&nbsp; ' +
      '<a href="' + esc(link(site + '/contact.html', ELEMENTS.footerLink,
                             'Footer link', camp)) +
      '" style="color:' + MUTE + ';">Contact</a></p>' +
      '<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;' +
      'line-height:1.6;color:' + MUTE + ';">You are receiving this because you ' +
      'requested packaging information from CambiumPak.<br>' +
      '<a href="' + esc(link('{{unsubscribe_url}}', 'compliance', 'Opt-out', camp)) +
      '" style="color:' + MUTE + ';text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp; ' +
      '<a href="' + esc(link('mailto:hello@cambiumpak.com', 'compliance',
                             'Contact address', camp)) +
      '" style="color:' + MUTE + ';text-decoration:underline;">hello@cambiumpak.com</a>' +
      '<br>CambiumPak, 1400 Kraft Way, Albuquerque NM 87102</p></td></tr>';

    var preheader =
      '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' +
      esc(fam.tagline || fam.name) + ' &mdash; spec sheet, comparison and samples inside.' +
      '&#8203;'.repeat(60) + '</div>';

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
      head + hero + body + cta + specBlock + docBlock + footer +
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
