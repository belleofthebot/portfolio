# Ship checklist — elizabethbportfolio.com

This folder is your portfolio site, assembled and ready to push, with two fixes already made for you. Add the five files listed under "Still needed," then follow the deploy steps.

## What I fixed

**Filenames now match your links.** Your pages link to hyphenated names (`work-website.html`, `rebrand-before-after.jpg`, `bookspot-preview.jpg`), but the files came through without hyphens (`workwebsite.html`, etc.). Left as-is, every work card and those two images would have 404'd on the live site. I renamed all nine work pages and both images to the exact names your HTML references, so the links resolve.

**Assets are in place.** The `assets/` folder from your Bookspot pack is wired in — the case pages reference `assets/screens26/`, `assets/fig/user-flow.jpg`, and `assets/sketches/`, and they're all here.

## Still needed (drop these in, then deploy)

These are referenced by your pages but weren't in what you sent — they live on your machine:

1. `fonts/space-grotesk-latin-400-normal.woff2`
2. `fonts/space-grotesk-latin-500-normal.woff2`
3. `fonts/ibm-plex-mono-latin-400-normal.woff2`
   _(styles.css loads these three; without them the type falls back to a system font.)_
4. `Elizabeth-Beier-resume.pdf` _(the "Download PDF" button on your résumé page)_
5. `drive-the-505-preview.jpg` _(the preview image on the Drive the 505 case page)_

Optional, for the live in-page demos on the Bookspot and Desert Palette case pages:

6. `proto/bookspot-app.html`
7. `proto/desert-palette-dashboard.html`
   _(If you skip these, the case pages still work; only the embedded demo iframe is blank.)_

## Final folder tree (what the repo should contain)

```
index.html   resume.html   styles.css
work-analytics.html  work-deck-generator.html  work-email-generator.html
work-website.html  work-bookspot.html  work-drive-505.html
work-rebrand.html  work-ipl.html  work-studio.html
rebrand-before-after.jpg   bookspot-preview.jpg   drive-the-505-preview.jpg
drive-the-505.zip
Elizabeth-Beier-resume.pdf
fonts/   (3 woff2 files above)
assets/  (already populated)
proto/   (2 html files above, optional)
```

## Deploy: portfolio site → GitHub → Vercel

There is no build step. It's plain HTML and CSS, so this is quick.

**GitHub**
1. On github.com under your `belleofthebot` account, create a new repository — call it `portfolio` (or `elizabethbportfolio`). Keep it public.
2. Use the "uploading an existing file" link and drag this entire folder's contents in (or, if you use the desktop app / git: `git init`, `git add .`, `git commit -m "portfolio site"`, `git remote add origin …`, `git push`).

**Vercel**
3. On vercel.com choose Add New → Project and import that repo.
4. Framework Preset: **Other**. Build Command: leave empty. Output Directory: leave as the root. Deploy.
5. In the project's Settings → Domains, add `elizabethbportfolio.com` and follow Vercel's DNS instructions with your registrar.
6. Your site is live. Paste the Vercel URL nowhere — the custom domain is the address you'll share.

## Deploy: the two apps

- **Drive the 505** — its own repo. Drop the contents of `drive-the-505.zip` (index.html + the two icons) into a repo called `drive-the-505`, import to Vercel, framework **Other**, deploy. Its own README says the same. Then set `drive-the-505-preview.jpg` and confirm the live URL on your case page.
- **Bookspot** — in this site it runs as the embedded demo at `proto/bookspot-app.html`. For a standalone Bookspot address, copy that single file into its own repo as `index.html`, import to Vercel, deploy. (Send me that proto file and I'll confirm it's self-contained and give it a proper README.)

## After it's live

Send me the three URLs (portfolio, Drive the 505, Bookspot) and I'll wire them into the WorkWave and OpenSesame application packages and update your résumé's links.
