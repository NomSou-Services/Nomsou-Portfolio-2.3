# Handoff — NomSou Services studio site

## Goal

Build the NomSou Services LLC portfolio site, using nathancurrin.com as a
structural reference: a full-bleed hero, a featured-work grid, a services
block, a pull quote, a studio/about section, a contact form, and a large
multi-column footer. Agreed at the start of the session:

- Scope: homepage **plus** all four case study pages
- Featured work: the four spec case studies (Cornerstone Realty, Ridgeline
  Property Co., Fieldnote Provisions, Tallgrass Landscape Co.)
- Visual direction: reference structure only, executed in a sharper modern
  style — NomSou palette, Archivo + IBM Plex Mono, tight type, scroll motion
- Supabase: written now, not stubbed (contact form + per-project view counters)

## Current state

**Live at https://nomsouservices.com** — pushed to GitHub, deployed on Vercel,
custom domain attached. Six HTML pages, one stylesheet, three JavaScript
files, fourteen SVG assets, self-hosted fonts, a Supabase schema, and Netlify
config. The site runs with no build step and no dependencies.

One thing is not finished: `js/config.js` on `main` still holds
`YOUR-PROJECT-REF`, so the Supabase contact form is not wired up on the live
site — it tells visitors it cannot send.

Verification run against a local server:

- **HTML** — validates clean (html-validate), zero inline styles
- **Accessibility** — axe-core, WCAG 2.1 A/AA, desktop and mobile, four pages:
  **0 violations**
- **Functional** — 15 browser tests pass: form validation, focus management,
  honeypot, scroll reveal, deep-link behaviour, reduced motion, mobile menu
  open/Escape/inertness, hidden view counter, internal link resolution
- **Supabase** — 8 tests against a mocked endpoint: request headers, payload
  column names matching the schema, success path, server-error path, RPC slug,
  counter rendering
- **SQL** — `schema.sql` parses as valid PostgreSQL (14 statements, pglast)
- **Layout** — no horizontal overflow at 360 / 390 / 768 / 1024 / 1440px

Still placeholders, by design: the SVG project artwork stands in for real
screenshots, and `js/config.js` holds `YOUR-PROJECT-REF` until you paste keys.

## Active files

| File | What it is |
| --- | --- |
| `index.html` | Homepage — hero, work grid, services, process, quote, studio, contact, footer |
| `work/*.html` | Four case studies, one shared structure |
| `css/style.css` | Whole design system. Section 1 is the token block |
| `css/fonts.css` | @font-face for Archivo + IBM Plex Mono |
| `js/config.js` | **Edit this** — Supabase URL and anon key |
| `js/supabase-client.js` | `submitInquiry()` and `recordProjectView()` over plain fetch |
| `js/main.js` | Menu, sticky header, scroll reveal, form, view counter |
| `supabase/schema.sql` | Tables, RLS policies, the counting function |
| `netlify.toml` | Publish settings, security headers, pretty URLs |

## Changes made

1. **Design system first** — tokens for the NomSou brand board, a clamp()-based
   type scale, and layout primitives, all in one commented stylesheet.
2. **Derived darker "ink" tones for text on light.** An accent picked for a
   fill is rarely dark enough to read as body text on a light ground, so every
   accent-as-text use on light points at a derived tone instead. See the
   palette note below for the current values.
3. **Self-hosted the fonts** instead of linking Google Fonts — removes a
   third-party request, speeds up first paint, and keeps visitor data local.
4. **Generated all artwork as SVG** so the site has no photo dependencies and
   the placeholders are on-palette and editable.
5. **Wrote the Supabase layer with plain `fetch`**, no client library and no
   build step. `schema.sql` turns on row level security so the public key can
   insert an inquiry and read view counts and nothing else — your inquiries are
   not readable from the browser.
6. **Fixed three real bugs found in testing:**
   - Scroll reveal used IntersectionObserver, which only fires on elements that
     *cross* the viewport edge. Jumping down the page (an anchor link, a
     restored scroll position, a fast flick on a phone) skipped elements, and
     they stayed invisible permanently. Replaced with a rAF-throttled position
     sweep that cannot miss anything, and which unbinds itself when done.
   - `.view-count { display: inline-flex }` overrode the browser's rule for the
     `hidden` attribute, so the counter showed "0 views" when Supabase was
     unconfigured. Added a `[hidden] { display: none !important }` rule.
   - The closed mobile menu used only `opacity: 0`, leaving its links in the
     keyboard tab order and exposed to screen readers. Added `visibility:
     hidden`.
7. **Removed all 72 inline `style` attributes** in favour of named utility
   classes, so the markup stays readable and the HTML validates.

## Failed attempts

- **First mobile figure artwork was unreadable** — phone bodies drawn in
  `--navy-deep` on a `--navy` ground disappeared at page scale. Inverted the
  relationship and added an accent outline.
- **Translucent accent fills over navy went muddy olive.** Replaced the
  `opacity`-based fills with solid tint panels plus a small accent bar.
- **Work grid left an orphan card.** One full-width card followed by three
  half-width ones left an empty column. Changed to full / half / half / full.
- **Cover SVGs had the project name baked in**, which got cropped to nonsense
  ("RTY CO.") inside the half-width cards. Removed the text — the card title
  sits directly beneath the image anyway.
- **First axe run reported 264 contrast violations.** False alarm: the audit
  ran mid-transition while the reveal elements were partly transparent.
  Re-ran with reduced motion; the real count is zero.
- **Regenerating the case pages silently reverted them to Google Fonts** — the
  font swap had been applied to the output files, not to the generator. Fixed
  at the source and re-verified.

## Deployment (added this session)

Target is **Vercel**, via GitHub so every push redeploys.

- `vercel.json` added — security headers, cache headers, `cleanUrls: true`
- `.gitignore` added
- Git repo initialised with two commits; the zip contains the `.git` folder,
  so pushing is `git remote add origin ... && git push -u origin main`
- Canonical tags and `sitemap.xml` now name the clean URLs Vercel serves
  (`/work/cornerstone-realty`, no `.html`). Internal links keep the `.html`
  so the folder still opens straight off the desktop; Vercel redirects them.
- `netlify.toml` kept, so Netlify remains an option
- **Done:** repo pushed to `souher88/Nomsou-Portfolio-2.3`, Vercel project
  created and linked, and `nomsouservices.com` registered through Vercel and
  attached as the canonical apex URL (no `www` redirect). Every push to
  `main` redeploys. `nomsou-services.vercel.app` and
  `nomsou-portfolio-2-3.vercel.app` stay aliased as fallbacks.

Considered and rejected: uploading the file tree directly through the Vercel
connection. It would have meant either dropping the self-hosted fonts or a
build step, and the second contradicts the no-build-step requirement.

## Next steps

1. Paste real Supabase keys into `js/config.js` and run `supabase/schema.sql`
   (README has the click path). Until then the live contact form tells
   visitors it cannot send — the one item on this list that visitors can see.
2. Add a Supabase webhook so new inquiries reach `nomsouservices@gmail.com`
   instead of only the dashboard.
3. Replace `assets/*.svg` with real screenshots or Figma exports at the same
   dimensions — covers 1400×600, figures 1200×700.
4. Run Lighthouse on the deployed URL — this build has not been measured on
   real hosting, only checked locally.
5. Decide whether `hello@nomsouservices.com` stays alive as a forwarding
   alias. Old business cards, PDFs, and cached search results still point at
   it, so keeping the forward is the safe default.
6. Update the contact address anywhere outside this repo that still carries
   the old one — LinkedIn, the Instagram bio, Google Business Profile, and
   proposal, invoice and email-signature templates.
7. Consider whether RAD and NEST deserve cards on the homepage alongside the
   spec work; the grid takes six cards without a layout change.

## Done since the build session

- Repo created and pushed, Vercel project linked, `nomsouservices.com`
  registered through Vercel and live. Canonical tags, `sitemap.xml` and
  `robots.txt` already named this domain, so no markup change was needed.
- Contact address swapped from `hello@nomsouservices.com` to
  `nomsouservices@gmail.com` (2026-09-11): seven occurrences across
  `index.html`, the four case study pages, and `js/main.js`. Both the
  `mailto:` href and the visible text were changed in every HTML occurrence,
  so no link points at the old address.

## Palette change (2026-09-11)

Recoloured from the Coolors board (charcoal olive / lime gold / slate) to a
five-colour brand palette, applied on a 60 / 30 / 10 split:

| Token | Value | Name | Share |
| --- | --- | --- | --- |
| `--paper` | `#faf7f2` | Warm white | 60% — the page ground |
| `--navy` | `#18202f` | Midnight navy | 30% — hero, footer, contact, case heroes |
| `--mist` | `#dce1e6` | Mist gray | 30% — light text and soft surfaces on dark |
| `--slate` | `#68748a` | Slate blue | 30% — structural mid tone |
| `--copper` | `#b8737f` | Copper | 10% — CTAs, rules, highlights, selection |

Derived, because two brand colours fail AA as body text on `--paper`:

- `--copper-ink` `#9d5764` — plain copper is 3.4:1; this is 4.9:1
- `--slate-ink` `#626e84` — plain slate is 4.4:1; this is 4.8:1
- `--mist-soft` `#a8b2c0` — secondary text on dark, 7.6:1 on `--navy`
- `--copper-bright` `#c98996` — hover fills, and 12px labels over artwork

Also changed, because the recolour exposed them:

- **State colours are now separate from the brand.** `.form__status.is-success`
  used the brand accent. With a rose-toned copper, success and error would have
  been near-identical, so both now use `--state-success` `#8fb08a` and
  `--state-error` `#f08a80`, deliberately outside the brand five.
- **Alpha variants derive from `--*-rgb` triplets** rather than literal `rgba()`
  values. Six stale literals still held the *old* palette in decimal form, which
  no hex search would ever have found.
- **Four `rgba(61, 59, 48), 0.15)` declarations had a misplaced paren** and had
  never rendered. Those borders (work-card body, process items, case pages,
  palette swatches) now appear for the first time.
- Case-study palette swatches name the new colours. Client-specific hues —
  Clay, Alpine, Tallgrass, Field Brown, Field Green, Ridge Blue — are unchanged.
  Fieldnote previously printed `#E9EDDE` under two differently-named swatches.

Verified: 0 text-contrast failures on the homepage at WCAG AA, no horizontal
overflow at 375px, all 31 `var()` references resolve, and no old-palette hex
remains in any CSS, HTML, SVG, or JS file.
