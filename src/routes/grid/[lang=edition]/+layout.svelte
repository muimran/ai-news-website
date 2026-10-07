<script>
  /* The ruled-grid prototype. The screen is one ruled table: a header row
     of cells, the reel's cells, a row of topics. Lines are the structure,
     never decoration; where two cells meet they share one rule. */
  import { tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { sectionLabel, formatLabel, formatNumber } from '$lib/labels.js';
  import { STR, SHORT_DATE, matches, formatUrl } from '$lib/site/reel.js';
  import Mark from '../Mark.svelte';
  import { gridHome, gridTopic, storyUrl } from '../grid.js';

  let { data, children } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const current = $derived(page.data.section ?? null);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const otherHref = $derived(page.data.gridAlt?.[other] ?? (current ? gridTopic(current, other) : gridHome(other)));

  /* Reading a story. Close goes back to where the reader
     was browsing, at the place they left it, however many stories they've
     read since. */
  const reading = $derived(!!page.data.story);
  let back = null;
  beforeNavigate(() => {
    if (!page.data.story) back = { url: page.url.href, y: scrollY, depth: 0 };
  });
  afterNavigate(() => {
    if (page.data.story && back) back.depth++;
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

  /* One panel at a time, dropped into the frame over the reel: the menu or
     search. */
  let open = $state(null);
  afterNavigate(() => (open = null));
  const toggle = (which) => (open = open === which ? null : which);

  /* Search reads the live site's list of every headline, fetched the first
     time the panel opens. */
  let q = $state('');
  let input = $state();
  let lists = $state({});
  const list = $derived(lists[lang]);
  const found = $derived(list && q.trim() ? list.filter((s) => matches(s, q)) : []);

  $effect(() => {
    if (open !== 'search') return;
    tick().then(() => input?.focus());
    if (!lists[lang]) {
      const l = lang;
      fetch(`${base}/search/${l}.json`)
        .then((r) => r.json())
        .then((rows) => (lists = { ...lists, [l]: rows }));
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
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wdth,wght@62.5..100,400..700&display=swap"
  />
</svelte:head>

<div class="g" {lang}>
  <header class="top" class:topic={!!current}>
    <a class="cell name" href={gridHome(lang)}>New Terms</a>
    {#if current}
      <a class="cell here" href={gridTopic(current, lang)}><Mark key={current} /><span class="nm1">{sectionLabel(current, lang)}</span></a>
    {/if}
    <span class="spare"></span>
    <!-- one cell for the tools -->
    <nav class="cell tools">
      {#if reading}
        <a class="btn fill" href={current ? gridTopic(current, lang) : gridHome(lang)} onclick={close}>✕ {L.close}</a>
      {/if}
      <button type="button" class="btn fill" aria-expanded={open === 'search'} aria-controls="gsearch" onclick={() => toggle('search')}
        >{open === 'search' ? `${L.close} ✕` : L.search}</button
      >
      <button type="button" class="btn fill" aria-expanded={open === 'menu'} aria-controls="gmenu" onclick={() => toggle('menu')}
        >{open === 'menu' ? `${L.close} ✕` : `${L.menu} ↓`}</button
      >
      <a class="btn fill lang" href={otherHref} hreflang={other} lang={other}>{other === 'en' ? 'EN' : 'বাংলা'}</a>
    </nav>
  </header>
  {@render children()}

  {#if open === 'menu'}
    <!-- Topics on the left, big; the formats and the newsroom's own pages
         on the right. Those still open the live site's pages. -->
    <div class="panel menu" id="gmenu" transition:blind>
      <nav class="col" aria-label={L.topics}>
        <p class="head">{L.topics}</p>
        {#each data.topics as t (t.key)}
          <a class="row big fill" href={gridTopic(t.key, lang)} aria-current={current === t.key ? 'page' : undefined}>
            <Mark key={t.key} size={22} />
            <span class="nm">{sectionLabel(t.key, lang)}</span>
            <span class="ct">{L.count(formatNumber(t.count, lang))}</span>
          </a>
        {/each}
      </nav>
      <nav class="col side" aria-label={L.formats}>
        {#if data.formats.length}
          <p class="head">{L.formats}</p>
          {#each data.formats as f (f.key)}
            <a class="row fill" href={formatUrl(f.key, lang)}>
              <span class="nm">{formatLabel(f.key, lang)}</span>
              <span class="ct">{formatNumber(f.count, lang)}</span>
            </a>
          {/each}
        {/if}
        <p class="head">{lang === 'bn' ? 'নিউজরুম' : 'The newsroom'}</p>
        <a class="row fill" href="{base}/grid/en/authors"><span class="nm">{L.reporters}</span></a>
        {#each data.pages as p (p.slug)}
          <a class="row fill" href={p.href}><span class="nm">{p.title}</span></a>
        {/each}
        <p class="blurb">{L.blurb}</p>
      </nav>
    </div>
  {/if}

  {#if open === 'search'}
    <div class="panel search" id="gsearch" role="search" transition:blind>
      <label class="q">
        <span class="sr">{L.searchAll}</span>
        <input bind:this={input} bind:value={q} type="search" placeholder={L.searchAll} autocomplete="off" />
      </label>
      <p class="head status" aria-live="polite">
        {#if !list}{L.loading}{:else if q.trim()}{found.length ? L.count(formatNumber(found.length, lang)) : L.none}{:else}&nbsp;{/if}
      </p>
      <div class="results">
        {#each found.slice(0, 50) as s (s.slug)}
          <a class="row res fill" href={storyUrl(s)}>
            <span class="d">{SHORT_DATE[lang].format(new Date(s.date))}</span>
            <span class="nm">{s.title}</span>
            <span class="ct"><Mark key={s.section} size={14} />{sectionLabel(s.section, lang)}</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Two colours, each at three strengths, and no others: full for marks,
     a middle tint, a pale one for filled cells. The burnt orange is the
     full orange where it has to be read as small text on paper. */
  :global(:root:has(.g)) {
    --paper: #e9ebee;
    --ink: #111318;
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
      --ink: #eceef1;
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
    --frame: 2px;
    --line: 1px;
    --mono: 'JetBrains Mono', 'Noto Sans Bengali', ui-monospace, monospace;
    --sans: 'Instrument Sans', 'Noto Sans Bengali', system-ui, sans-serif;
    --u: 0.75rem;
    --in: calc(2 * var(--u));
    --m: calc(8 * var(--u));
    --mv: 0px;
    --pad: 0px;
    --top: calc(4 * var(--u));
    --bot: calc(4 * var(--u));
    --label: calc(3 * var(--u));
    --pic: calc(16 * var(--u)); /* the picture column of a page that scrolls down: lists, writers, stories */
    --reel: calc(100vh - var(--top) - var(--bot) - 2 * var(--mv));
    --fw: calc((var(--reel) - var(--label) - var(--pad)) * 5 / 7 + 2 * var(--pad));
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
  :global(.g .fill:hover::before),
  :global(.g .fill:focus-visible::before) {
    transform: scaleY(1);
  }
  :global(.g .fill:hover),
  :global(.g .fill:focus-visible) {
    color: var(--paper);
    outline: none;
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
  /* The name's cell is as wide as the name. */
  .name {
    flex: none;
    font-size: 1.4rem;
    font-weight: 660;
    font-stretch: 75%;
    letter-spacing: -0.01em;
  }
  /* on a page that scrolls down, the name's cell is the picture column's
     width, and its rule runs on down past the portrait, photos or facts */
  .g:has(:global(main.page)) .name {
    flex-basis: var(--pic);
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
  .tools {
    flex: none;
    gap: 0.25rem;
    padding: 0 0.5rem;
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
    left: var(--m);
    right: var(--m);
    bottom: calc(var(--mv) + var(--bot));
    overflow-y: auto;
    box-sizing: border-box;
    border-left: var(--frame) solid var(--rule);
    border-right: var(--frame) solid var(--rule);
    background: var(--paper);
  }
  .menu {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    align-items: start;
  }
  .side {
    border-left: var(--line) solid var(--rule);
    align-self: stretch;
  }
  .head {
    margin: 0;
    padding: 0 var(--in);
    height: var(--label);
    line-height: var(--label);
    border-bottom: var(--line) solid var(--rule);
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .row + .head {
    border-top: var(--line) solid var(--rule);
    margin-top: 2.5rem;
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
  .blurb {
    margin: 2.5rem 0 0;
    padding: var(--in) var(--in) var(--u);
    border-top: var(--line) solid var(--rule);
    border-bottom: var(--line) solid var(--rule);
    background: var(--i3);
    font-size: 0.875rem;
    line-height: 1.45;
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
  .q input::placeholder {
    color: var(--mute);
    opacity: 0.6;
  }
  .res {
    display: grid;
    grid-template-columns: 5rem minmax(0, 1fr) auto;
    align-items: baseline;
  }
  .d {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    color: var(--o-text);
  }

  @media (max-width: 759px) {
    .menu {
      grid-template-columns: minmax(0, 1fr);
    }
    .side {
      border-left: 0;
      border-top: var(--line) solid var(--rule);
    }
    .res {
      grid-template-columns: 4rem minmax(0, 1fr);
    }
    .res .ct {
      display: none;
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
      --bot: 3rem;
      --pic: calc(11 * var(--u));
      --top: 3rem;
      --reel: calc(100svh - var(--top) - var(--bot) - 2 * var(--mv));
    }
    /* A topic's cell takes a second header row of its own. */
    .g:has(.top.topic) {
      --top: 5.5rem;
    }
    .top {
      flex-wrap: wrap;
    }
    .top > .cell {
      height: calc(3rem - 1px);
    }
    .name {
      flex: 0 0 auto;
      width: auto;
      padding: 0 var(--u);
      border-right-color: var(--hair);
      font-size: 1.2rem;
    }
    .tools {
      padding: 0 0.25rem;
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
