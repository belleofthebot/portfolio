/* ============================================================================
   cards.data.js · one deck, dealt five ways.
   Every project on the portfolio is a card. Each card carries five positions,
   one per lane. A rank of null means "not shown on that lane", which is a
   deliberate, valid position: curation is the point of the lane pages.

   Ranks 1, 2, 3 render as full cards in the lead three.
   Ranks 4 and up render as compact tiles under "More work".
   Every card also carries a per-lane one-liner written for that lane's reader.

   Voice rules enforced here (from CANDIDATE_PROFILE.md red lines):
     · the word "things" never appears
     · no em dashes
     · no emoji, no exclamation points
   Claims rule: every number below appears in claude/ACCOMPLISHMENTS_RECORD.md.
   ========================================================================== */

const LANES = ['ai', 'marketing', 'comms', 'nonprofit', 'design'];

/* --------------------------------------------------------------------------
   CSS-drawn thumbnails. The site's standing convention is recreations rather
   than screenshots, so cards without a photograph get a drawn plate instead
   of a placeholder box. Each is decorative and carries aria-hidden, because
   the card heading and one-liner already carry the meaning.
   -------------------------------------------------------------------------- */
const DRAWN = {
  panels: `<div class="thumb lp-drawn" aria-hidden="true"><div class="lp-panels">
    <i class="p1"></i><i class="p2"></i><i class="p3"></i><i class="p4"></i>
  </div><span class="lp-cap">published panels</span></div>`,

  board: `<div class="thumb lp-drawn" aria-hidden="true"><div class="lp-board">
    <u class="ttl"></u><u class="l1"></u><u class="l2"></u><u class="l3"></u>
    <b class="dot d1"></b><b class="dot d2"></b><b class="dot d3"></b>
  </div><span class="lp-cap">live board, drawn in the room</span></div>`,

  room: `<div class="thumb lp-drawn" aria-hidden="true"><div class="lp-room">
    <i class="wall"></i><b class="h1"></b><b class="h2"></b><b class="h3"></b><b class="h4"></b><b class="h5"></b>
  </div><span class="lp-cap">front of the room</span></div>`,

  sign: `<div class="thumb lp-drawn" aria-hidden="true"><div class="lp-sign">
    <u class="s1"></u><u class="s2"></u><u class="s3"></u>
  </div><span class="lp-cap">self directed, unpaid</span></div>`,
};

/* --------------------------------------------------------------------------
   THE DECK
   -------------------------------------------------------------------------- */
const CARDS = [

  /* ---------------------------------------------------------------- belle -- */
  {
    id: 'belle',
    title: 'Belle of the Bot',
    href: 'https://whatthebot.vercel.app/',
    external: true,
    thumb: {
      src: 'belleofthebot-spotlight.jpg',
      alt: 'The Belle of the Bot homepage: the mascot Belle waving beside the headline "AI is complicated. Let’s learn about it together," with subject and claim-type filter pills below.',
      w: 1600, h: 597,
    },
    tag: 'built solo',
    lanes: {
      ai:        { rank: 3, line: 'An AI literacy site whose 133 explainer cards, quizzes, and social carousels all generate from one data file, so they cannot drift apart. Every claim is marked measurement, theory, definition, or someone’s position.' },
      marketing: { rank: 7, line: 'A content system with its own distribution built in: one data file feeds the site, the quizzes, and the Instagram carousels, which means publishing costs almost nothing per post.' },
      comms:     { rank: 2, line: 'The hardest explaining job I have given myself. 133 cards that take AI research and turn it into something a person will actually read and pass along.' },
      nonprofit: { rank: 3, line: 'Public education built the way a small organization has to build it: one volunteer, one data file, zero recurring cost, and a system that stays consistent as it grows.' },
      design:    { rank: 2, line: 'A 133 card visual system with a working sense of humor. One palette, 67 character expressions assigned by rule, and about 110 icons that all belong to the same hand.' },
    },
  },

  /* ------------------------------------------------------ deck generator -- */
  {
    id: 'deck-generator',
    title: 'Product deck generator',
    href: 'work-deck-generator.html',
    thumb: { src: 'thumb-deck-generator.jpg', alt: 'Three generated slides from the product deck generator, side by side.', w: 1000, h: 372 },
    tag: 'in production',
    lanes: {
      ai:        { rank: 1, line: 'Four form fields in, a brand compliant deck out. It replaced a manual build measured at 42 minutes per product across a 27 product queue, about 19 hours of design time per cycle.' },
      marketing: { rank: 4, line: 'The clearest answer I have to "where did the team’s week go." Roughly 19 hours of design time per cycle, given back, with brand compliance held in code.' },
      comms:     { rank: 8, line: 'Brand voice and layout rules written down precisely enough that a machine can follow them, which is a communications problem before it is a technical one.' },
      nonprofit: { rank: 6, line: 'The kind of internal tool a lean team needs: it takes the repetitive production work off a person who should be doing the thinking.' },
      design:    { rank: 8, line: 'A brand system enforced at the moment of creation instead of caught in review, with a 411 item badge library resolved automatically.' },
    },
  },

  /* ----------------------------------------------------- email generator -- */
  {
    id: 'email-generator',
    title: 'Email campaign generator',
    href: 'work-email-generator.html',
    thumb: { src: 'thumb-email.jpg', alt: 'The email campaign generator: a built email beside its automated compliance audit.', w: 1000, h: 372 },
    tag: 'in production',
    lanes: {
      ai:        { rank: 2, line: 'Compliance lives in the code, not in a checklist afterward. The opt out is a server side constant and the UTM tagging is verified by deterministic code against the finished HTML rather than trusted to the model.' },
      marketing: { rank: 5, line: 'Campaign build time went from 75 minutes to a form, with UTM taxonomy enforced automatically so the reporting downstream stays clean.' },
      comms:     { rank: 9, line: 'Governance that holds without a human remembering to check. Worth knowing about if your comms team has ever shipped an email missing its unsubscribe link.' },
      nonprofit: { rank: 7, line: 'Email that is compliant by construction, which matters more when there is nobody whose whole job is to catch the mistake.' },
      design:    { rank: null, line: '' },
    },
  },

  /* ------------------------------------------------- analytics dashboard -- */
  {
    id: 'analytics',
    title: 'Analytics build and dashboard',
    href: 'work-analytics.html',
    thumb: { src: 'thumb-analytics.jpg', alt: 'The analytics dashboard: time-window controls above revenue, sessions and conversion figures.', w: 1000, h: 372 },
    tag: 'ga4 · tag manager · data api',
    lanes: {
      ai:        { rank: 4, line: 'Hand rolled against the Analytics Data API with service account authentication and two tier caching. Twelve report queries, zero recurring cost, no dashboard subscription.' },
      marketing: { rank: 1, line: 'GA4 and Tag Manager built from scratch across three properties, live on day one of a hard relaunch. Before building I found the tag container provisioned under the wrong account and stood up a correct one. Then twelve queries on a hand built dashboard at zero recurring cost.' },
      comms:     { rank: 10, line: 'The measurement layer under a communications team, so what got published can be answered with a number instead of a feeling.' },
      nonprofit: { rank: 8, line: 'Analytics a small organization can actually own: no per seat dashboard fee, no agency retainer, and reporting the team can pull themselves.' },
      design:    { rank: null, line: '' },
    },
  },

  /* ------------------------------------------------------------ website -- */
  {
    id: 'website',
    title: 'Website reimagining',
    href: 'work-website.html',
    thumb: { src: 'thumb-website.jpg', alt: 'The website redesign: photography and gradient treatment across a rebuilt page.', w: 1000, h: 372 },
    tag: 'production css v2.20',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: 8, line: 'A CEO directed redesign on a vendor built site, days before launch. I read the vendor contract first to protect a six figure investment and its warranty, then shipped a production CSS system across nine documented sections.' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 5, line: 'A versioned production CSS system, v2.20, that cut force override declarations from roughly 200 to a handful. Design systems are maintenance work as much as they are taste.' },
    },
  },

  /* -------------------------------------------------- cambiumpak brand ---- */
  {
    id: 'cambiumpak',
    title: 'CambiumPak brand system',
    href: 'work-cambiumpak.html',
    thumb: { src: 'cp-hero-products.webp', alt: 'CambiumPak packaging: a shipping carton, a moulded pulp tray and crinkle fill, in the brand’s forest palette.', w: 1600, h: 900 },
    tag: 'stand-in brand',
    lanes: {
      ai:        { rank: 8, line: 'The stand in brand my employer work is demonstrated on: 11 product families, 17 SKUs and 44 documents, all invented so the real work can be shown without exposing a client.' },
      marketing: { rank: 10, line: 'A full brand and product catalogue built as a demonstration surface, so employer work can be shown honestly with no client data attached.' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 4, line: 'A mark, a palette, five invented certification marks and a rulebook, in two days. Built to prove the system holds before anything is printed.' },
    },
  },

  /* --------------------------------------------------- choose democracy -- */
  {
    id: 'choose-democracy',
    title: 'Choose Democracy',
    href: 'work-choose-democracy.html',
    thumb: { src: 'cd-preview.jpg', alt: 'Three drawings for Choose Democracy: people embracing beneath a rising sun, a crowd holding placards, and a We the People 2.0 scroll.', w: 1000, h: 372 },
    tag: 'client · four years',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: 11, line: 'Four years of one house style across a book, four animated explainers and a website, which is brand consistency measured in years rather than in a slide.' },
      comms:     { rank: 3, line: 'Their most watched animated explainer, at 26,000 views, plus 400 or more illustrations now published in a book and running in progressive training slides. Proof that the explaining travels.' },
      nonprofit: { rank: 1, line: 'The mission work I would show first. Their most watched explainer at 26,000 views, more than 400 illustrations now published in "What Will You Do If Trump Wins?" and used in real progressive trainings, and a Waging Nonviolence feature that reached more than 750,000 readers.' },
      design:    { rank: 7, line: 'One drawn style held steady since 2021 across an interactive book, four animations and a website. Consistency is a design deliverable.' },
    },
  },

  /* ---------------------------------------------------- studio dashboard -- */
  {
    id: 'studio',
    title: 'A studio dashboard for my art business',
    href: 'work-studio.html',
    thumb: { src: 'thumb-studio.jpg', alt: 'The StudioKeeper dashboard: time-window controls above revenue, orders, average order and pieces sold.', w: 1000, h: 372 },
    tag: 'data & tooling',
    lanes: {
      ai:        { rank: 6, line: 'Five revenue channels modeled into three tables, with restock alerts and a tax envelope that compute themselves. The source of truth stayed a Google Sheet on purpose, because a tool you will not update is a tool that lies.' },
      marketing: { rank: 2, line: 'My own storefront, every channel attributed. Five revenue streams with different margins and payment schedules on one screen, sliceable by any time window, at zero monthly cost.' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: 9, line: 'Reporting built for a team of one, where every insight reads as a plain sentence with its caveat attached rather than as a number without context.' },
      design:    { rank: 11, line: 'Interface design where the hardest decision was editorial: every stat names its comparison window and its asterisk, so the page is trusted rather than impressive.' },
    },
  },

  /* ------------------------------------------------------------- chaney -- */
  {
    id: 'chaney',
    title: 'Chaney Family Dentistry',
    href: 'work-chaney.html',
    thumb: { src: 'cfd-preview.jpg', alt: 'The rooted oak mark for Chaney Family Dentistry beside a drawn portrait of the father-and-son dentists.', w: 1000, h: 372 },
    tag: 'brand · client',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 3, line: 'A father and son practice, rebranded around a mark drawn half above ground and half below. Seven colours, four drawn portraits, and print that had to work at the front desk.' },
    },
  },

  /* --------------------------------------------------------- drive 505 --- */
  {
    id: 'drive-505',
    title: 'Drive the 505',
    href: 'work-drive-505.html',
    thumb: { src: 'drive-the-505-preview.jpg', alt: 'Three screens from Drive the 505: the car knowledge module, the home screen, and the interactive Albuquerque map.', w: 1600, h: 595 },
    tag: 'shipped · try it',
    lanes: {
      ai:        { rank: 7, line: 'A working app I built and shipped: modules, flashcards, quizzes and an interactive map of the city grid. Open it and use it, no login.' },
      marketing: { rank: null, line: '' },
      comms:     { rank: 7, line: 'Teaching a nervous adult to drive is an explaining problem. This one is broken into modules, flashcards and a map you can poke at.' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 10, line: 'Interactive SVG, hand built, with a city grid you can explore. Product design for someone anxious, which changes every decision on the page.' },
    },
  },

  /* ---------------------------------------------------------- bookspot --- */
  {
    id: 'bookspot',
    title: 'Bookspot',
    href: 'work-bookspot.html',
    thumb: { src: 'bookspot-preview.jpg', alt: 'Three Bookspot screens: a map of London spots, a spot detail for Platform Nine and Three Quarters, and the Well Spotted stamp.', w: 1600, h: 595 },
    tag: 'research → prototype',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 12, line: 'Eight interviews, ten versions of one flow, more than 40 screens and a clickable prototype. The research is the reason the flow is short.' },
    },
  },

  /* ----------------------------------------------------------- passage --- */
  {
    id: 'passage',
    title: 'Passage',
    href: 'work-passage.html',
    thumb: { src: 'passage-preview.jpg', alt: 'Three Passage screens: the caregiver’s home with today’s three small tasks, a meditation player, and the journal.', w: 1600, h: 595 },
    tag: 'concept · team of four',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: 11, line: 'An app for someone caring for a person with a terminal illness. Every word in it had to be gentle and exact at the same time.' },
      nonprofit: { rank: 10, line: 'Care work made visible: tracking the person being cared for, and tracking the caregiver, who is usually the one nobody is watching.' },
      design:    { rank: 13, line: 'My concept, my UI, and every illustration in it. Designing for someone at the worst point of their year is a discipline of restraint.' },
    },
  },

  /* --------------------------------------------------------- aristotle --- */
  {
    id: 'aristotle',
    title: 'Aristotle’s Poetics, on one sheet',
    href: 'work-aristotle.html',
    thumb: { src: 'aristotle-preview.jpg', alt: 'The top of the Aristotle’s Poetics poster: the title, and the six parts of tragedy, plot, character, thought, diction, song and spectacle, each with a drawn icon.', w: 1600, h: 595 },
    tag: 'illustration · teaching',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: 12, line: 'Two thousand years of dramatic theory compressed onto one sheet for a graduate comics class, and it held up in the room.' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 14, line: 'Drawn in Illustrator and shipped as SVG, so you can zoom into any panel and nothing softens. Information design that stays sharp at any size.' },
    },
  },

  /* ------------------------------------------------------- sleep apnea --- */
  {
    id: 'sleep-apnea',
    title: 'How a sleep apnea machine works',
    href: 'work-sleep-apnea.html',
    thumb: { src: 'sa-preview.jpg', alt: 'A cutaway drawing on dark navy of a sleep apnea machine: the air filter, spinning impeller, humidifier tubes and green power cord.', w: 1000, h: 372 },
    tag: 'personal project',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: 5, line: 'I took my own machine apart and drew what was inside. Five drawings, a fixed seven part sequence, and a colour legend that holds across the whole set.' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 6, line: 'Accessibility of understanding, drawn. A cutaway you can tap through, in a fixed sequence, with one colour legend holding the set together.' },
    },
  },

  /* ================= PHASE B: new cards ==================================== */

  /* ------------------------------------------------ comics journalism ----- */
  {
    id: 'comics-journalism',
    title: 'Comics journalism',
    href: 'work-comics-journalism.html',
    thumb: { src: 'nib-prop8-card.jpg', alt: 'A panel from the Prop 8 comic in The Nib, drawn in blues: a crowd at a protest with raised fists holding hand lettered signs reading Love Not H8, Yes We Can Win Civil Rights, No H8, and Gay Rights Are Human Rights.', w: 1600, h: 594 },
    tag: 'published · edited',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: 1, line: 'Reported comics published in The Lily at The Washington Post, The Nib, and The Comics Journal, where five pieces carry my byline. The Lily named me one of its favourites of the year twice, in 2018 and 2019. I have been edited, published and reviewed, on the record.' },
      nonprofit: { rank: 4, line: 'Journalism drawn rather than written, published by outlets that fact check. The Advocate put my book on its best of 2017 list and ComicsVerse reviewed it at 99 percent.' },
      design:    { rank: null, line: '' },
    },
  },

  /* ------------------------------------------------------- pts rebrand ---- */
  {
    id: 'rebrand',
    title: 'A rebrand in March, the biggest growth month in April',
    href: 'work-rebrand.html',
    thumb: { src: 'rebrand-before-after.jpg', alt: 'The Painting the Southwest account before and after the rebrand: a scattered bulletin board of posts on the left, a consistent templated grid on the right.', w: 1600, h: 900 },
    tag: 'brand · outcome',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: 3, line: 'A rebrand in March, and the strongest growth month the business has had in April. The account had been working as a bulletin board. I rebuilt it as a system and then gave it a campaign to carry.' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 1, line: 'A visual identity, a positioning line, a templated content system and a matching website, shipped in March. The strongest growth month the business has had followed in April.' },
    },
  },

  /* ------------------------------------------------------------ audubon -- */
  {
    id: 'audubon',
    title: 'Boards for a national conference',
    href: 'work-graphic-facilitation.html#audubon',
    /* Real artwork, 14 Aug 2026: five boards landed in the project files. The
       card carries the Opening Plenary, cropped to keep the conference title
       and the two live portraits. All five are on the facilitation page. */
    thumb: { src: 'aud-plenary-card.jpg', alt: 'The Opening Plenary board for the National Audubon Society 2023 Leadership Conference, hand drawn in blues and blacks: the conference title, live portraits of board chair Susan Bell and chief conservation officer Marshall Johnson, a flying magpie, and the line "You are what hope looks like to a bird."', w: 1600, h: 594 },
    tag: 'graphic recording · client',
    credit: 'Graphic recording for the National Audubon Society, 2023 Leadership Conference.',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: 9, line: 'Live visual capture across a national leadership conference, held inside the client’s brand palette while being drawn in real time in front of the room.' },
      comms:     { rank: 4, line: 'A full conference recorded live, including the opening plenary with the chief executive, the board chair and the chief conservation officer. Listening, synthesising and drawing at the same speed the room is talking.' },
      nonprofit: { rank: 2, line: 'Live boards across the National Audubon Society’s 2023 Leadership Conference, including the opening plenary and a session on their five year strategic plan. Indigenous led content from the Seal River Watershed Alliance carried with the care it needed.' },
      design:    { rank: 9, line: 'Seven panellists drawn live with portrait likenesses, names, titles and attributed quotes, every board inside Audubon’s own palette. Brand compliance at speed, with no undo.' },
    },
  },

  /* -------------------------------------------------------- salesforce ---- */
  {
    id: 'salesforce',
    title: 'Futures Lab, drawn live and then animated',
    href: 'work-graphic-facilitation.html#salesforce',
    /* Real artwork, 14 Aug 2026: pulled from her Drive after she shared the
       folder. The finished board at full opacity, hand lettered in Salesforce
       blues. An 18 second excerpt of the animation plays on the detail page. */
    thumb: { src: 'sf-futures-lab.jpg', alt: 'A hand lettered board drawn entirely in Salesforce blues: "The purpose of Futures LAB is to inspire new ways of thinking about the future," beside a hot air balloon carrying a capital F and two figures, with a thought cloud, a gear cloud and speech bubbles.', w: 1600, h: 594 },
    tag: 'contract · 2021',
    credit: 'Contracted graphic facilitator, drawing live during the session and producing the animated file afterward.',
    lanes: {
      ai:        { rank: 5, line: 'A session on the future of food, drawn live and then rebuilt as a two minute thirty six second hand lettered animation, entirely inside Salesforce’s brand blues.' },
      marketing: { rank: 12, line: 'Live capture in the room, then a finished animated asset the client could publish afterward. One engagement, two deliverables.' },
      comms:     { rank: null, line: '' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 15, line: 'Hand lettered animation held to a corporate palette from the first frame to the last. Three clients, three palettes, one hand.' },
    },
  },

  /* ------------------------------------------------------ oliver wyman ---- */
  {
    id: 'oliver-wyman',
    title: 'Graphic facilitation at 8works',
    href: 'work-graphic-facilitation.html#oliver-wyman',
    thumb: { src: 'gf-sif-card.jpg', alt: 'The Sustainable Innovation Forum 2020 Day 1 scribe, drawn in green, cyan and black: a live portrait of Ban Ki-moon captioned eighth Secretary-General of the UN and Deputy Chair of the Elders, surrounded by hand lettered quotes about climate action after the pandemic.', w: 1600, h: 594 },
    tag: 'paid · corporate',
    credit: 'Graphic Facilitator, 8works (an Oliver Wyman company). The finished boards carry my name in the credit bar.',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: 6, line: 'I drew Ban Ki-moon and Kevin Rudd live at the Sustainable Innovation Forum, and a Kaiser Permanente chief executive conversation at the Health Innovation Summit. Six finished scribes, delivered entirely over video in 2020, published with my name in the credit bar.' },
      comms:     { rank: 13, line: 'A former United Nations Secretary-General and a former Prime Minister of Australia, drawn while they spoke, with their arguments intact and their quotes attributed. If I can keep up with them, I can keep up with your subject matter expert.' },
      nonprofit: { rank: null, line: '' },
      design:    { rank: 16, line: 'Six scribes for one forum, each with its own palette and its own composition, all recognisably one hand. Drawn in Procreate over Zoom, then cleaned and coloured for publication.' },
    },
  },

  /* ----------------------------------------------------- civic scribing --- */
  {
    id: 'civic-scribing',
    title: 'Independent civic scribing',
    href: 'work-graphic-facilitation.html#civic',
    thumb: { src: 'gf-warren-card.jpg', alt: 'The Elizabeth Warren town hall scribe, drawn in magenta and black: a live portrait of Warren at the microphone beside her line We need big structural change and I have got a plan for that, the words Oakland CA Town Hall May 31 2019, and drawn portraits of people in the crowd holding Dream Big Fight Hard signs.', w: 1600, h: 594 },
    tag: 'self directed · unpaid',
    credit: 'Self directed and unpaid. Listed here as independent civic work, never as client work.',
    lanes: {
      ai:        { rank: null, line: '' },
      marketing: { rank: null, line: '' },
      comms:     { rank: 6, line: 'I arrived four hours early to an Elizabeth Warren town hall in Oakland to get near the front, drew it live, and her campaign retweeted it. Netroots Nation in 2015 and 2016. Marches in St Louis and Phoenix. Nobody commissioned any of it.' },
      nonprofit: { rank: 5, line: 'Years of showing up unpaid to draw the rooms where organising happens. Four hours early to a Warren town hall for a spot near the front, and the campaign retweeted the drawing. Two Netroots Nations, the marches in St Louis and Phoenix, volunteer scribing for SURJ Sacred Heart.' },
      design:    { rank: null, line: '' },
    },
  },
];

/* --------------------------------------------------------------------------
   THE LANES
   Heroes: /ai, /comms, /nonprofit and /design are Elizabeth's own wording,
   verbatim. /marketing is agent drafted and flagged for her last look.
   -------------------------------------------------------------------------- */
const LANE_META = {

  ai: {
    slug: 'ai',
    navLabel: 'ai and automation',
    pill: 'ai',
    title: 'AI that gives teams their hours back',
    hero: 'I build AI that makes business more efficient.',
    heroSource: 'hers',
    sub: 'Two generators running in production, a hand built analytics dashboard, and an AI literacy site that rebuilds itself from one data file. Everything here shipped, and the hours it saved were measured, not guessed.',
    metaDesc: 'Elizabeth Beier builds AI tooling that saves measured hours: two generators in production, a hand built analytics dashboard, and an AI literacy site generated from one data file.',
    proofStyle: 'numbers',
    proof: [
      { n: '19 hrs', l: 'design time given back per product cycle' },
      { n: '75 min', l: 'per campaign, replaced by a form' },
      { n: '133', l: 'explainer cards generated from one data file' },
      { n: '$0', l: 'recurring cost across the tooling', pulse: true },
    ],
    leadHead: 'Featured AI work',
    leadNote: 'Three builds that are running now, not prototypes.',
    moreHead: 'More work',
    moreNote: 'The rest of the deck, ordered for someone hiring an AI builder.',
    close: [
      'My story is adoption and enablement rather than model development. I find the 42 minute task nobody has questioned, and I replace it with something that holds the rules in code.',
      'If you want the architecture behind any of this, ask me and I will walk you through it.',
    ],
  },

  marketing: {
    slug: 'marketing',
    navLabel: 'marketing and analytics',
    pill: 'marketing',
    title: 'Marketing you can measure',
    hero: 'Marketing you can measure.',
    heroSource: 'agent-drafted, awaiting her last look',
    sub: 'I built GA4 and Tag Manager from scratch across three properties, run a live dashboard against the Analytics API at zero recurring cost, and grew my own storefront past $30K a year with every channel tracked.',
    metaDesc: 'Elizabeth Beier builds the measurement under marketing: GA4 and Tag Manager across three properties, a live dashboard on the Analytics API at zero recurring cost, and a storefront grown past $30K a year.',
    proofStyle: 'numbers',
    proof: [
      { n: '3', l: 'properties instrumented from scratch, live on day one' },
      { n: '12', l: 'report queries on a hand built dashboard' },
      { n: '$30K+', l: 'own storefront revenue, 2025' },
      { n: '$0', l: 'recurring reporting cost', pulse: true },
    ],
    leadHead: 'Featured marketing work',
    leadNote: 'Measurement built first, then the growth it can prove.',
    moreHead: 'More work',
    moreNote: 'The rest of the deck, ordered for someone hiring a marketing technologist.',
    close: [
      'I build the measurement layer before the campaign, because a number you cannot trace is not a result. I have done it for an employer under a hard relaunch deadline and for my own business, where the revenue is mine to be honest about.',
      'Happy to walk through the tracking plan behind any of this.',
    ],
  },

  comms: {
    slug: 'comms',
    navLabel: 'communications',
    pill: 'comms',
    title: 'I make complex ideas easy to understand',
    hero: 'I make complex ideas easy to understand.',
    heroSource: 'hers',
    sub: 'Published comics journalism in The Lily, The Nib, and The Comics Journal. A book The Advocate put on its best of the year list. An AI literacy project that turns research into cards people share.',
    metaDesc: 'Elizabeth Beier makes complex ideas easy to understand: published comics journalism in The Lily, The Nib and The Comics Journal, a best of the year book, and an AI literacy project.',
    proofStyle: 'press',
    press: [
      { q: 'Intimate and Honest', s: 'ComicsVerse, 99 percent', href: 'https://comicsverse.com/big-book-bisexual-trials-errors-review/' },
      { q: 'The stories by Beier are funny, sad, beautiful, and intriguing.', s: 'Graphic Policy, 10 out of 10 on story, art and overall', href: 'https://graphicpolicy.com/2017/11/18/review-big-book-bisexual-trials-errors/' },
      { q: 'Like Toulouse Lautrec at the Moulin Rouge, Beier became both documentarian and participant.', s: 'Mission Local, on the Lexington Club project', href: 'http://web.archive.org/web/20200919195105/https://blog.sfgate.com/inthemission/2015/05/22/mission-cartoonist-draws-the-lexington-clubs-last-days/' },
      { q: 'Beier is a cartoonist to keep an eye on.', s: 'Bleeding Cool', href: 'https://bleedingcool.com/comics/bisexual-books-elizabeth-beier-trials/' },
      { q: 'Elizabeth Beier (who live-drew many panels, much to everyone’s delight).', s: 'The Comics Journal, Queers and Comics conference report', href: 'https://www.tcj.com/queers-and-comics-the-lgbtq-cartoonists-and-comics-conference/' },
    ],
    stage: [
      { l: 'Moth StorySLAM winner, then the Moth GrandSLAM at the Castro Theatre in front of 1,200 people', href: 'https://www.youtube.com/watch?v=a5SD30M0EG8' },
      { l: 'A RADAR reading at the San Francisco Public Library, on the library’s own channel', href: 'https://www.youtube.com/watch?v=YB_R4g_f-q4' },
      { l: '23 published items on Muck Rack', href: 'https://muckrack.com/elizabeth-beier' },
    ],
    leadHead: 'Featured communications work',
    leadNote: 'Reported, published, and read by people who did not have to.',
    moreHead: 'More work',
    moreNote: 'The rest of the deck, ordered for someone hiring a communicator.',
    close: [
      'I have been edited, published, reviewed and put on a stage, and I have spent a decade turning research and reporting into something a person will finish reading. The medium changes. The job does not.',
      'If you have something complicated that has to land with people who are not paid to care, that is the work I want.',
    ],
  },

  nonprofit: {
    slug: 'nonprofit',
    navLabel: 'mission and nonprofit',
    pill: 'nonprofit',
    title: 'I make the mission clear, beautiful, and actionable',
    hero: 'I make the mission clear, beautiful, and actionable.',
    heroSource: 'hers',
    sub: 'Choose Democracy’s most watched explainer. Four hundred illustrations now in a published book and progressive training slides. Live boards for Audubon’s national leadership conference. When the issue matters, clarity is the whole job.',
    metaDesc: 'Elizabeth Beier makes the mission clear, beautiful and actionable: Choose Democracy’s most watched explainer, 400 illustrations in a published book, and live boards for a national Audubon conference.',
    proofStyle: 'numbers',
    proof: [
      { n: '26,000', l: 'views on Choose Democracy’s most watched explainer' },
      { n: '750,000+', l: 'readers reached by the Waging Nonviolence feature' },
      { n: '400+', l: 'illustrations across a book, an interactive and training slides' },
      { n: '123,190', l: 'signatures on a campaign that won', pulse: true },
    ],
    /* The 123,190 is the largest audience on this page, and until now the page
       asserted it without naming the campaign. A number that size has to carry
       its receipt. Wording follows the record: she started the petition and
       fronted it to the press, and the signature total is a merge of several
       petitions, which is said here rather than glossed. */
    proofNote: {
      text: 'The 123,190 is the Savannah Dietrich petition, July 2012. She was seventeen, she named the two boys who had assaulted her in violation of a court gag order, and their attorneys moved to have her held in contempt. I started the petition asking for that charge to be dropped, and spoke for the campaign to national press. The motion was withdrawn on 23 July 2012. Change.org marks the petition a victory, which it does for very few. Several petitions ran at once and their signatures were combined.',
      srcs: [
        { l: 'the petition, marked a victory', href: 'https://www.change.org/petitions/judge-deana-dee-mcdonald-louisville-ky-drop-charges-against-savannah-dietrich' },
        { l: 'CBS News, 24 July 2012', href: 'https://www.cbsnews.com/news/kentucky-teen-savannah-dietrich-spared-contempt-charge-after-naming-attackers-on-twitter/' },
      ],
    },
    pressHead: 'Also on the record',
    press: [
      { q: 'Thank you for making something we can hold onto.', s: 'A Lexington Club patron, quoted in Mission Local', href: 'http://web.archive.org/web/20200919195105/https://blog.sfgate.com/inthemission/2015/05/22/mission-cartoonist-draws-the-lexington-clubs-last-days/' },
      { q: 'To illustrate and take notes at the same time just blows my mind.', s: 'A bystander at an event, on the public record', href: '' },
      { q: 'Everyone wants this girl to have peace and time to recover and not another trauma like jail time.', s: 'Quoted in CBS News as spokesperson for the Savannah Dietrich campaign, 2012', href: '' },
    ],
    leadHead: 'Featured nonprofit work',
    leadNote: 'Clear, beautiful, actionable, in that order, with the receipts for each.',
    moreHead: 'More work',
    moreNote: 'The rest of the deck, ordered for someone hiring for a mission.',
    close: [
      'I have spent four years on one pro democracy account, drawn a national conservation conference live, and shown up unpaid for years to draw the rooms where organising happens. I know the difference between work that looks good and work that gets used.',
      'Tell me what has to be understood, and by whom, and I will show you how I would make it land.',
    ],
  },

  design: {
    slug: 'design',
    navLabel: 'design and brand',
    pill: 'design',
    title: 'Brand systems that are beautiful and accessible, with a bit of whimsy',
    hero: 'Brand systems that are beautiful and accessible, with a bit of whimsy.',
    heroSource: 'hers',
    sub: 'A rebrand followed by the strongest growth month the business ever had. A 133 card visual system with a working sense of humor. Contrast checked, keyboard friendly, and this February the work hung in the Albuquerque airport.',
    /* The contrast and keyboard sentence above ships only because the audit
       passes. See lanes/AUDIT.md for the measured ratios. If the palette
       changes, re-run the audit before this line goes back out. */
    metaDesc: 'Elizabeth Beier builds brand systems that are beautiful and accessible: a rebrand followed by a record growth month, a 133 card visual system, and work shown at the Albuquerque airport.',
    proofStyle: 'clients',
    clients: [
      '8works, an Oliver Wyman company',
      'Salesforce',
      'National Audubon Society',
      'New Mexico True Certified',
      'Albuquerque airport, February 2026',
    ],
    leadHead: 'Featured design work',
    leadNote: 'Systems rather than one offs, and each one held up under use.',
    moreHead: 'More work',
    moreNote: 'The rest of the deck, ordered for a design reviewer.',
    close: [
      'A design portfolio that claims accessibility should be auditable, so this one is. Every text and background pair on this page is contrast checked, every image carries alt text, and you can reach every card and every menu item with a keyboard alone.',
      'Inspect it. Then let us talk about what you need built.',
    ],
  },
};

if (typeof module !== 'undefined') module.exports = { LANES, LANE_META, CARDS, DRAWN };
