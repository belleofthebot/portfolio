# Accessibility audit · lane pages build, 13 August 2026

The /design hero claims the work is accessible, so the page making that claim has
to pass. This file is the measurement behind the line "Contrast checked, keyboard
friendly" in the /design subtext. **If the palette changes, re-run this audit
before that line ships again.**

Method: every text node on ten rendered pages was sampled in a real browser
(Chromium via Playwright), its computed colour compared against its computed
effective background, and scored against WCAG 2.1 AA (4.5:1 normal text,
3:1 for text at 24px or at 18.66px and bold). Script: the audit harness described
at the bottom of this file.

## Result

| Check | Result |
|---|---|
| Text and background pairs sampled across 10 pages | **285** |
| Failures at WCAG AA | **0** |
| Images with no `alt` attribute | **0** |
| Focusable elements with no visible focus indicator | **0** |
| Horizontal overflow at 430px viewport | **0px** |

Pages covered: `ai`, `marketing`, `comms`, `nonprofit`, `design`,
`work-comics-journalism`, `work-graphic-facilitation`, `index`, `work-studio`,
`resume`.

## The dark palette, measured

Contrast against the ground `#17121C`. This is the palette the lane pages use.

| Token | Value | On ground | On panel `#241D2B` | On tile `#1D1724` |
|---|---|---|---|---|
| `--text` | `#F4F2EE` | 16.48 | 14.61 | 15.65 |
| `--text-2` | `#BBB2C0` | 8.99 | 7.97 | 8.53 |
| `--text-3` | `#8B8494` | 5.11 | 4.53 | 4.85 |
| `--rose` | `#DFA192` | **8.47** | 7.51 | 8.04 |
| `--mint` | `#9FE0CE` | **12.31** | 10.91 | 11.69 |

The two the brief singled out both clear AA comfortably: rose at 8.47:1 and mint
at 12.31:1 on the ground. No assumption involved, these are measured.

## Two things the audit found and fixed

The site did **not** pass before this build. Both fixes are in `styles.css`.

**1. The ivory well palette.** The reversal theme used for long reading had four
pairs below 4.5:1. Three tokens were darkened, the smallest change that clears AA
on all four well surfaces.

| Token | Was | Ratio on well ground | Now | Ratio on well ground |
|---|---|---|---|---|
| `--text-3` | `#7A756C` | 4.07 fail | `#6D685F` | **4.92** |
| `--rose` | `#AE5A47` | 4.29 fail | `#A04C39` | **5.21** |
| `--mint` | `#2E9B7F` | 3.06 fail | `#207560` | **4.95** |

This is a visible change to existing case study pages. It is small, the rose in
an ivory well now reads slightly deeper, and it was required by the hero claim.

**2. The full screen button.** `.fsbtn` set no `color`, so its label fell back to
the browser default black on a dark plate: **1.29:1**, effectively invisible. It
appears on every "try it" page. Now `var(--text-2)` at **7.97:1**, with the rose
reserved for hover.

## Keyboard

The work menu is a native `<details>` element, so it opens on Enter or Space and
is reachable by keyboard with no script at all. Script adds only two conveniences:
Escape closes it and returns focus to the trigger, and a click outside closes it.

Verified tab order on `/design`: skip link, wordmark, work menu, résumé, stack,
about, contact, then the lane pills, then the cards. Enter opens the menu, Escape
closes it, focus returns to the trigger.

A global `:focus-visible` rule gives every link, button and summary a 3px mint
outline at 3px offset. Mint clears 12.3:1 on the ground and 4.95:1 in the ivory
well, both well past the 3:1 minimum for a non-text indicator. The rule is written
with `:where()` so it carries zero specificity and never fights a component's own
focus style.

## Motion

`styles.css` already honours `prefers-reduced-motion: reduce` by disabling
scroll-behavior and all transitions. The lane pages add no animation beyond
transitions, so they inherit that for free. The homepage hero SVG keeps its
existing static fallback.

## Re-running it

The harness samples computed styles in a live browser rather than parsing CSS,
which is the only way to catch inherited and cascaded colours like the `.fsbtn`
bug. Point it at the page list above and it reports every failing pair with its
selector and the text it found.
