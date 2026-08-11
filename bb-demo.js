/* belleofthebot demonstrator.
   The case study argues that the cards mark their claims and the quizzes
   teach rather than score. Easier to show than to say, so both run here,
   on the real content, with the real answer positions.
   No dependencies. Data below is generated from the site's own source. */
(function () {
  'use strict';
  var CARD = {"term": "misuse and misalignment", "kick": "two words people use as one", "hook": "AI <span class=\"rose\">misalignment</span> needs no villain.", "q": "&ldquo;Misalignment&rdquo; means:", "icon": "i-twocause", "reveal": "The system pursues <span class=\"rose\">something other</span> than what was intended.", "revsub": "No villain. No malfunction. The system works exactly as built and the outcome is still bad.", "threekick": "three ways harm arrives", "threefoot": "The third is the one almost no coverage has a word for.", "whyicon": "i-two", "whykick": "why the mix up wrecks the argument", "why": "Every plan that starts with &ldquo;we just stop bad people using it&rdquo; is aimed at <span class=\"rose\">one third</span> of the problem.", "whysub": "The other two thirds need something other than a rule about who is allowed to press the button.", "file": "<span class=\"rose\">Definitions</span>. The categories are standard. Which one dominates is argued.", "src": "Zwetsloot and Dafoe, Accidents, Misuse<br>and Structure, Lawfare, 11 February 2019", "unknown": "The two overlap in real incidents and there is usually no clean way to attribute a failure to one or the other. Most actual cases involve a person who wanted something and a system that supplied <span class=\"rose\">a version of it</span>.", "opts": ["A person deliberately using a system to cause harm to others", "A system that has broken down and stopped working properly", "A system refusing the instructions its operator gives it", "A system pursuing something other than what was intended"], "correct": 3, "three": [["i-hand", "Misuse.", "A person deliberately uses a capable system to do damage."], ["i-drift", "Misalignment.", "The system pursues something other than what was meant."], ["i-loop", "Structural.", "Nobody misused it, nothing malfunctioned, and it still went badly."]], "flag": "definition"};
  var QUIZ = [{"q": "A hallucination is:", "a": ["A coding fault that makes the model emit garbage", "A gap in the training data that the model flags", "Output produced when the servers are overloaded", "Confidently stated output that is not true"], "correct": 3, "why": "Not a malfunction. The same machinery that produces the right answers produces this one.", "icon": "i-wrong", "term": "hallucination"}, {"q": "Specification gaming is when a system:", "a": ["refuses a request because it cannot establish who is asking", "satisfies the objective it was given in a way nobody intended", "invents a citation that does not exist and states it plainly", "drifts away from its objective as a conversation gets longer"], "correct": 1, "why": "The optimiser did not fail. The instruction did.", "icon": "i-game", "term": "specification gaming"}, {"q": "Amazon and Google have each put billions into Anthropic. Their ownership stakes are:", "a": ["Only half public: filings put Google near 14 percent, Amazon has never said", "Published in full in each company’s annual report", "Fixed at ten percent each, under a written agreement", "Never disclosed by anyone, at any point, in any filing"], "correct": 0, "why": "Google holds about 14 percent, capped at 15, with no voting rights and no board seat. Amazon has never given a figure.", "icon": "i-stake", "term": "who owns the labs"}];
  var SPRITE = "<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><defs><g id=\"i-twocause\"> <circle cx=\"12\" cy=\"16\" r=\"5\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\"/> <path d=\"M18 21 C30 26 32 30 40 32\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/> <path d=\"M8 50 C22 50 26 38 40 34\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-dasharray=\"5 5\"/> <path d=\"M47 27 L57 37 M57 27 L47 37\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" stroke-linecap=\"round\"/> </g><g id=\"i-hand\"> <circle cx=\"32\" cy=\"18\" r=\"7\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\"/> <path d=\"M18 48 A14 14 0 0 1 46 48\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/> <path d=\"M14 54 H50\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" stroke-linecap=\"round\"/> </g><g id=\"i-drift\"> <path d=\"M8 44 C20 44 22 24 34 24 C44 24 46 36 56 36\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/> <path d=\"M8 52 H56\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"5 5\"/> </g><g id=\"i-loop\"> <path d=\"M12 22 H40 A11 11 0 0 1 40 44 H22\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\"/> <path d=\"M29 38 L21 44 L29 50\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/> <path d=\"M50 16 L58 24 M58 16 L50 24\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" stroke-linecap=\"round\"/> </g><g id=\"i-two\"> <path d=\"M10 20 H28 M10 30 H24\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" stroke-linecap=\"round\"/> <path d=\"M36 40 H56 M40 50 H56\" stroke=\"var(--ic-mint)\" stroke-width=\"3\" stroke-linecap=\"round\"/> <path d=\"M30 25 H34 M30 45 H34\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" stroke-linecap=\"round\"/> </g><g id=\"i-wrong\"> <rect x=\"12\" y=\"18\" width=\"40\" height=\"28\" rx=\"8\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\"/> <path d=\"M20 28 H44 M20 36 H36\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" stroke-linecap=\"round\"/> <path d=\"M44 44 L54 54 M54 44 L44 54\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" stroke-linecap=\"round\"/> </g><g id=\"i-game\"> <circle cx=\"32\" cy=\"32\" r=\"18\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" fill=\"none\"/> <circle cx=\"32\" cy=\"32\" r=\"7\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" fill=\"none\"/> <path d=\"M8 56 L52 20\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" stroke-linecap=\"round\"/> <path d=\"M46 18 L54 18 L54 26\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/> </g><g id=\"i-stake\"> <circle cx=\"24\" cy=\"32\" r=\"14\" stroke=\"var(--ic-dim)\" stroke-width=\"3\" fill=\"none\"/> <circle cx=\"42\" cy=\"32\" r=\"14\" stroke=\"var(--ic-rose)\" stroke-width=\"3\" fill=\"none\" stroke-dasharray=\"6 5\"/> </g></defs></svg>";


  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c;
    if (h != null) e.innerHTML = h; return e; }
  function ico(id, cls) {
    return '<svg class="' + (cls || 'bbi') + '" viewBox="0 0 64 64" aria-hidden="true">' +
           '<use href="#' + id + '"></use></svg>';
  }

  /* ------------------------------------------------------------ the card */
  var host = document.querySelector('[data-bbcard]');
  if (host) {
    if (!document.getElementById('bb-sprite')) {
      var sp = el('div'); sp.id = 'bb-sprite'; sp.innerHTML = SPRITE;
      document.body.appendChild(sp);
    }
    var panels = [
      function () {                                   /* 1 the hook */
        return '<span class="bbc-kick">' + CARD.kick + '</span>' +
               '<p class="bbc-lead">' + CARD.hook + '</p>' +
               '<p class="bbc-sub">Tap through the card the way a reader would.</p>';
      },
      function () {                                   /* 2 the question */
        return '<span class="bbc-kick">before the answer, a guess</span>' +
               '<p class="bbc-lead" style="font-size:1.1rem">' + CARD.q + '</p>' +
               '<div class="bbc-opts" data-cardopts></div><p class="bbc-fb" data-cardfb></p>';
      },
      function () {                                   /* 3 the reveal */
        return '<span class="bbc-kick">the answer</span>' +
               '<p class="bbc-lead">' + CARD.reveal + '</p>' +
               '<p class="bbc-sub">' + CARD.revsub + '</p>';
      },
      function () {                                   /* 4 three points */
        return '<span class="bbc-kick">' + CARD.threekick + '</span>' +
          CARD.three.map(function (r) {
            return '<div class="bbc-row">' + ico(r[0]) +
                   '<div><b>' + r[1] + '</b><span>' + r[2] + '</span></div></div>';
          }).join('') + '<p class="bbc-foot">' + CARD.threefoot + '</p>';
      },
      function () {                                   /* 5 why */
        return '<span class="bbc-kick">' + CARD.whykick + '</span>' +
               '<div class="bbc-row">' + ico(CARD.whyicon) + '<div><p class="bbc-lead" ' +
               'style="font-size:1.15rem;margin-bottom:8px">' + CARD.why + '</p>' +
               '<span style="color:var(--soft);font-size:var(--size-small)">' + CARD.whysub +
               '</span></div></div>';
      },
      function () {                                   /* 6 the unknowns */
        return '<span class="bbc-kick">what we do not know</span>' +
               '<p class="bbc-sub" style="font-size:1rem;max-width:46ch">' + CARD.unknown + '</p>';
      },
      function () {                                   /* 7 filed */
        return '<span class="bbc-kick">how it is filed</span>' +
               '<p class="bbc-sub" style="font-size:1rem;margin-bottom:14px">' + CARD.file + '</p>' +
               '<p class="bbc-src">' + CARD.src + '</p>';
      }
    ];
    var at = 0, answered = -1;

    host.innerHTML =
      '<div class="bbc-top"><span>AI concepts &middot; ' + CARD.term + '</span>' +
      '<span class="bbc-flag">' + CARD.flag + '</span></div>' +
      '<div class="bbc-body" data-body></div>' +
      '<div class="bbc-nav"><button type="button" data-back>back</button>' +
      '<span class="bbdots" data-dots></span>' +
      '<button type="button" class="go" data-fwd>next</button></div>';

    var body = host.querySelector('[data-body]'),
        dots = host.querySelector('[data-dots]'),
        back = host.querySelector('[data-back]'),
        fwd  = host.querySelector('[data-fwd]');

    for (var i = 0; i < panels.length; i++) {
      var d = el('i'); d.setAttribute('role', 'button');
      d.setAttribute('aria-label', 'panel ' + (i + 1));
      d.dataset.i = i; dots.appendChild(d);
    }
    dots.addEventListener('click', function (e) {
      if (e.target.dataset.i != null) { at = +e.target.dataset.i; draw(); }
    });

    function drawOpts() {
      var box = host.querySelector('[data-cardopts]');
      if (!box) return;
      var fb = host.querySelector('[data-cardfb]');
      CARD.opts.forEach(function (o, n) {
        var b = el('button', 'bbo', o); b.type = 'button';
        if (answered > -1) {
          b.disabled = true;
          if (n === CARD.correct) b.classList.add('yes');
          else if (n === answered) b.classList.add('no');
        }
        b.addEventListener('click', function () {
          if (answered > -1) return;
          answered = n; drawOpts();
        });
        box.appendChild(b);
      });
      if (answered > -1) {
        fb.innerHTML = (answered === CARD.correct
          ? '<b>Yes.</b> ' : '<b>Not that one.</b> ') + CARD.revsub;
      }
    }

    function draw() {
      body.innerHTML = panels[at]();
      drawOpts();
      back.disabled = at === 0;
      fwd.disabled = at === panels.length - 1;
      fwd.textContent = at === panels.length - 2 ? 'the source' : 'next';
      [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === at); });
    }
    back.addEventListener('click', function () { if (at > 0) { at--; draw(); } });
    fwd.addEventListener('click', function () { if (at < panels.length - 1) { at++; draw(); } });
    draw();
  }

  /* ------------------------------------------------------------ the quiz */
  var qhost = document.querySelector('[data-bbquiz]');
  if (!qhost) return;
  var at2 = 0, score = 0, locked = false;

  qhost.innerHTML =
    '<div class="bbq-top"><span data-qcount></span><span data-qscore></span></div>' +
    '<div class="bbq-bar"><span class="bbq-fill" data-qfill></span></div>' +
    '<div data-qbody></div>';
  var qbody = qhost.querySelector('[data-qbody]');

  function paint() {
    var q = QUIZ[at2];
    qhost.querySelector('[data-qcount]').textContent = (at2 + 1) + ' of ' + QUIZ.length;
    qhost.querySelector('[data-qscore]').textContent = score + ' correct';
    qhost.querySelector('[data-qfill]').style.width =
      Math.round((at2 / QUIZ.length) * 100) + '%';
    qbody.innerHTML =
      '<div class="bbq-head">' + ico(q.icon, 'bbi') +
      '<h3 class="bbq-q">' + q.q + '</h3></div>' +
      '<div class="bbc-opts" data-qopts></div>' +
      '<p class="bbq-fb" data-qfb></p>' +
      '<div class="bbq-nav"><span>' + q.term +
      '</span><button type="button" data-qnext disabled>' +
      (at2 === QUIZ.length - 1 ? 'see result' : 'next') + '</button></div>';

    var box = qbody.querySelector('[data-qopts]'),
        fb = qbody.querySelector('[data-qfb]'),
        next = qbody.querySelector('[data-qnext]');
    locked = false;
    q.a.forEach(function (o, n) {
      var b = el('button', 'bbo', o); b.type = 'button';
      b.addEventListener('click', function () {
        if (locked) return;
        locked = true;
        var right = n === q.correct;
        if (right) score++;
        [].forEach.call(box.children, function (x, m) {
          x.disabled = true;
          if (m === q.correct) x.classList.add('yes');
          else if (m === n) x.classList.add('no');
        });
        /* a wrong answer always names the right one. That rule is the point. */
        fb.innerHTML = (right ? '<span class="y">Correct.</span> '
          : '<span class="n">Not quite.</span> The answer is <b>' + q.a[q.correct] + '</b>. ')
          + q.why;
        qhost.querySelector('[data-qscore]').textContent = score + ' correct';
        next.disabled = false;
      });
      box.appendChild(b);
    });
    next.addEventListener('click', function () {
      if (at2 < QUIZ.length - 1) { at2++; paint(); } else { done(); }
    });
  }

  function done() {
    qhost.querySelector('[data-qfill]').style.width = '100%';
    qbody.innerHTML =
      '<div class="bbq-done"><span class="sc">' + score + ' out of ' + QUIZ.length + '</span>' +
      '<p>' + (score === QUIZ.length
        ? 'All three. The real thing has fifteen rounds of this and gets harder.'
        : 'On the site a level is ten to twelve of these, and eighty percent opens the next one.') +
      '</p><div class="bbq-nav" style="justify-content:center">' +
      '<button type="button" data-qagain style="margin:0">try again</button></div></div>';
    qbody.querySelector('[data-qagain]').addEventListener('click', function () {
      at2 = 0; score = 0; paint();
    });
  }
  paint();
})();

