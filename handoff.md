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

Complete and verified. Six HTML pages, one stylesheet, three JavaScript files,
fourteen SVG assets, self-hosted fonts, a Supabase schema, and Netlify config.
The site runs with no build step and no dependencies.

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
2. **Added `--gold-ink` (#7a5f18).** The brand gold reads at only 2.2:1 on a
   light background. Every gold-as-text use on light now uses the darker tone
   (5.6:1); brand gold is kept for dark panels, where it hits 6.8:1.
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

## Next steps

1. Paste real Supabase keys into `js/config.js` and run `supabase/schema.sql`
   (README has the click path).
2. Replace `assets/*.svg` with real screenshots or Figma exports at the same
   dimensions — covers 1400×600, figures 1200×700.
3. Decide the real domain and update the `canonical` / `og:url` tags,
   `sitemap.xml`, and `robots.txt` — they currently assume
   `nomsouservices.com`.
4. Confirm `hello@nomsouservices.com` is a live mailbox, or swap the address.
5. Add a Supabase webhook so new inquiries reach your inbox instead of only the
   dashboard.
6. Run Lighthouse on the deployed URL — this build has not been measured on
   real hosting, only checked locally.
7. Consider whether RAD and NEST deserve cards on the homepage alongside the
   spec work; the grid takes six cards without a layout change.
