# belleofthebot — Elizabeth Beier's portfolio

Marketing technology, analytics and marketing operations. Hand-built, static, no
build step, no framework, no recurring cost.

**Live:** https://elizabethbportfolio.com

---

## What's here

A static site. Every page is hand-written HTML against one stylesheet
(`styles.css`, the *terminal rose, plum night* brand system) with two self-hosted
web fonts. There is no bundler, no generator and no dependency to install — open
`index.html` from the filesystem and it works.

### The case studies

| Page | Work |
|---|---|
| `work-analytics.html` | Analytics infrastructure and an executive dashboard, built from zero before a relaunch |
| `work-deck-generator.html` | A product deck generator — a manual build collapsed into a four-field form |
| `work-email-generator.html` | An email campaign generator with compliance enforced in code |
| `work-website.html` | A website reimagining inside an existing agency contract |
| `work-bookspot.html` | Bookspot — UX/UI for visiting real places from fiction |
| `work-drive-505.html` | Drive the 505 — a shipped PWA for nervous drivers |
| `work-studio.html` | StudioKeeper — a studio dashboard across five revenue channels |
| `work-rebrand.html` | A rebrand in March; the strongest growth month came in April |
| `work-ipl.html` | Content operations for a mission-driven nonprofit |
| `work-passage.html` | Passage — care-companion app concept |

### Process write-ups

Four of the case studies were built for an employer under NDA, so their data,
screens and code cannot be published. Each one instead gets a **process page**
that rebuilds the work step by step on an invented company, **CambiumPak**, with
fabricated figures throughout:

- `process-analytics.html` — nine steps from the first stakeholder conversation
  to the report that changed a decision, with every tool screen rebuilt in HTML.

### Demonstrators

- `demo/cambiumpak-dashboard.html` — a working executive dashboard on invented data
- `demo/cambiumpak-model.html` — the measurement model underneath it

### Runnable prototypes

- `proto/bookspot-app.html`
- `proto/studiokeeper.html`
- `drive-the-505/` — a self-contained PWA

---

## CambiumPak is invented

CambiumPak is a fictional maker of recycled and compostable B2B packaging
supplies. It exists so that work done under NDA can be demonstrated without
publishing anyone's data. Every product, figure, document, certification mark and
test result attributed to it is fabricated, and no certification mark named
anywhere in this repository belongs to a real standards body.

Each page that uses it says so, above the fold.

---

## Running it

Clone and open `index.html`. That is the whole procedure.

Deployed from `main` by Vercel — push to `main` and the site rebuilds. There is no
build step to run and no framework to install. `vercel.json` sets a cache header
and nothing else.

---

## Contact

elizabethbportfolio@gmail.com · Albuquerque, New Mexico
