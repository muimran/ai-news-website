# Second Order — project log

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

### Editorial trials (November 2026)

Two trials of the front page as a newspaper, kept brutalist. Front page
only, no story pages. They sit beside the real front, which they don't
touch, and both run off `edition()` in `src/lib/server/data.js`. Code in
`src/routes/[[lang=edition2]]/editorial/`. Live on GitHub Pages:

- **The site itself** (for comparison): `/` —
  https://muimran.github.io/ai-news-website/
- **Sideways** (`Edition.svelte`): `/editorial` — the reel as the pages of a
  paper. A front page (lead, two seconds), then a page per topic, scrolled
  sideways like the main site. The one I'm sticking with (10 November).
  https://muimran.github.io/ai-news-website/editorial
  - The Inside column is gone (10 November): it listed the newest stories
    from the later pages with their page numbers, which repeated Latest and
    meant nothing until you knew the layout. The front now stops at about
    80% of the screen, so the next page's ink column ("02 · The AI Race")
    stands where Inside was and says there's more to the right. The
    "38 stories" cell above it went too; the count is on the last page.
  - Tried and dropped the same day: a front as one fixed table that never
    scrolls, topics opening in place (too confusing for a news site), and
    a single ranked list (didn't look good).
- **Vertical** (`Vertical.svelte`): `/editorial/vertical` — read down; kept
  for reference. https://muimran.github.io/ai-news-website/editorial/vertical
  (Bangla: `/bn/editorial/vertical`.)

How the vertical one is built, and why:
- **One table of four equal columns runs the whole page.** Every cell spans
  whole columns, so every rule meets the rule above and below. It was first
  made by stacking the sideways pages, and the rules jumped at every page
  edge, because each page had its own columns. A layout that changes
  direction gets designed again for that direction, not stacked.
- **Front:** the edition's date, then the lead across two columns (words in
  one, picture in the next) and the two seconds side by side.
- **Each topic:** a slim ink band (mark, name, "N stories →"), then its lead
  across two columns, alternating left and right, and the rest beside it.
  With only one other story, the lead takes three columns.
- **One picture per topic, the lead's.** When a small cell with a picture
  shared a row with one without, the one without stretched into an empty
  middle.
- **The story type goes in the byline**, in colour, not in a strip above
  the headline. The strip sat empty in half the cells.
- **Cut, because a scrolling page doesn't need them:** the "01 · Front page"
  folio, the motto, the Inside column (every story in it was further down
  the same page), and the topic and page numbers.
- **Space:** text 3u in from the rules (2u on a phone, to stay under the
  header), and a 4u pause of paper before each topic.
- **Narrower:** two halves at a table width of 939px or less, one column at
  519px or less (container queries on the table, so opening Latest narrows
  it too).
- **Alignment is measured, not eyeballed:** every cell edge on a column line,
  text insets equal, headlines level within a row, bylines level at the foot.
  A subgrid silently fails on an element with `container-type`, which is why
  the lead has `container-type: normal`.

### Desk (November 2026)

A whole second version of the site, read down, built from nothing the
panes site uses except the stories. It came out of going back to
https://nucleo.jor.br, the site I started from: it feels like a tool, not
a magazine (a grey ground, ruled paper cards, a serif for what's said, a
mono for the facts about it, one accent, lots of small made things). Desk
is in that family and not that layout. It sits beside the real site and
doesn't touch it. Code in `src/routes/desk/`.

- Local: `/desk/en`, `/desk/bn`. Live:
  https://muimran.github.io/ai-news-website/desk/en

The look, set once in `desk/[lang=edition]/+layout.svelte`:
- **Ground, paper, ink, one accent.** Grey ground `#e7e5e0`, paper cards
  `#fbfaf6`, ink `#161615`, purple `#6a3fd1` (orange until Nov 2026). Cards have one 1px ink rule
  and no shadow; a card lifts off the ground (a hard 4px shadow) only under
  the mouse. That is the only movement on a page.
- **Three voices.** Fraunces for headlines, Anek Latin for the page's own
  words, IBM Plex Mono for facts (type, date, length, counts). Bangla:
  Noto Serif Bengali and Anek Bangla, sized and spaced by variables on
  `.dk:lang(bn)`. The name is always Fraunces, in both editions.
- **Ink means chosen.** A small ink square carries a topic's number; a
  pressed chip or an open Search/Menu button fills with ink. Purple marks
  where the reader is (the topic on screen, the section being read), and
  a purple line means the same and nothing else: under the page the
  reader is on in the Menu, along the tab of the topic being read on the
  front, and the story map's progress. The last two follow the reader as they read.
  No purple line is decoration.
- **Purple also marks the present: what's happening now.** "Where you
  are" and "what's new right now" are the same idea, in place and in time.
  So the one section a page highlights gets a solid purple file tab on a
  purple top edge, everything inside it staying ink. On the front that's
  Latest ("Latest · 18 Sept", the newest story's day). Later the same box
  can hold a new interview or video, its tab naming it ("New video ·
  20 Sept"). One such tab per page; an older story being promoted doesn't
  get it. Not a pale purple fill (that's Search and the Menu), not a
  purple frame (reads as an ad), not an ink band (too heavy).

The bar, the same on every page:
- **The bar is only the name, the day and the tools** (Search, the other
  edition, Menu), on every screen.
- **The name is the largest thing in it** (38px, weight 700) and is as wide
  as the side column under it. A page's own title in the side column is
  a clear step smaller (26px) so it never competes with the name. Story
  headlines may be bigger than the name; the news outranks it.
- **The formats** (Investigations, Interviews, Explainers, Analysis,
  Video) each have a page of every story of that kind. They're not in the
  bar: they sit under the topics in the front page's index, and in the
  Menu. The list is `desk/formats.js`. Video is a format here too, so it
  has its page. (They were boxed chips with counts in the bar until Nov
  2026: they read as filters, the small counts showed how young the outlet
  is, they were cut off on mid-size screens, and they put formats above
  the topics the site is built on.)
- **Search and Menu are two different pages**, each opened by its own
  button, each taking the whole page under the bar on the accent at its
  palest. Search is the field (as large as a headline), the last few
  searches and a line saying what it looks through; then results, with the
  site's own search engine unchanged (`desk/Panel.svelte`). The Menu is the
  lists: topics, formats and all stories, the newsroom's pages. While
  either is open the bar keeps only the name and the buttons. `/` opens
  Search from anywhere, Esc closes.
- **Every box in the bar is one height** (32px), whatever is in it.
- **Donate** sits apart from the tools, a rule after it, with
  "Reader-supported" in the serif italic beside it (on phones the box and rule
  only), on every page. The box is paper with one ink rule, standing lifted
  off the bar (a hard 3px shadow, the look of a card under the mouse, kept
  still), the word in the serif; under the mouse it settles flat. It leads
  to `/desk/<edition>/support`, which says why readers' money matters and
  that ways to give are coming soon. Every story also ends with a ruled
  line, "Readers’ support helps keep reporting like this free", and the same lifted
  box. One page, so changing how people give (card gateway, bKash/Nagad,
  bank transfer, depending on where the outlet is registered) never means
  changing the buttons. The words are in `desk/support.js`. Tried first: a
  filled ink box among the tools, which read as a pressed tool, not an
  invitation. The phone bar's boxes and name are tightened so it all fits
  on one line down to 360px, in Bangla too.
- **Front.** The lead as a card in its picture's own colour with the
  object standing in it, two seconds beside it; a Latest box of the eight
  newest under its purple "now" tab, with the way to all of them; then a **dossier** to a topic: a
  tray of paper with a file tab standing on its top edge (number, name),
  its first story a colour card, the rest rows with a small square of
  their picture. The column down the left is the index (topics, then
  formats) and marks the dossier on screen.
- **A video beside the lead.** When there's a video, the newest one takes
  the second of the two cards beside the lead and plays there (its topic's
  dossier then leaves it out). The card is the still across the top, in
  black and white like the portraits, with a play box in its middle:
  paper, one ink rule, "▶ Play · 14 min", the bar's own kind of box, so it
  shows on a dark or a light picture; under the mouse it gets the cards'
  hard shadow. Clicking loads the YouTube player in place, from
  youtube-nocookie, so nothing of YouTube's runs before the reader asks.
  The headline under it goes to the story's page. A first try with a small
  ink box in the corner didn't read as playable: it vanished on a dark
  still, and a reader looks for play in the middle. The video's address is
  the story's `video:` (any YouTube link); the swap is Desk's own
  (`desk/[lang=edition]/+page.server.js`), the other trials unchanged.
  **Live with a stand-in:** "The rise of the prompt supervisor" has
  3Blue1Brown's neural-network video (pushed Nov 2026, on purpose, so the
  card shows): replace it with the real one.
- **Topic, format, writer, all stories.** One pattern (`Frame`, `Side`,
  `Stories`): what the page is down the left, held there (name, count, a
  field to filter its stories, the way back); beside it the newest as a
  colour card and the rest a ledger by month.
- **All stories** also draws its own history from the stories: a small
  grid to each month there are stories in (a square to a day, darker the
  more that day), and bars for how many each topic and format has. All
  three are filters too. Only months with stories are drawn, so a young
  outlet never shows empty time. It stays "All stories" in links;
  "Archive" is only its small label.
- **Reporters and a writer.** Portraits in black and white. Under Desk
  these exist per language (Bangla names and roles on the Bangla side);
  on the panes site they are English only.
- **The newsroom's pages.** The list of them down the side, the page as a
  sheet with a reading column.
- **A story.** Facts, writer and the map of sections down the side; one
  sheet whose head is the story's colour card; the text in a reading
  column with a margin where source notes stand beside their sentences
  (opened in place where there's no margin). Narrower than the side column
  allows (tablet, phone) the story comes first: the side column goes, its
  links (how we reported it, the other edition) sit under the head, and
  the writer comes after the text. Glossary terms, story cards,
  pull quotes, wide photos, method, changes and the way back to where the
  reader stopped all carry over. A special is shown as it is, under the
  bar.

Tried on the way and dropped, so I don't go back to them:
- **A fixed table that never scrolls**, topics opening in place: too
  confusing for a news site.
- **A single ranked list of headlines**: didn't look good.
- **"Stage"**, a plain headline list with half the screen changing colour
  and picture as each headline passed: not calm, and still basic. Adding
  a ruler, a label strip and big numbers didn't fix "basic". (Its last
  code is still in `src/routes/stage`, uncommitted; delete it.)
- **Format chips that faded the other stories where they stood**: the
  screen went grey and the matches were somewhere below.
- **The name on a block of ink**, and **the menu on full black**: each the
  only heavy thing on a quiet page.
- **Topic links on the empty search page**: they read as search filters
  and were links away.

What I learned for next time: "too basic" isn't answered with gadgets or
motion but with composition, pictures, mixed kinds of card and more than
one voice of type; and anything that changes while the reader scrolls
reads as not calm.

Not done on Desk: dark mode has never been looked at; on a phone the All
stories history sits above the list; the Bangla edition has no interviews
or video, so those formats don't show there.

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

- **Story cards: words at the top, on the picture's own colour.** Each card
  takes the dominant colour of its picture's upper half (read when the site
  is built, `src/lib/server/tone.js`, using `sharp`). The headline, summary
  and byline sit at the top on that colour, solid behind the words, then
  fading into the picture over a long tail below them, so the wash only goes
  as deep as the words need. No dark shade over any picture. The words go
  dark ink or white, whichever reads better; a colour too middling for
  either is eased lighter or darker until the text reaches 4.5:1. An editor
  can set the colour by hand ("Card colour" in the CMS), and it's then used
  as set. The illustrations are composed for this: objects kept in the lower
  part of the frame (`tools/illustrations/`). Idea taken from De
  Correspondent's cards; their rounded corners, gaps and type pills were left
  out on purpose (they'd break the table of lines and repeat what the label
  row already says).
- **Phone bottom row.** Latest and Topics read as buttons: an ↑ on each, a
  faint tint (7% ink) deepening when pressed, and on a first visit only the
  arrows bob once (remembered in the browser as `gt-nudged`). Open, Topics
  softly blurs and pales the page behind it (1.5px, 20%); a tap there closes.

- **Small finishes (October 2026).**
  - *Printer's quotes.* Writers type straight " and '; the build sets them
    curly (“ ” ‘ ’) in headlines, deks, photo credits, story text, About
    pages and writer bios, never inside code (`src/lib/typo.js`).
  - *Shared links.* Every page carries Open Graph / X tags: a story shows its
    headline, dek and picture; any other page the name, the blurb and a
    plain name card (`static/social.png`). Full addresses come from
    `src/lib/site/origin.js`, the one line to change when the site moves to
    secondorder.news.
  - *Tab icon.* An interim "SO" in the header's face, white on ink
    (`static/icon-*.png`, `apple-touch-icon.png`); redo it, and the name
    card, once the logo is chosen.
  - *Header over a story's photo.* Its words take the photo's own text
    colour (ink or white, the card's), and ink once the photo has scrolled
    up past it. Specials keep the old difference blend, since their tops can
    be anything.
  - *Card summaries end on a whole sentence*: sentences drop from the end
    until the rest fits its three lines (`src/routes/sentences.js`).
  - *Latest list.* A title's topic mark hangs in front so its lines start
    together; Bangla months are written out in full (১৭ সেপ্টেম্বর), with a
    wider date column to hold them.
  - The photo credit sits in the reading column, on the headline's line; the
    story-type label on cards lost its glow (read as blur that small).

- **The site remembers its reader (October 2026).** In their own browser
  only (`src/routes/memory.svelte.js`, localStorage `so-reads`, `so-seen`;
  nothing is sent anywhere). Read stories go quiet in Latest; a card's label
  row fills along its foot with how far the reader got; a story begun shows
  "Continue · 42%" on its card and, opened, a button under the dek back to
  the paragraph they'd reached (the furthest point is kept). Stories that
  weren't in any list on the reader's last visit get a small orange dot;
  a first visit shows none.
- **The story's map.** Its sections, by their headings, sit in the facts
  column under the facts and stay when the facts fold away: read sections
  filled, the one being read marked and filling, a click glides there. It
  steps aside for wide photos, as the facts do. The hover that brings the
  facts back answers only in their part of the column now. On a phone, a
  thin orange line across the top fills instead.
- **How we know.** In the CMS, per story: Interviews, Documents, Reporting
  time ("Six months of reporting") → a "How we reported it" block in the
  facts; Updates and corrections (dated, typed) → "Updated/Corrected 19
  Sept" in the facts and the full list at the story's foot. Source notes:
  `[^1]` after a sentence and `[^1]: source` on a line below; set in the
  right margin beside the sentence on a wide frame (≥1150px), opened in place
  by a tap below that. Story headers are now read as real YAML (`js-yaml`),
  falling back to the old line reader if one doesn't parse.
- **Glossary.** CMS collections "Glossary — English" / "শব্দকোষ — বাংলা"
  (`content/glossary/<lang>/*.md`: term, also-written-as, meaning). At build,
  the first time each term appears in a story (dek included) is marked; a
  tap, click, hover or Enter shows the meaning in a small card. Never in
  links, headings, quotes, captions, code or notes. English finds plurals,
  Bangla the endings on a word. It can't tell a noun from a verb ("to
  compute"), so keep terms that are unambiguous in AI writing.
- **Evidence to open.** CMS "Documents and data": named links (DocumentCloud,
  Drive, GitHub), shown as small ink-bordered cells under "How we reported
  it". Idea from The Markup's "See our data" box, placed in the facts column
  so it's always in the same place.
- **Another story, in the text.** A link to one of our stories pasted on a
  line of its own becomes a card (`src/routes/AlsoCard.svelte`; the HTML is
  split around it in `withCards()` in data.js): topic, picture on its own
  colour, headline, date and length, and what the reader's done with it
  (read, or how far). Wide, it hangs half into the right margin with the
  text running round it; narrower, in the column. Its label row fills with
  ink on hover, like a reel card.
- **Pull quotes name the speaker.** `>` the quote, then a line starting with
  a dash for who said it → one figure; the speaker in small capitals. Wide,
  the quote runs out past the text into the right margin. Cards, quotes and
  source notes all clear each other in that margin, so they stack.
- *Sample data to delete before launch:* "The AI boom is reaching places
  investors forgot to look" is now a 1,500-word sample written to show all
  of this (method, documents, an update, six source notes, two story cards,
  two pull quotes, a wide photo): it names no real people or firms. And the
  eight starter glossary terms, if they're not wanted.

- **Font trial (October 2026, temporary).** `src/routes/FontPicker.svelte`:
  two small menus at the right edge, Headline and Body, switching the
  headline face and the English reading face among a few free Google Fonts.
  Always on the local copy; on the live site only after opening any page
  with `?fonts` (remembered in that browser; `?nofonts` hides it again), so
  readers never see it. Once a choice is made, set it for real and delete
  the picker.

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

- **Responsive images: done for uploads (Nov 2026).** A photo an editor
  uploads (to `static/uploads/`) is never served itself: before every build
  and while the dev server runs, `scripts/sizes.js` makes WebP copies at
  240, 800 and 1600px in `static/uploads/sized/` (not in git; only missing
  or stale ones are made), and `photo()` in `src/lib/site/reel.js` points
  at them. A 1.4 MB test upload became 0.9 / 6.9 / 35 KB. The hand-made
  JPGs in `uploads/stories/` (the `PHOTOS` list) still work as before.
- **Search at scale: done on both sites (Nov 2026).** The search files
  (`/search/<edition>.json` for the panes site, `/desk/search/<edition>.json`
  for Desk) carry headlines, standfirsts, writers and places, no text (27 KB
  for 38 stories, was 80 KB). The text is searched by Pagefind (`pagefind`,
  pinned 1.5.2), which `npm run build` runs after `vite build` over the
  built pages: it indexes only what's marked `data-pagefind-body` (the text
  of a story on each site), one index per edition (from `<html lang>`),
  and loads only the pieces a search needs. Each site keeps only its own
  copies of a story from the results. Headline matches come first, then
  stories found only in their text; a story shows Pagefind's excerpt, with
  the searched words marked, when the excerpt marks one, else its
  standfirst. Under the dev server there's no Pagefind index, so search
  reads headlines only; test full text on a build. Topics and tags aren't
  searched ("ai" would find everything).
- **Long lists: paged (Nov 2026).** A topic, a format or a writer shows at
  most 60 stories (`desk/paging.js`), older ones on `/page/2`, `/page/3` …,
  with Newer / Older under the list. All stories is a month to a page
  (`/all` the newest, `/all/2026/09` any other), Newer / Older month under
  it; its history down the side is drawn from per-day counts, this year's
  months as grids (other months link to their page), other years as links.
  Those routes have nothing to build until there are enough stories, which
  `svelte.config.js` allows (any other unbuilt route still fails the build).
- **The map trial** gets its map from the server, without the stories'
  text; a story's text is fetched when it's opened (`/map/<edition>/text/
  <slug>.json`). Before, the browser loaded every story's full text.
- **Picture colours and sizes are cached between builds** in `.cache/` (not
  in git), by each picture's contents, so a build only works out what's new.
  The deploy keeps `.cache` and `static/uploads/sized` with GitHub's cache.
- **Still to do for thousands of stories:** GitHub Pages' ~1 GB limit (about
  1,500 stories of pictures): put pictures on an image host, and delete the
  trials not chosen, each of which builds every page again.
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
- Card colours: `src/lib/server/tone.js` (read at build time).
- How the story illustrations are made: `tools/illustrations/README.md`.
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
