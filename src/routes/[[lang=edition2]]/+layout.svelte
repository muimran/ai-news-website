<script>
  /* The site: the ruled grid, with a Latest pane down its left
     side that scrolls on its own and folds to a strip. The screen is one
     ruled table: a header row of cells, the Latest pane beside the main
     pane (the reel's cells, a list, a story), a row of topics. Lines are the structure,
     never decoration; where two cells meet they share one rule. */
  import FontPicker from '../FontPicker.svelte';
  import { tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { sectionLabel, formatLabel, formatNumber, kindLabel } from '$lib/labels.js';
  import { STR, SHORT_DATE, snippet, marked, photo, closeTo } from '$lib/site/reel.js';
  import Mark from '../Mark.svelte';
  import Latest from '../Latest.svelte';
  import { ui } from '../ui.svelte.js';
  import { gridHome, gridTopic, gridFormat, gridAuthor, storyUrl } from '../grid.js';

  let { data, children } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const current = $derived(page.data.section ?? null);
  const format = $derived(page.data.format ?? null);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const otherHref = $derived(
    page.data.gridAlt?.[other] ?? (current ? gridTopic(current, other) : format ? gridFormat(format, other) : gridHome(other))
  );

  /* Reading a story. Close goes back to where the reader
     was browsing, at the place they left it, however many stories they've
     read since. */
  const reading = $derived(!!page.data.story);
  /* a page you go to and then leave: a story, or one of the newsroom's own
     pages (the six in the menu's last group, and each writer's page). All
     of them close back to where the reader was browsing. */
  const away = $derived(reading || !!page.data.newsroom);
  let back = null;
  beforeNavigate(() => {
    if (!page.data.story && !page.data.newsroom) back = { url: page.url.href, y: scrollY, depth: 0 };
  });
  afterNavigate(() => {
    if ((page.data.story || page.data.newsroom) && back) back.depth++;
  });
  function close(e) {
    if (!back) return; // straight in from outside: the link's own address
    e.preventDefault();
    if (back.depth === 1) history.back();
    else {
      const { url, y } = back;
      goto(url).then(() => scrollTo(0, y));
    }
  }

  $effect(() => {
    document.documentElement.lang = lang;
  });

  /* One panel, the menu, dropped into the frame over the reel. Search is
     its first row: typing there turns the menu into results. */
  let open = $state(null);
  afterNavigate(() => {
    open = null;
    ui.sheet = false;
  });
  const toggle = (which) => {
    open = open === which ? null : which;
    q = '';
  };

  /* Search reads the edition's every story, headline to last line, fetched
     the first time the menu opens, with MiniSearch (loaded only then too):
     whole words, word beginnings (union finds unionised), small typos
     forgiven, and the best matches first, a headline counting most. Stories
     with every word searched; if none has them all, those with some, said
     so. */
  let q = $state('');
  let input = $state();
  let indexes = $state({});
  const index = $derived(indexes[lang]);
  const results = $derived.by(() => {
    if (!index || !q.trim()) return { list: [], some: false };
    let hits = index.search(q);
    const some = !hits.length && q.trim().split(/\s+/).length > 1;
    if (some) hits = index.search(q, { combineWith: 'OR' });
    // a writer's name isn't in the row, so a match there puts it in the quote
    const byWriter = (r) => Object.values(r.match).some((fields) => fields.includes('author'));
    return { list: hits.map((r) => ({ ...index.byId.get(r.id), terms: r.terms, byWriter: byWriter(r) })), some };
  });
  const found = $derived(results.list);

  /* Above the stories, the writers and topics a search names: every word
     searched starts a word of the name. Words of two letters or fewer
     ("ai") don't count here, or "ai" would name half the topics. */
  const named = (label) => {
    const want = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const have = label.toLowerCase().split(/[\s&,]+/).filter(Boolean);
    return want.length > 0 && want.every((w) => have.some((h) => h.startsWith(w)));
  };
  const people = $derived(
    index && q.trim() ? index.writers.filter((w) => named(`${w.name} ${w.name_bn ?? ''}`)).slice(0, 3) : []
  );
  const places = $derived(
    q.trim() ? data.topics.filter((t) => named(`${sectionLabel(t.key, lang)} ${t.key}`)) : []
  );

  /* When nothing is found: the nearest spelling the stories have, then the
     topics, then the newest stories, so a search never ends at a wall. */
  const nothing = $derived(!!index && !!q.trim() && !found.length && !people.length && !places.length);
  const meant = $derived.by(() => {
    if (!nothing) return null;
    const want = q.trim().toLowerCase();
    // only a real near-miss: one slip in a short word, two in a long one
    return (
      index
        .suggest(q)
        .map((x) => x.suggestion)
        .find((x) => x !== want && closeTo(want, x)) ?? null
    );
  });

  /* The last few searches someone followed through (opened a result, or
     pressed Enter), kept in this browser only, offered when search opens
     empty; Clear forgets them. */
  let recent = $state([]);
  $effect.pre(() => {
    try {
      recent = JSON.parse(localStorage.getItem('nt-recent') || '[]');
    } catch {}
  });
  function remember() {
    const term = q.trim();
    if (!term) return;
    recent = [term, ...recent.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    try {
      localStorage.setItem('nt-recent', JSON.stringify(recent));
    } catch {}
  }
  function forget() {
    recent = [];
    try {
      localStorage.removeItem('nt-recent');
    } catch {}
  }

  /* After a search, chips narrow it to one topic or one kind of story; only
     those the results have, each with how many. A new search clears them. */
  let only = $state({ section: null, kind: null });
  $effect(() => {
    q;
    only = { section: null, kind: null };
  });
  const tally = (key) => {
    const m = new Map();
    for (const s of found) if (s[key]) m.set(s[key], (m.get(s[key]) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const bySection = $derived(tally('section'));
  const byKind = $derived(tally('kind'));
  const shown = $derived(
    found.filter((s) => (!only.section || s.section === only.section) && (!only.kind || s.kind === only.kind))
  );

  $effect(() => {
    if (open !== 'menu') return;
    // a wide screen with a mouse can type straight away; a phone-sized one
    // opens the menu as it is, the field waiting until it's tapped
    if (matchMedia('(hover: hover) and (min-width: 760px)').matches) tick().then(() => input?.focus());
    if (!indexes[lang]) {
      const l = lang;
      Promise.all([fetch(`${base}/search/${l}.json`).then((r) => r.json()), import('minisearch')]).then(
        ([{ stories: rows, writers }, { default: MiniSearch }]) => {
          const ms = new MiniSearch({
            idField: 'id',
            // only what a result shows: a match always has a visible reason
            // (topic names and tags would let "ai" find nearly everything)
            fields: ['title', 'dek', 'author', 'text'],
            searchOptions: {
              boost: { title: 4, dek: 2, author: 2 },
              // a word's beginning finds the word from three letters on
              // ("chatt" finds Chattogram; "us" is only us)
              prefix: (term) => term.length >= 3,
              // typos forgiven only in longer words: one letter off a short
              // word is another word ("usa" isn't "us" or "use")
              fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
              combineWith: 'AND'
            }
          });
          // a story's address is its month and slug: two months may share a slug
          const docs = rows.map((r) => ({ ...r, id: `${r.ym}/${r.slug}` }));
          ms.addAll(docs);
          indexes = {
            ...indexes,
            [l]: {
              search: (text, opts) => ms.search(text, opts),
              // the nearest real word or words in the stories, for "did you mean"
              // candidates up to two letters off (a swap counts two here);
              // closeTo then keeps only true near-misses
              suggest: (text) => ms.autoSuggest(text, { fuzzy: 2, prefix: false, combineWith: 'AND' }),
              byId: new Map(docs.map((r) => [r.id, r])),
              newest: docs.slice(0, 3),
              writers
            }
          };
        }
      );
    }
  });

  function keys(e) {
    if (e.key === 'Escape') open = null;
  }

  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* drops down like a blind */
  function blind() {
    return {
      duration: still() ? 0 : 420,
      easing: cubicOut,
      css: (t) => `clip-path: inset(0 0 ${(1 - t) * 100}% 0)`
    };
  }
</script>

<svelte:window onkeydown={keys} />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://images.unsplash.com" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wdth,wght@62.5..100,400..700&family=Gelasio:ital,wght@0,400;0,700;1,400&family=Noto+Serif+Bengali:wght@400;700&display=swap"
  />
</svelte:head>

{#if page.data.fullscreen}
  <!-- a full-screen special: its own page and nothing of ours but one small
       way back. It keeps the site's colours and spacing to use if it wants. -->
  <div class="g full" {lang}>
    {@render children()}
    {#if ui.back !== false}
      <a class="away" data-at={ui.back} href={current ? gridTopic(current, lang) : gridHome(lang)} onclick={close}>New Terms ✕</a>
    {/if}
  </div>
{:else}
<div class="g" {lang} class:story={away} class:folded={ui.folded || ((away || ui.reading) && !ui.pin)} class:reading={ui.reading} class:deep={ui.deep || ui.wide} class:far={ui.deep} class:bare={ui.deep && !ui.up && !open} class:over={reading && !open} class:begun={reading && ui.begun && !ui.up && !open}>
  <!-- on a phone a story's topic is the first of its facts, so the header
       doesn't give it a row of its own there -->
  <!-- with the menu or search open, that panel is the page: the topic's
       cell steps out of the header, and the topics row out of the foot -->
  <header class="top" class:topic={!!(current || format) && !reading && !open}>
    <a class="cell name" href={gridHome(lang)} lang="en"
      ><span class="logo"><span class="w1">New</span> <span class="w2">Terms</span></span></a
    >
    {#if open}
      <!-- nothing: the panel says where you are -->
    {:else if current}
      <a class="cell here" class:onstory={reading} href={gridTopic(current, lang)}><Mark key={current} /><span class="nm1">{sectionLabel(current, lang)}</span></a>
    {:else if format}
      <a class="cell here" href={gridFormat(format, lang)}><span class="nm1">{formatLabel(format, lang)}</span></a>
    {/if}
    <span class="spare"></span>
    <!-- one cell for the tools -->
    <nav class="cell tools">
      {#if away}
        <a class="btn fill" href={current ? gridTopic(current, lang) : gridHome(lang)} onclick={close}>✕ {L.close}</a>
      {/if}
      <!-- the other edition stays in sight: it's how half the readers find theirs -->
      <a class="btn fill lang" href={otherHref} hreflang={other} lang={other}>{other === 'en' ? 'EN' : 'বাংলা'}</a>
      <!-- two lines that cross when the menu is open -->
      <button
        type="button"
        class="btn fill burger"
        aria-expanded={open === 'menu'}
        aria-controls="gmenu"
        aria-label={open === 'menu' ? L.close : L.menu}
        onclick={() => toggle('menu')}><span class="bars" aria-hidden="true"></span></button
      >
    </nav>
  </header>
  <Latest {lang} stories={data.latest} current={page.data.story?.slug ?? null} aside={!!page.data.newsroom} />
  {@render children()}

  {#if open === 'menu'}
    <!-- Topics on the left, big; the formats and the newsroom's own pages
         on the right. -->
    <div class="panel menu" id="gmenu" transition:blind>
      <div class="find" role="search">
        <label class="q">
          <span class="sr">{L.searchAll}</span>
          <input
            bind:this={input}
            bind:value={q}
            type="search"
            placeholder={L.searchAll}
            autocomplete="off"
            onkeydown={(e) => e.key === 'Enter' && remember()}
          />
        </label>
        {#if !q.trim() && recent.length}
          <div class="recent">
            <span class="lbl">{L.recent}</span>
            {#each recent as term (term)}
              <button type="button" class="chip" onclick={() => ((q = term), input?.focus())}>{term}</button>
            {/each}
            <button type="button" class="forget" onclick={forget}>{L.clear}</button>
          </div>
        {/if}
      </div>
      {#if q.trim()}
        <div class="found">
          <p class="head status" class:empty={nothing} aria-live="polite">
            {#if !index}{L.loading}{:else if found.length}{L.count(formatNumber(found.length, lang))}{:else if !people.length && !places.length}{L.none}{/if}
          </p>
          {#if index && results.some && found.length}<p class="some">{L.some}</p>{/if}
          {#if nothing}
            <div class="instead">
              {#if meant}
                <p class="meant">{L.meant} <button type="button" onclick={() => (q = meant)}>{meant}</button>?</p>
              {/if}
              <p class="lbl">{L.tryTopic}</p>
              <div class="chips flat">
                {#each data.topics as t (t.key)}
                  <a class="chip" href={gridTopic(t.key, lang)}><Mark key={t.key} size={12} />{sectionLabel(t.key, lang)}</a>
                {/each}
              </div>
              <p class="lbl">{L.newest}</p>
            </div>
            {#each index.newest as s (s.id)}
              {@const pic = photo(s)}
              <a class="row res fill" href={storyUrl(s)}>
                <span class="thumb">{#if pic}<img src={pic.small} alt="" loading="lazy" />{:else}<Mark key={s.section} size={20} />{/if}</span>
                <span class="d">{SHORT_DATE[lang].format(new Date(s.date))}</span>
                <span class="nm">{s.title}</span>
                <span class="ct"><Mark key={s.section} size={14} />{sectionLabel(s.section, lang)}</span>
                <span class="snip">{s.dek}</span>
              </a>
            {/each}
          {/if}
          {#each people as w (w.slug)}
            <a class="row res named fill" href={gridAuthor(w.slug)} onclick={remember}>
              <span class="thumb face">{#if w.photo}<img src={w.photo} alt="" loading="lazy" />{/if}</span>
              <span class="d">{L.writer}</span>
              <span class="nm">{lang === 'bn' && w.name_bn ? w.name_bn : w.name}</span>
              <span class="ct">{L.count(formatNumber(w.count, lang))}</span>
              <span class="snip">{lang === 'bn' && w.role_bn ? w.role_bn : w.role}</span>
            </a>
          {/each}
          {#each places as t (t.key)}
            <a class="row res named fill" href={gridTopic(t.key, lang)} onclick={remember}>
              <span class="thumb mark"><Mark key={t.key} size={26} /></span>
              <span class="d">{L.topic}</span>
              <span class="nm">{sectionLabel(t.key, lang)}</span>
              <span class="ct">{L.count(formatNumber(t.count, lang))}</span>
            </a>
          {/each}
          {#if found.length > 1 && (bySection.length > 1 || byKind.length > 1)}
            <div class="chips" role="group" aria-label={L.topics}>
              <button type="button" class="chip" aria-pressed={!only.section && !only.kind} onclick={() => (only = { section: null, kind: null })}
                >{L.any} <b>{formatNumber(found.length, lang)}</b></button
              >
              {#if bySection.length > 1}
                {#each bySection as [key, n] (key)}
                  <button type="button" class="chip" aria-pressed={only.section === key} onclick={() => (only = { ...only, section: only.section === key ? null : key })}
                    ><Mark {key} size={12} />{sectionLabel(key, lang)} <b>{formatNumber(n, lang)}</b></button
                  >
                {/each}
              {/if}
              {#if byKind.length > 1}
                {#each byKind as [key, n] (key)}
                  <button type="button" class="chip kind" aria-pressed={only.kind === key} onclick={() => (only = { ...only, kind: only.kind === key ? null : key })}
                    >{kindLabel(key, lang)} <b>{formatNumber(n, lang)}</b></button
                  >
                {/each}
              {/if}
            </div>
          {/if}
          {#each shown.slice(0, 50) as s (s.id)}
            {@const pic = photo(s)}
            <a class="row res fill" href={storyUrl(s)} onclick={remember}>
              <span class="thumb">{#if pic}<img src={pic.small} alt="" loading="lazy" />{:else}<Mark key={s.section} size={20} />{/if}</span>
              <span class="d">{SHORT_DATE[lang].format(new Date(s.date))}</span>
              <span class="nm"
                >{#each marked(s.title, s.terms) as p, i (i)}{#if p.hit}<mark>{p.t}</mark>{:else}{p.t}{/if}{/each}</span
              >
              <span class="ct"><Mark key={s.section} size={14} />{sectionLabel(s.section, lang)}</span>
              <span class="snip"
                >{#each marked((s.byWriter ? `${s.author} · ` : '') + snippet(s, s.terms), s.terms) as p, i (i)}{#if p.hit}<mark>{p.t}</mark>{:else}{p.t}{/if}{/each}</span
              >
            </a>
          {/each}
        </div>
      {:else}
        <nav class="col" aria-label={L.topics}>
        <p class="head" style:--n="1">{L.topics}</p>
        {#each data.topics as t, i (t.key)}
          <a class="row big fill" style:--n={i + 2} href={gridTopic(t.key, lang)} aria-current={current === t.key ? 'page' : undefined}>
            <Mark key={t.key} size={22} />
            <span class="nm">{sectionLabel(t.key, lang)}</span>
            <span class="ct">{L.count(formatNumber(t.count, lang))}</span>
          </a>
        {/each}
      </nav>
      <nav class="col side" aria-label={L.formats}>
        {#if data.formats.length}
          <p class="head" style:--n="1">{L.formats}</p>
          {#each data.formats as f, i (f.key)}
            <a class="row fill" style:--n={i + 2} href={gridFormat(f.key, lang)} aria-current={format === f.key ? 'page' : undefined}>
              <span class="nm">{formatLabel(f.key, lang)}</span>
              <span class="ct">{formatNumber(f.count, lang)}</span>
            </a>
          {/each}
        {/if}
        <p class="head" style:--n={data.formats.length + 2}>{lang === 'bn' ? 'নিউজরুম' : 'The newsroom'}</p>
        <a class="row fill" style:--n={data.formats.length + 3} href="{base}/authors" aria-current={page.data.authors ? 'page' : undefined}><span class="nm">{L.reporters}</span></a>
        {#each data.pages as p, i (p.slug)}
          <a class="row fill" style:--n={data.formats.length + 4 + i} href={p.href} aria-current={page.data.doc?.slug === p.slug ? 'page' : undefined}><span class="nm">{p.title}</span></a>
        {/each}
      </nav>
      <p class="blurb" style:--n={data.formats.length + 5 + data.pages.length}>{L.blurb}</p>
      {/if}
    </div>
  {/if}
</div>
{/if}

<FontPicker />

<style>
  /* Two colours, each at three strengths, and no others: full for marks,
     a middle tint, a pale one for filled cells. The burnt orange is the
     full orange where it has to be read as small text on paper. */
  :global(:root:has(.g)) {
    --paper: #e9ebee;
    --ink: #26282f; /* a soft ink, not black: about 12:1 on the paper */
    --mute: #5d626c;
    --rule: var(--ink);
    --hair: color-mix(in srgb, var(--ink) 18%, transparent);
    --o: #e07a3f;
    --o2: #eeab84;
    --o3: #f6dccb;
    --o-text: #a8471a;
    --i: #5f5e9c;
    --i2: #9c9bc9;
    --i3: #d7d7ec;
    color-scheme: light;
    background: var(--paper);
  }
  @media (prefers-color-scheme: dark) {
    :global(:root:has(.g)) {
      --paper: #0e0e10;
      --ink: #dfe2e7;
      --mute: #8d929b;
      --o: #f08a4f;
      --o2: #9a5530;
      --o3: #3a2419;
      --o-text: #f08a4f;
      --i: #8e8dd0;
      --i2: #56558f;
      --i3: #26254a;
      color-scheme: dark;
    }
  }
  :global(body:has(.g)) {
    margin: 0;
  }

  /* Geometry every part shares, all of it in one unit, --u (12px; 8px on a
     phone): rows 4u high, label rows 3u, text 2u in from its cell's edge
     (--in), and the table 8u in from the sides, running the screen's full
     height: a column whose two sides are the frame. No space has no job: inside the frame everything
     fills to the lines; a card is a label row over a 5:7 photo that runs
     to its borders. Three line
     weights, one job each: --frame (2px ink) is the table's edge; --line
     (1px ink) parts the rows and one story from the next; the hairline
     (--hair) divides cells within a row. */
  .g {
    --k: 1;
    --frame: 0px; /* full width: the screen's edges are the frame */
    --line: 1px;
    --mono: 'JetBrains Mono', 'Noto Sans Bengali', ui-monospace, monospace;
    --sans: 'Instrument Sans', 'Noto Sans Bengali', system-ui, sans-serif;
    /* the reading face, for the running text of stories and pages only:
       Georgia where the device has it, Gelasio (drawn to its measure) where
       it doesn't, and a serif Bangla to sit with them */
    --read: Georgia, 'Gelasio', 'Noto Serif Bengali', serif;
    --u: 0.75rem;
    --in: calc(2 * var(--u));
    --m: 0px;
    --mv: 0px;
    --pad: 0px;
    --top: calc(4 * var(--u) * 1.3); /* the header row */
    --bot: calc(4 * var(--u));
    --label: calc(3 * var(--u));
    --pic: calc(16 * var(--u)); /* the picture column of a page that scrolls down: lists, writers, stories */
    --side: calc(28 * var(--u)); /* the Latest pane */
    --reel: calc(100vh - var(--top) - var(--bot) - 2 * var(--mv));
    --spine: calc(3 * var(--u)); /* a card's date strip, beside its photo */
    min-height: 100vh;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  .g:lang(bn) {
    --k: 1.18;
    --mono: 'Noto Sans Bengali', 'JetBrains Mono', ui-monospace, monospace;
    --sans: 'Noto Sans Bengali', 'Instrument Sans', system-ui, sans-serif;
    --read: 'Noto Serif Bengali', Georgia, 'Gelasio', serif;
  }
  :global(.g:lang(bn) *) {
    letter-spacing: 0 !important;
  }

  /* A cell's hover: ink rises from its foot. Shared by every cell that goes
     somewhere, here and in the reel. */
  :global(.g .fill) {
    position: relative;
    isolation: isolate;
    transition: color 0.2s 0.1s;
  }
  :global(.g .fill::before) {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--ink);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.35s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  :global(.g .fill:focus-visible::before) {
    transform: scaleY(1);
  }
  :global(.g .fill:focus-visible) {
    color: var(--paper);
    outline: none;
  }
  /* hover only where there's a pointer: a tap would leave it stuck on */
  @media (hover: hover) {
    :global(.g .fill:hover::before) {
      transform: scaleY(1);
    }
    :global(.g .fill:hover) {
      color: var(--paper);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.g .fill),
    :global(.g .fill::before) {
      transition: none;
    }
  }

  .top {
    position: fixed;
    top: var(--mv);
    left: var(--m);
    right: var(--m);
    z-index: 10;
    display: flex;
    box-sizing: border-box;
    height: var(--top);
    border: var(--frame) solid var(--rule);
    border-top: 0;
    border-bottom-width: var(--line);
    background: var(--paper);
    transition: transform 0.5s cubic-bezier(0.45, 0, 0.2, 1);
  }
  /* deep in a story the header slides off the top, in step with the facts
     folding away; scrolling back up even a little brings it back, over
     the story */
  .g.bare .top {
    transform: translateY(-100%);
  }
  /* a story's topic is in its facts; the header doesn't repeat it */
  .here.onstory {
    display: none;
  }
  /* On a story the header lies over the page, photo or text: no ground, no
     rules, its type turned light or dark by whatever is beneath it. */
  .g.over .top {
    background: transparent;
    border-bottom-color: transparent;
    color: #fff;
    mix-blend-mode: difference;
  }
  .g.over .top .cell {
    border-color: transparent;
  }
  /* A phone's header leaves as soon as the reading starts, quickly (as De
     Correspondent's does: a quarter second, easing out), and comes back
     the moment the reader scrolls up. */
  @media (max-width: 759px) {
    .top {
      transition: transform 0.25s ease-out;
    }
    .g.begun .top {
      transform: translateY(-100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .top {
      transition: none;
    }
  }
  .cell {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    box-sizing: border-box;
    padding: 0 var(--in);
    border: 0;
    border-right: 1px solid var(--hair);
    background: none;
    color: inherit;
    text-decoration: none;
    white-space: nowrap;
  }
  /* The name's cell is the Latest pane's width, so its rule runs on down
     the pane's edge; folded, it's as wide as the name. */
  /* the name is one mark on both editions: always the English face and
     spacing, never the Bangla one's Latin letters */
  .name {
    flex: 0 0 calc(var(--side) - var(--frame));
    min-width: max-content;
    font-family: 'Instrument Sans', system-ui, sans-serif;
    font-size: 1.9rem;
    font-weight: 660;
    font-stretch: 75%;
    letter-spacing: -0.01em !important;
  }
  /* on a page that scrolls down, the name's cell is the picture column's
     width, and its rule runs on down past the portrait, photos or facts */
  .g.folded {
    --side: calc(3 * var(--u));
  }
  /* a story has no Latest pane: the page is all the story's */
  .g.story,
  .g.story.folded {
    --side: 0px;
  }
  /* the topic gives way first when the row is short: it shortens with an
     ellipsis rather than pushing the tools out of the frame */
  .nm1 {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .here {
    flex: 0 1 auto;
    min-width: 0;
    background: var(--o3);
    color: var(--o-text);
    font-size: 1.4rem;
    font-weight: 440;
    font-stretch: 75%;
    letter-spacing: -0.01em;
  }
  .spare {
    flex: 1 1 0;
    min-width: 0;
    padding: 0;
  }
  /* the last button runs to the screen's edge, so its fill does too */
  .tools {
    flex: none;
    gap: 0.25rem;
    padding: 0 0 0 0.5rem;
    border-right: 0;
  }
  .btn {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 0.75rem;
    border: 0;
    background: none;
    color: inherit;
    text-decoration: none;
    font: 500 calc(0.875rem * var(--k)) / 1 var(--mono);
    cursor: pointer;
  }
  .lang:lang(en) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  /* the menu: two lines, which turn and cross while it's open */
  /* the other edition and the menu: two boxes of one size, 6u, their
     contents centred, so the lines (and the cross) sit in the middle */
  .tools .lang,
  .burger {
    box-sizing: border-box;
    width: calc(6 * var(--u));
    justify-content: center;
    padding: 0;
  }
  .bars {
    position: relative;
    display: block;
    width: 1.375rem;
    height: 0.5rem;
  }
  .bars::before,
  .bars::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: currentColor;
    transition: transform 0.35s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  .bars::before {
    top: 0;
  }
  .bars::after {
    bottom: 0;
  }
  .burger[aria-expanded='true'] .bars::before {
    transform: translateY(calc(0.25rem - 1px)) rotate(45deg);
  }
  .burger[aria-expanded='true'] .bars::after {
    transform: translateY(calc(1px - 0.25rem)) rotate(-45deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .bars::before,
    .bars::after {
      transition: none;
    }
  }

  /* ---- the panels: laid over the reel, inside the frame ---- */
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .panel {
    position: fixed;
    z-index: 20;
    top: calc(var(--mv) + var(--top));
    /* open, the menu is the page: it runs the full width, over the Latest
       pane, whose rows keep a rhythm of their own */
    left: var(--m);
    right: var(--m);
    bottom: var(--mv);
    overflow-y: auto;
    box-sizing: border-box;
    border-right: var(--frame) solid var(--rule);
    background: var(--paper);
  }
  /* The menu is the newsroom's own surface: pale indigo, the tint that
     already means "who we are" (dark mode: its deep counterpart). On it
     the pale indigo inside the topic marks turns paper, so it doesn't
     melt into the ground. */
  .panel {
    --paper: #d7d7ec;
    --i3: #e9ebee;
    --hair: color-mix(in srgb, var(--ink) 10%, transparent);
  }
  @media (prefers-color-scheme: dark) {
    .panel {
      --paper: #26254a;
      --i3: #0e0e10;
    }
  }
  /* opening, the menu's rows come in one after another, rising a little:
     search first, then the topics, the other links, who we are. Quick, so
     it never holds anyone up; on opening only. */
  .menu > :not(nav),
  .menu nav > * {
    animation: rise 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    animation-delay: calc(60ms + var(--n, 0) * 30ms);
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .menu > :not(nav),
    .menu nav > * {
      animation: none;
    }
  }
  /* the one thing a full-screen special keeps: a small way back, in a
     corner, over whatever the special draws */
  .away {
    position: fixed;
    z-index: 50;
    top: var(--u);
    left: var(--u);
    padding: 0.5rem 0.65rem;
    background: var(--ink);
    color: var(--paper);
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .away[data-at$='right'] {
    left: auto;
    right: var(--u);
  }
  .away[data-at^='bottom'] {
    top: auto;
    bottom: var(--u);
  }
  /* the panel runs to the foot; the topics row would only repeat it */
  .g:has(.panel) :global(.bottom) {
    display: none;
  }
  .menu {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;
    align-items: start;
  }
  /* search is the menu's first row, across it; its results take the rest.
     Below it the topics fill the left column; the right holds the other
     links, and at its foot who we are */
  .find,
  .found {
    grid-column: 1 / -1;
  }
  .found {
    grid-row: 2 / -1;
  }
  .col {
    grid-row: 2 / -1;
  }
  .side,
  .blurb {
    grid-column: 2;
    border-left: var(--line) solid var(--rule);
    align-self: stretch;
  }
  /* a group's name: a quiet label, no rule; groups are parted by space */
  .head {
    margin: 0;
    padding: 0 var(--in);
    height: var(--label);
    line-height: var(--label);
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .row + .head {
    margin-top: var(--in);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: var(--u) var(--in);
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 580;
    font-stretch: 85%;
  }
  .row.big {
    padding: var(--u) var(--in);
    font-size: clamp(1.4rem, 1rem + 1vw, 2rem);
    font-weight: 620;
    font-stretch: 75%;
    letter-spacing: -0.01em;
  }
  .row[aria-current='page'] {
    background: var(--o3);
    color: var(--o-text);
  }
  .nm {
    flex: 1;
    min-width: 0;
  }
  .ct {
    flex: none;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .row:hover .ct,
  .row:focus-visible .ct {
    color: inherit;
  }
  /* who we are, in the newsroom's own words: its statement, set in the
     display face like the topics, signed off at the foot of its column */
  .blurb {
    margin: 0;
    padding: calc(2 * var(--in)) var(--in) var(--in);
    font-size: clamp(1.5rem, 1rem + 1vw, 2rem);
    font-weight: 560;
    font-stretch: 80%;
    line-height: 1.08;
    letter-spacing: -0.01em;
    text-wrap: balance;
    color: var(--ink);
  }
  .blurb:lang(bn) {
    line-height: 1.4;
  }
  /* The menu's lines are its structure: the rule under search, the one
     between the columns, a hairline between the topics (its main list,
     read like a table) and one above each further group. The short links
     go without: space parts them, and each fills from below when pressed.
     (Search results keep theirs: a list of dated stories.) */
  .menu nav .row {
    border-bottom: 0;
  }
  .menu nav .row.big {
    border-bottom: 1px solid var(--hair);
  }
  /* On a wide screen the two columns keep one rhythm, in the unit: a topic
     row is 6u, everything in the other column 4u (its second group's name
     included), so nine of those end with the six topics, on one line, and
     both columns' names sit in the label row. */
  @media (min-width: 760px) {
    .menu .row.big,
    .side .row,
    .side .row + .head {
      box-sizing: border-box;
      padding-block: 0;
    }
    .menu .row.big {
      height: calc(6 * var(--u));
    }
    .side .row {
      height: calc(4 * var(--u));
    }
    .side .row + .head {
      height: calc(4 * var(--u));
      margin-top: 0;
      padding-top: var(--u);
    }
    .side .row:last-of-type {
      border-bottom: 1px solid var(--hair);
    }
  }
  .q {
    display: block;
    border-bottom: var(--line) solid var(--rule);
  }
  .q input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: var(--u) var(--in);
    border: 0;
    background: none;
    color: var(--ink);
    font-family: var(--sans);
    font-size: clamp(1.6rem, 1rem + 1.6vw, 2.6rem);
    font-weight: 620;
    font-stretch: 75%;
    outline: none;
  }
  /* beside the Latest pane the search row is as tall as its two label rows,
     so the rule under it runs on from theirs as one line */
  @media (min-width: 760px) {
    .q input {
      height: calc(2 * var(--label) + var(--line));
      padding-block: 0;
    }
  }
  .q input::placeholder {
    color: var(--mute);
    opacity: 0.6;
  }
  /* a result: its picture, then date, headline and topic on a line, the
     quote under the headline */
  .res {
    display: grid;
    grid-template-columns: 4.5rem 5rem minmax(0, 1fr) auto;
    column-gap: 0.9rem;
    align-items: baseline;
  }
  .res .thumb {
    grid-column: 1;
    grid-row: 1 / span 2;
    align-self: start;
    display: grid;
    place-items: center;
    width: 4.5rem;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--i3);
  }
  .res .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 65%;
  }
  .res .thumb.face {
    width: 3.25rem;
    aspect-ratio: 5 / 7;
    justify-self: center;
  }
  .res .thumb.face img {
    object-position: 50% 25%;
  }
  .res .thumb.mark {
    background: none;
  }
  .res .d {
    grid-column: 2;
    grid-row: 1;
  }
  .res .nm {
    grid-column: 3;
    grid-row: 1;
  }
  .res .ct {
    grid-column: 4;
    grid-row: 1;
  }
  /* a writer or topic the search names, ahead of the stories */
  .named .nm {
    font-size: 1.25rem;
    font-weight: 620;
    font-stretch: 75%;
  }
  .named .d {
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  /* recent searches, under the empty field */
  .recent {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    padding: var(--u) var(--in);
    border-bottom: 1px solid var(--hair);
  }
  .lbl {
    margin: 0 0.3rem 0 0;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .forget,
  .meant button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--o-text);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }
  .forget {
    margin-left: auto;
    font: 500 calc(0.75rem * var(--k)) / 1 var(--sans);
  }
  /* nothing found: said plainly, in the headline face, not as a label */
  .status.empty {
    padding-top: var(--in);
    font: 650 clamp(1.4rem, 1rem + 1.2vw, 2rem) / 1.1 var(--sans);
    font-stretch: 80%;
    letter-spacing: -0.01em;
    text-transform: none;
    color: var(--ink);
  }
  /* nothing found: what to try instead */
  .instead {
    display: flex;
    flex-direction: column;
    gap: var(--u);
    padding: 0 var(--in) var(--u);
  }
  .instead .lbl {
    margin: var(--u) 0 0;
  }
  .meant {
    margin: 0;
    font-size: clamp(1.1rem, 0.9rem + 0.6vw, 1.4rem);
    font-weight: 600;
    font-stretch: 85%;
  }
  .meant button {
    font-weight: 700;
  }
  .chips.flat {
    padding: 0;
    border: 0;
  }
  a.chip {
    text-decoration: none;
  }
  /* the chips that narrow the results: those the results have, with counts */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: var(--u) var(--in);
    border-bottom: 1px solid var(--hair);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border: 1px solid var(--hair);
    border-radius: 999px;
    background: var(--paper);
    color: var(--ink);
    font: 500 calc(0.75rem * var(--k)) / 1 var(--sans);
    cursor: pointer;
  }
  .chip b {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    color: var(--mute);
  }
  .chip.kind {
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: calc(0.6875rem * var(--k));
  }
  .chip[aria-pressed='true'] {
    border-color: var(--o-text);
    background: var(--o3);
    color: var(--o-text);
  }
  .chip[aria-pressed='true'] b {
    color: inherit;
  }
  .d {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    color: var(--o-text);
  }
  /* under the headline, in small type: the story's own words around what
     was searched for; the searched words stand out in the accent colour,
     headline and quote alike */
  .snip {
    grid-column: 3 / -1;
    grid-row: 2;
    margin-top: 0.35rem;
    font-size: calc(0.8125rem * var(--k));
    font-weight: 400;
    font-stretch: 100%;
    line-height: 1.45;
    color: var(--mute);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
  }
  /* when no story has every word: a plain line saying the results are the
     nearest, under the count, before the first of them */
  .some {
    margin: 0;
    padding: 0 var(--in) var(--u);
    font-size: calc(0.8125rem * var(--k));
    line-height: 1.45;
    color: var(--mute);
  }
  .res mark {
    background: none;
    color: var(--o-text);
    font-weight: 650;
  }

  @media (max-width: 759px) {
    /* a phone: one column, and who we are sunk to the screen's foot */
    .menu {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .blurb {
      margin-top: auto;
      border-left: 0;
    }
    /* on a phone the whole menu fits one screen: the topics a size down,
       one line each, and the short links two to a line */
    .row.big {
      padding: calc(0.6 * var(--u)) var(--in);
      font-size: 1.2rem;
    }
    .menu nav .row:not(.big) {
      padding-block: calc(0.6 * var(--u));
    }
    .row + .head {
      margin-top: var(--u);
    }
    .side {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-content: start;
      border-left: 0;
      margin-top: var(--u);
    }
    .menu .row + .head {
      border-top: 1px solid var(--hair);
    }
    .side .head {
      grid-column: 1 / -1;
    }
    .blurb {
      padding-top: var(--in);
      font-size: 1.25rem;
      text-wrap: pretty;
    }
    /* a phone: the picture, and beside it the date, headline and quote one
       under another */
    .res {
      grid-template-columns: 4rem minmax(0, 1fr);
      column-gap: 0.75rem;
      row-gap: 0.3rem;
    }
    .res .thumb {
      grid-row: 1 / span 3;
      width: 4rem;
    }
    .res .d,
    .res .nm,
    .snip {
      grid-column: 2;
    }
    .res .nm {
      grid-row: 2;
    }
    .snip {
      grid-row: 3;
      margin-top: 0;
    }
    .res .ct {
      display: none;
    }
    .chips {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .chip {
      flex: none;
    }
    /* recent searches: one short line that swipes, so the menu still fits */
    .recent {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
      padding-block: calc(0.5 * var(--u));
      gap: 0.3rem;
    }
    .recent .chip {
      padding-block: 0.2rem;
    }
    /* and the topic rows give up that line's height between them */
    .menu:has(.recent) .row.big {
      padding-block: calc(0.45 * var(--u));
    }
    .recent .lbl {
      flex: none;
    }
    .forget {
      flex: none;
    }
  }

  @media (max-width: 759px) {
    .g {
      /* no outer frame on a phone: the screen's own edge is the table's,
         and every line inside it stays */
      --u: 0.5rem;
      --frame: 0px;
      --m: 0px;
      --mv: 0px;
      --pad: 0px;
      --label: 2.25rem;
      --bot: 2.5rem; /* the topics row, lower on a phone */
      --pic: calc(11 * var(--u));
      --side: 0px;
      --top: 3.9rem;
      --reel: calc(100dvh - var(--top) - var(--bot) - 2 * var(--mv));
      /* Lighter lines on a phone. In a small space every rule sits closer
         to the text and to the next rule, so the darkness that reads as
         structure on a wide screen reads as clutter here. Both weights drop
         by about the same share, so a rule still outranks a hairline. */
      --rule: color-mix(in srgb, var(--ink) 55%, transparent);
      --hair: color-mix(in srgb, var(--ink) 13%, transparent);
    }
    /* no pane on a phone, folded or not: it opens as a panel instead */
    .g.folded {
      --side: 0px;
    }
    /* A topic's cell takes a second header row of its own. */
    .g:has(.top.topic) {
      --top: 6.4rem;
    }
    .top {
      flex-wrap: wrap;
    }
    .top > .cell {
      height: calc(3.9rem - 1px);
    }
    .name {
      flex: 0 0 auto;
      width: auto;
      padding: 0 var(--u);
      border-right-color: var(--hair);
      font-size: 1.55rem;
    }
    .tools {
      padding: 0 0 0 0.25rem;
      gap: 0;
      border-left: 0;
    }
    .btn {
      padding: 0 var(--u);
      font-size: calc(0.75rem * var(--k));
    }
    .here {
      order: 9;
      flex: 1 0 100%;
      height: 2.5rem !important;
      padding-left: var(--u);
      border-top: 1px solid var(--hair);
      border-right: 0;
      font-size: 1.1rem;
    }
  }
</style>
