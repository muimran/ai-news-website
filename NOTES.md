# Decisions worth remembering

Short log of things that were removed or deliberately not built, so nobody has
to re-derive the reasoning. Code-level detail lives in comments at the relevant
file; this is the index.

## Removed, recoverable

### Top ribbon — removed Sept 2026
The electric-blue bar above the masthead. Held the date, the tagline, a
light/dark toggle, and the language switch.

- **Why:** it was four unrelated things competing with the masthead, and none
  of them earned the full width.
- **Where it went:** the language switch now sits small in the header actions
  row. Date and tagline are gone. The tagline still appears in the footer.
- **To restore:** see the comment block at the top of
  `src/lib/components/Header.svelte`.
- **Careful:** the ribbon changing height on scroll is what caused the original
  header flicker. The fix was hysteresis (compact at 170px, expand below 70px).
  Keep it — a single threshold reintroduces the bug.

### Light/dark toggle — removed Sept 2026
Dark mode now follows the device only.

- **Why:** asked for; one less control, and no theme flash on load since
  nothing has to hydrate before painting.
- **Deleted:** `src/lib/theme.js` (read/apply/resolve preference helpers).
- **Kept on purpose:** the `:root[data-theme="dark"]` block and the
  `:root:not([data-theme="light"])` guard in `src/app.css`. Restoring a toggle
  is then markup plus a few lines of JS — stamp or clear `data-theme` on
  `<html>`.

## Built but not yet wired

- **Social links** in the footer all point at `#about`. Real account URLs go in
  the `SOCIAL` array in `Footer.svelte`.
- **Newsletter signup** resolves after a fake 900ms delay. Swap the `try` block
  in `NewsletterBlock.svelte` for the list provider's endpoint.
- **LinkedIn icon** is absent because LinkedIn asked to be removed from
  `simple-icons`. Take the SVG from their brand page if it is wanted.

## Test fixtures to clear before launch

- `static/uploads/test-photo.svg`
- `image:` / `imageAlt:` / `imageCredit:` lines on four English stories
- `video:` / `duration:` on `the-rise-of-the-prompt-supervisor.md`

## Not done yet

- **Responsive images.** One file currently serves both the 104px mobile
  thumbnail and the full-width lead. On Bangladeshi mobile data that is a real
  cost. Needs `srcset` or an image CDN.

## Admin URL quirk

In `npm run dev`, use **`/admin/index.html`** — Vite's dev server does not
resolve `/admin/` to its directory index, and `adapter-static`'s SPA fallback
catches it and renders the 404 page instead.

In production this is usually a non-issue: Netlify, Vercel and Cloudflare Pages
all resolve `/admin/` to `/admin/index.html` automatically. Verify it on your
host after the first deploy rather than assuming.
