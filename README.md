# NomSou Services — studio site

A static marketing and portfolio site for NomSou Services LLC. Plain HTML, CSS,
and JavaScript: no framework, no build step, no npm install. Open `index.html`
in a browser and it works.

---

## What is in here

```
index.html                  Homepage
404.html                    Not-found page
work/
  cornerstone-realty.html   Case study 01 — brokerage
  ridgeline-property.html   Case study 02 — property management
  fieldnote-provisions.html   Case study 03 — local retail
  tallgrass-landscape.html    Case study 04 — home services
  maple-and-main-coffee.html  Case study 05 — North Georgia cafe
css/
  style.css                 All styling. Section 1 holds every color and size.
  fonts.css                 The two typefaces, served from this site
js/
  config.js                 >> The only file you must edit: Supabase keys <<
  supabase-client.js        Talks to Supabase over plain fetch
  main.js                   Menu, scroll animation, contact form, view counter
assets/
  cover-*.svg               Project cover artwork
  figure-*.svg              In-page project visuals
  fonts/                    Archivo + IBM Plex Mono (woff2)
  logo-mark.svg             The N mark
  favicon.svg               Browser tab icon
supabase/
  schema.sql                Run this once in Supabase to create the tables
netlify.toml                Deploy settings, headers, pretty URLs
robots.txt, sitemap.xml     Search engine basics
```

---

## Running it locally

Double-clicking `index.html` works for most things. To have everything behave
exactly as it will live (including the fonts), run a tiny local server:

```bash
cd nomsou-portfolio
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

---

## Connecting Supabase (contact form + view counters)

**1. Create the tables.** In your Supabase project, open **SQL Editor → New
query**, paste the whole of `supabase/schema.sql`, and press Run. That creates:

- `inquiries` — every contact form submission
- `project_views` — one row per case study with a view count
- `increment_project_view()` — the only way a browser can add to a count

Row level security is switched on. The public key can add an inquiry and read
view counts, and nothing else. **Nobody can read your inquiries from the
browser** — you read them in the Supabase dashboard under Table Editor →
inquiries.

**2. Paste your keys.** Open `js/config.js` and replace the two placeholders:

```js
SUPABASE_URL: "https://abcdefgh.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGciOi...",
```

Both come from **Settings → API** in Supabase. Use the key labelled
**anon / public** — never the `service_role` key, which must not go in a
website.

**3. Test it.** Load the site, send yourself a message through the contact
form, and check the `inquiries` table. Open a case study and the view counter
appears under the project details.

Until the keys are filled in, the form shows a clear error and the view counter
stays hidden. Nothing breaks.

**Optional — get emailed on a new inquiry.** In Supabase go to
**Database → Webhooks**, create a webhook on the `inquiries` table for INSERT,
and point it at an email service or a Netlify function.

---

## Deploying to Vercel

The repo is ready to deploy as-is: `vercel.json` sets the security and cache
headers and turns on clean URLs, so `/work/cornerstone-realty` works without
the `.html`. There is no build step — Vercel serves the folder.

1. Push this folder to GitHub (see below).
2. In Vercel: **Add New → Project**, import the repo.
3. Framework preset: **Other**. Leave the build command empty and the output
   directory as the repo root.
4. Deploy.

Every push to `main` redeploys automatically after that. Pull requests get
their own preview URL.

One detail worth knowing: clean URLs mean the live address of a case study is
`/work/cornerstone-realty`, with no `.html`. The links inside the pages still
say `cornerstone-realty.html` so the folder also works when you open
`index.html` straight off your desktop — Vercel redirects those to the clean
address. The `canonical` tags and `sitemap.xml` already name the clean URLs,
which is what search engines index.

### First push

```bash
cd nomsou-portfolio
git init
git add .
git commit -m "NomSou Services studio site"
git branch -M main
git remote add origin https://github.com/souher88/YOUR-REPO-NAME.git
git push -u origin main
```

`js/config.js` holds only the public anon key, which is safe in a public repo —
as long as you ran `supabase/schema.sql`, which is what makes it safe.

## Deploying to Netlify

`netlify.toml` is included too, if you would rather host there.

1. Push this folder to GitHub.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Leave the build command empty and set the publish directory to `.`
   (`netlify.toml` already says this, so Netlify should fill it in for you).
4. Deploy.

---

## Making changes

**Change a color anywhere on the site.** Open `css/style.css` and edit the
values at the top under `:root`. Every screen updates.

| Token | Value | Where it shows |
| --- | --- | --- |
| `--navy-deep` / `--charcoal` | `#3D3B30` | Hero, footer, body and heading ink |
| `--navy` | `#4D5061` | Buttons, panels, quote band |
| `--gold` | `#E7E247` | Accents on dark backgrounds |
| `--gold-ink` | `#615F1E` | Gold used as *text* on light backgrounds |
| `--blue` | `#5C80BC` | Link underlines, focus rings on light |
| `--blue-ink` | `#4A6696` | Link text on light backgrounds |
| `--mist` / `--paper` | `#E9EDDE` | Light section background; body text on dark |

`--gold-ink` exists because the brand gold only reaches 1.15:1 contrast on a
light background — too low to read. The darker gold hits 5.6:1 and looks like
the same color at label size. `--blue-ink` is the same pattern for the medium
blue (3.3:1 as-is; 4.9:1 darkened).

**Add a fifth case study.**

1. Copy any file in `work/` and rename it.
2. Edit the text. The page structure is commented section by section.
3. Change `data-project-slug="..."` near the top to your new slug.
4. Add that slug to `project_views` in Supabase:
   `insert into project_views (slug) values ('your-new-slug');`
5. Add a card to the work grid in `index.html` and a link in both footers.

**Swap the placeholder artwork.** The `assets/*.svg` files are placeholders
for real screenshots. Replace them with images of the same shape
(covers 1400×600, figures 1200×700) and keep the file names, or update the
`src` attributes.

---

## Accessibility and quality notes

The build was checked with axe-core against WCAG 2.1 A and AA on desktop and
mobile, with zero violations, and the HTML validates. Also handled:

- Every interactive element has a visible keyboard focus ring.
- The mobile menu is fully hidden from keyboard and screen readers when closed.
- Scroll animations are skipped entirely for visitors who have "reduce motion"
  turned on, and the `<noscript>` block shows all content if JavaScript fails.
- The contact form reports errors in text next to the field, not by color alone.
- No horizontal scrolling at 360px through 1440px.
