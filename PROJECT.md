# Ground Truth — project log

A working memo for picking this project back up, mine to re-read, not
polished for anyone else. Update it as things change; don't let it go stale.

## What this is

A bilingual (English / Bangla) AI-focused news and analysis site, read mostly
in Bangladesh. Not a generic "AI startup" site — the brief from day one was to
avoid that look. Design language: electric blue + ember orange, Archivo /
Newsreader / DM Mono for English, Baloo Da 2 / Tiro Bangla for Bangla,
asymmetric editorial layout (spines, bands, inverted sections) rather than a
templated grid of cards.

Stack: SvelteKit (Svelte 5 runes) + `adapter-static`. Content is markdown
files read at build time via `import.meta.glob`. Sveltia CMS (git-backed
headless CMS) sits at `/admin/` as the editing surface — no database, no
server, output is static files.

(The design language just above is the original one. The site has since been
redesigned; see the next section for where it stands.)

## Current design (October 2026)

The **panes** design is the site, at the root (`/`, `/bn`, stories at
`/2026/09/<slug>`). It was tried out under `/panes`; those addresses, and the
original reel design's `/en/...` ones, forward to the same pages today. The
original reel design is retired (its code is in git history). Two earlier
alternates remain for reference: `/grid/en` (the framed grid) and `/map/en`.

Rules the grid and panes versions keep to:
- **One spatial unit.** Every size is a multiple of `--u` (12px on a wide
  screen, 8px on a phone): label rows 3u, text 2u in from a cell's edge, and
  so on. No space without a job; no filler to make something "fit".
- **Line weights carry hierarchy, one job each.** A main rule (`--rule`)
  parts rows and one story from the next; a hairline (`--hair`) divides cells
  within a row. (The framed grid also has a heavier frame, `--frame`.)
- **Lines are lighter on a phone** (`--rule` about 55% ink, `--hair` about 13%,
  against 100% and 18% on a wide screen). In a small space every rule sits
  closer to the text and to the next rule, and there are more of them per
  screen, so the darkness that reads as structure on a wide screen reads as
  clutter on a phone. Both weights drop by about the same share, so a rule
  still outranks a hairline. Keep any new line on these two tokens so it
  follows the rule; don't hardcode an ink border.
- **Don't repeat what's on screen.** The site's name isn't repeated under the
  logo, a topic isn't named on its own cards, the menu hides the topic rows
  it would duplicate.
- **The table never moves, only what's inside it.** The header and topics
  rows stay put; reels move sideways, lists and stories move down.
- **Stories are for reading.** No Latest pane and no topics row on a story;
  the header lies transparent over the lead photo and leaves once the reader
  is in (with the facts sliding away into the left edge on a wide screen),
  and comes back on any scroll up. The reading face is Georgia (Gelasio where
  a device lacks it, Noto Serif Bengali for Bangla).

## Why it's shaped the way it is

**Bilingual = two separate front pages, not one filtered page.**
English lives at `/`, Bangla at `/bn`. They are curated independently — a
story featured on the English front page may not be featured on the Bangla
one, and most stories don't have a translation at all. This was a deliberate
call: parallel-fields-on-one-record would have forced every story to pretend
it has both languages. Instead, translation pairs are optional and linked via
a `translationOf` field on the Bangla document pointing back at the English
slug. `sibling()` in `content.js` finds the pair in either direction.

**Content lives in markdown, not a database — for now.**
Chosen because it's simple, fast, and diffable. The known ceiling: **git and
GitHub are a real barrier for non-technical, Bangla-writing journalists.**
This came up directly — "would they understand the git?" — answer: no, not
without training, and that's a day-one problem, not a someday problem.
Current mitigation is Sveltia CMS (a real edit-and-publish UI that commits to
git behind the scenes, no terminal or git knowledge required). The
longer-term answer, if the newsroom outgrows this, is **headless WordPress**:
WP stays purely an editing surface for writers, the SvelteKit frontend pulls
via REST at build time and outputs static files to a CDN — readers never
touch WordPress, so none of its usual security/perf baggage reaches
production. Not started. Worth revisiting if hiring more non-technical
writers becomes the plan.

**Video is a format, not a section.** A story about an interview is filed
under whatever topic it's actually about (e.g. "The AI Race"), and `kind`/
`video` fields control how it's presented (play button, "watch" vs "read",
real duration instead of estimated read time). There is no standalone
"Video" section.

**Photos are the dominant image type in production**, even though most of
what exists in the repo right now is generated placeholder art
(`Halftone.svelte`, a seeded procedural pattern). Don't mistake the current
placeholder-heavy state for the intended final look.

**Mobile got real attention, not an afterthought.** Standard/feature cards
collapse from ~458px tall to a 104px photo thumbnail (if the story has a
photo) or a 14px "spine" of the generated art (if it doesn't — a full-size
abstract pattern shrunk to thumbnail size reads as noise, not art). This was
built by looking at Rest of World's mobile layout for the *idea* of
compactness without copying their specific execution.

**The horizontal bars under each section title (`SignalBar.svelte`) now
encode real data**, not decoration. Each segment = one story in that
section; width = share of that story's read/watch time within the section
total; colour = report (blue) / investigation (ember) / analysis-explainer-
interview (peach) / video (dashed ember). Rewritten because the original
version was a seeded pattern hashed from the section name — looked like a
data readout, encoded nothing. On a site whose whole pitch is verified fact,
that mismatch mattered enough to fix.

## Removed features (see comment blocks + NOTES.md for restore instructions)

- **Top ribbon** (date, tagline, light/dark toggle, language switch) — gone.
  Language switch now lives small in the header actions row.
- **Manual dark/light toggle** — dark mode now follows the OS/device setting
  only. The CSS for a manual toggle is deliberately left in `app.css` in case
  it comes back.

Both removals came with an explicit instruction to keep notes so they can be
brought back later — that's what `NOTES.md` is for. `PROJECT.md` (this file)
is the bigger picture; `NOTES.md` is the itemized "what was cut and how to
undo it" log.

## Known gaps / not done

- **Responsive images.** One image file currently serves both the 104px
  mobile thumbnail and the full-width hero — no `srcset`. Real cost on
  Bangladeshi mobile data. Not started.
- **Social links** in the footer point at placeholder `#about` — real URLs
  need to go into the `SOCIAL` array in `Footer.svelte`.
- **Newsletter signup** fakes a 900ms delay — no real endpoint wired.
- **Writer photos are stand-ins**: five AI-generated faces of people who
  don't exist, shared between the 18 writers (`static/uploads/authors/
  stand-in-*.jpg`). Each writer's real photo replaces theirs before launch.
- **Test fixtures** need clearing before launch: `static/uploads/test-photo.svg`
  and the frontmatter fields on the English test stories that reference it.
- **CMS scaling decision (WordPress migration)** — discussed, architecture
  agreed in principle, not built. Revisit if the git-based workflow becomes a
  real blocker for writers.

## Story addresses

`/2026/09/the-story-slug` for English, `/bn/2026/09/the-story-slug` for
Bangla . English has the plain address;
every other edition its two letters (a new language: add it to LANGS in
content.js and to src/params/edition2.js).
- Year/month: the folder the story is filed in,
  `content/articles/<lang>/2026/09/<file>.md`. The CMS files a story by the
  month it's first saved, so its address never moves, even if its date is
  corrected later. A translation takes its original's year/month and slug.
- Slug, always English letters (rule in `src/lib/content.js`): the "Web
  address" typed in the CMS; else, for a Bangla translation, its English
  original's; else the file name when it's in English letters (the CMS makes
  English ones from the headline); else, for a Bangla original with nothing
  typed, its title spelled in Latin letters (a rough fallback).
- No two stories in one edition share an address: the older keeps it, the
  newer gets `-2`, and the build warns.
- Old addresses (/en/…, undated /bn/<slug>) forward to the new ones. The one
  exception is the old /en/about, which the About page's own pattern claims.

## Things that bit us once (don't repeat)

- **Svelte's scoped CSS beats global `:lang(bn)` overrides.** Every component
  selector gets a scoping class, so a global `:lang(bn) .title {…}` rule loses
  to the component's own scoped `.title` rule. Fix used throughout: define
  script-dependent metrics (line-height, tracking) as CSS variables at
  `:root` / `:lang(bn)`, and have components reference `var(--lh-display)`
  etc. instead of hardcoding values.
- **YAML anchors don't splice into lists.** `- *anchor` inserts the whole
  referenced array as one nested element, not a flattened list — this nearly
  broke the Sveltia CMS config silently. Fields are now duplicated explicitly
  between the English and Bangla collections in `static/admin/config.yml`,
  with a comment explaining why (don't "fix" this by reintroducing an
  anchor).
- **Sticky header flicker** was a feedback loop: a single scroll threshold
  toggling a header height change, which changes `scrollY`, which retoggles
  the threshold. Fixed with two thresholds (compact above 170px, expand below
  70px) as a JS fallback, and — where supported — CSS
  `animation-timeline: scroll()` which has no discrete state to oscillate in.
  Don't collapse this back to one threshold.
- **`IntersectionObserver`-gated canvas painting** left generated art blank
  when the pane was hidden/backgrounded at first paint. Switched to
  `ResizeObserver`, which fires on `observe()` with settled measurements.

## Where things are

- Admin: `/admin/index.html` in dev (note the `index.html` — `/admin/` alone
  404s under Vite's dev server; check this resolves cleanly on whichever host
  it ships to, most do it automatically).
- Content: `content/articles/en/*.md`, `content/articles/bn/*.md`.
- Design tokens: `src/app.css`.
- Decisions-and-restores index: `NOTES.md`.

## How I like to work on this

Corrections and preferences worth remembering for next time:
- Don't be over-cautious about "copying" competitors' *common conventions*
  (e.g. real platform social icons, general layout ideas) — that's normal
  practice, not imitation. Copying a specific distinctive choice (their exact
  blue, their exact layout) is what to avoid.
- When something doesn't match what was actually asked (e.g. building page
  transitions when the ask was about the sticky header), say so plainly and
  redo it — don't quietly reinterpret.
