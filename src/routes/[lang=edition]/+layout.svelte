<script>
  import { tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { sectionLabel, formatLabel, formatNumber } from '$lib/labels.js';
  import Row from '$lib/site/Row.svelte';
  import { matches, topicUrl, formatUrl, two, STR } from '$lib/site/reel.js';

  let { data, children } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const current = $derived(page.data.section ?? page.data.format ?? null);

  /* The language switch keeps your place: each page says where its
     counterpart is (a story's translation, the same topic), in `alt`. */
  const hrefFor = (l) => page.data.alt?.[l] ?? `${base}/${l}`;

  /* One button, to the other edition, named in its own language so a
     reader looking for it can find it without reading this one. "EN" is
     known everywhere; "বাংলা" is short already, where "বাং" is less familiar. */
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const OTHER_NAME = { en: 'EN', bn: 'বাংলা' };

  /* One panel at a time: the menu (topics, then About and the policies) or search. */
  let open = $state(null);
  afterNavigate(() => (open = null));
  const toggle = (which) => (open = open === which ? null : which);

  $effect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
  });

  /* Search reads a list of every headline, built per edition at build time
     and fetched only the first time the panel opens. */
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
      fetch(`${base}/${l}/search.json`)
        .then((r) => r.json())
        .then((rows) => (lists = { ...lists, [l]: rows }));
    }
  });

  /* Once the page scrolls, content would pass under the see-through bar;
     a strip of page colour fades in behind it so it never does. */
  let scrolled = $state(false);

  function keys(e) {
    if (e.key === 'Escape') open = null;
    else if (e.key === '/' && !open && !e.target.closest?.('input, textarea')) {
      e.preventDefault();
      open = 'search';
    }
  }

  // the server stamps <html lang>; client-side language switches must too
  $effect(() => {
    document.documentElement.lang = lang;
  });

  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The index drops down like a blind. */
  function blind(node) {
    return {
      duration: still() ? 0 : 480,
      easing: cubicOut,
      css: (t) => `clip-path: inset(0 0 ${(1 - t) * 100}% 0)`
    };
  }
</script>

<svelte:window onkeydown={keys} onscroll={() => (scrolled = scrollY > 8)} />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://images.unsplash.com" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wdth,wght@62.5..100,400..700&display=swap"
  />
</svelte:head>

<div class="gtr" {lang}>
  <div class="veil" class:on={scrolled} aria-hidden="true"></div>
  <!-- Blended with `difference`, so it stays legible over paper, ink and photos alike. -->
  <header class="bar" class:onpanel={open === 'menu'}>
    <a class="name" href="{base}/{lang}">Ground Truth</a>
    <div class="right">
      <button
        type="button"
        class="toggle"
        aria-expanded={open === 'search'}
        aria-controls="search"
        onclick={() => toggle('search')}
      >
        {open === 'search' ? `${L.close} ✕` : L.search}
      </button>
      <button
        type="button"
        class="toggle"
        aria-expanded={open === 'menu'}
        aria-controls="menu"
        onclick={() => toggle('menu')}
      >
        {open === 'menu' ? `${L.close} ✕` : `${L.menu} ↓`}
      </button>
      <a class="lang" href={hrefFor(other)} hreflang={other} lang={other} title={L.readOther} aria-label={L.readOther}>{OTHER_NAME[other]}</a>
    </div>
  </header>

  {@render children()}

  {#if open === 'search'}
    <div class="index" id="search" role="search" transition:blind>
      <div class="scroll">
      <label class="query">
        <span class="sr">{L.searchAll}</span>
        <input bind:this={input} bind:value={q} type="search" placeholder={L.searchAll} autocomplete="off" />
      </label>
      <p class="status" aria-live="polite">
        {#if !list}{L.loading}{:else if q.trim()}{found.length ? L.count(formatNumber(found.length, lang)) : L.none}{/if}
      </p>
      <div class="results">
        {#each found.slice(0, 60) as s (s.slug)}
          <Row story={s} showTopic />
        {/each}
      </div>
      </div>
    </div>
  {/if}

  {#if open === 'menu'}
    <div class="index" id="menu" transition:blind>
      <div class="scroll">
      <nav aria-label={L.topics}>
        <ol>
          <li style="--i:0">
            <a href="{base}/{lang}" aria-current={!current && !page.params.slug ? 'page' : undefined}>
              <span class="i">{two(0, lang)}</span>
              <span class="nm">{L.latest}</span>
              <span class="ct">{formatNumber(data.total, lang)}</span>
              <span class="thumbs"></span>
            </a>
          </li>
          {#each data.topics as t, i (t.key)}
            <li style="--i:{i + 1}">
              <a href={topicUrl(t.key, lang)} aria-current={current === t.key ? 'page' : undefined}>
                <span class="i">{two(i + 1, lang)}</span>
                <span class="nm">{sectionLabel(t.key, lang)}</span>
                <span class="ct">{formatNumber(t.count, lang)}</span>
                <span class="thumbs" aria-hidden="true">
                  {#each t.thumbs as src, k (k)}
                    {#if src}<img {src} alt="" loading="lazy" />{:else}<i></i>{/if}
                  {/each}
                </span>
              </a>
            </li>
          {/each}
        </ol>
      </nav>
      <!-- Formats cut across the topics, so they sit apart and go unnumbered. -->
      {#if data.formats.length}
        <nav class="formats" aria-label={L.formats}>
          <ol>
            {#each data.formats as f, i (f.key)}
              <li style="--i:{data.topics.length + 1 + i}">
                <a href={formatUrl(f.key, lang)} aria-current={current === f.key ? 'page' : undefined}>
                  <span class="i"></span>
                  <span class="nm">{formatLabel(f.key, lang)}</span>
                  <span class="ct">{formatNumber(f.count, lang)}</span>
                  <span class="thumbs" aria-hidden="true">
                    {#each f.thumbs as src, k (k)}
                      {#if src}<img {src} alt="" loading="lazy" />{:else}<i></i>{/if}
                    {/each}
                  </span>
                </a>
              </li>
            {/each}
          </ol>
        </nav>
      {/if}
      <footer class="house" style="--i:{data.topics.length + data.formats.length + 1}">
        <p>{L.blurb}</p>
        <nav aria-label="Ground Truth">
          <a href="{base}/en/authors" hreflang="en">{L.reporters}</a>
          {#each data.pages as p (p.slug)}<a href={p.href}>{p.title}</a>{/each}
        </nav>
      </footer>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(:root:has(.gtr)) {
    /* cool grey paper: keeps the orange hot and sits with the indigo */
    --bg: #e9ebee;
    --card: #d5d9de;
    --ink: #111318;
    --mute: #636873;
    --line: #cdd1d7;
    /* One accent, one meaning: a way in. A soft apricot orange, full
       strength for surfaces (the opening and topic cards, where dark text on
       it is 6.3:1) and marks; --accent-text, a burnt shade that passes
       4.5:1 on paper (4.9:1), for anything small set on paper. */
    --accent: #e07a3f;
    --accent-text: #a8471a;
    /* the second surface for cards without a photo (the first is ink):
       indigo, the cool opposite of the orange, with white text (5.9:1) */
    --indigo: #5f5e9c;
    --indigo-text: #ffffff;
    --indigo-ink: #5f5e9c; /* indigo as type on paper: 5.1:1 */
    color-scheme: light;
    background: var(--bg);
  }
  @media (prefers-color-scheme: dark) {
    :global(:root:has(.gtr)) {
      --bg: #0b0b0c;
      --card: #1a1a1c;
      --ink: #eceef1;
      --mute: #8b9099;
      --line: #2a2a2d;
      --accent: #f08a4f;
      --accent-text: #f08a4f; /* already 7.9:1 on the dark page */
      --indigo: #4b4a8c;
      --indigo-text: #ffffff;
      --indigo-ink: #a9a8e0; /* lighter for type on the dark page: 8.7:1 */
      color-scheme: dark;
    }
  }
  :global(body:has(.gtr)) {
    margin: 0;
  }
  :global(::view-transition-group(hero)) {
    animation-duration: 0.55s;
    animation-timing-function: cubic-bezier(0.3, 0.7, 0.1, 1);
  }

  .gtr {
    --k: 1; /* scale for the small labels; larger for Bangla, below */
    --mono: 'JetBrains Mono', 'Noto Sans Bengali', ui-monospace, monospace;
    --pad: 3vw;
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: 'Instrument Sans', 'Noto Sans Bengali', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .gtr:lang(bn) {
    /* Bangla needs more size than Latin to read the same at label sizes,
       and its own face for the labels: the mono is Latin-only, and its wide
       spaces leave gaps between Bangla words. */
    --k: 1.18;
    --mono: 'Noto Sans Bengali', 'JetBrains Mono', ui-monospace, monospace;
    font-family: 'Noto Sans Bengali', 'Instrument Sans', system-ui, sans-serif;
  }
  /* Tracking breaks the headstroke (matra) that joins Bangla letters, so
     none anywhere on the Bangla site — labels, caps, the lot. */
  :global(.gtr:lang(bn) *) {
    letter-spacing: 0 !important;
  }

  .veil {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    height: 4rem;
    background: var(--bg);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .veil.on {
    opacity: 1;
  }

  .bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
    padding: 0 var(--pad);
    color: #fff;
    mix-blend-mode: difference;
    font: 500 calc(0.875rem * var(--k))/1 var(--mono);
    pointer-events: none;
  }
  .bar > * {
    pointer-events: auto;
  }
  /* The name reads as a name: set in the headline face, not the utility mono. */
  .name {
    color: inherit;
    text-decoration: none;
    font-family: 'Instrument Sans', system-ui, sans-serif;
    font-size: 1.4rem;
    font-weight: 660;
    font-stretch: 75%;
    letter-spacing: -0.01em;
  }
  .right {
    display: flex;
    align-items: center;
    gap: 1.1rem;
  }
  .toggle {
    padding: 0.45rem 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  /* Over the indigo Menu the inverting blend would turn khaki: plain white. */
  .bar.onpanel {
    mix-blend-mode: normal;
    color: #fff;
  }
  .lang {
    padding: 0.4rem 0.7rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    color: inherit;
    text-decoration: none;
  }
  .lang:lang(en) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .lang:hover {
    background: #fff;
    color: #000;
  }
  .lang:focus-visible,
  .name:focus-visible,
  .toggle:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* ---- search ---- */
  .query input {
    width: 100%;
    padding: 0.2rem 0 0.6rem;
    border: 0;
    border-bottom: 1px solid var(--ink);
    background: none;
    color: var(--ink);
    font-size: clamp(2rem, 1rem + 3.4vw, 4.2rem);
    font-weight: 620;
    font-stretch: 78%;
    letter-spacing: -0.01em;
    outline: none;
  }
  .query input::placeholder {
    color: var(--line);
  }
  .status {
    min-height: 1rem;
    margin: 1rem 0 0.5rem;
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent-text);
  }

  /* ---- topic index ---- */
  /* The panel covers the page; its contents scroll below the top bar, never
     under it, so the blended bar never lands on the big type. */
  .index {
    position: fixed;
    inset: 0;
    z-index: 9;
    overflow: hidden;
    background: var(--bg);
  }
  .scroll {
    position: absolute;
    inset: 4rem 0 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1rem var(--pad) 3rem;
  }
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--line);
  }
  li {
    border-bottom: 1px solid var(--line);
    animation: rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) calc(var(--i) * 35ms) both;
  }
  @keyframes rise {
    from {
      opacity: 0;
      translate: 0 1.2rem;
    }
  }
  li a {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 1.5rem;
    padding: 0.55rem 0;
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .i,
  .ct {
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
    color: var(--mute);
  }
  .ct {
    min-width: 2ch;
    text-align: right;
  }
  .nm {
    font-size: clamp(1.8rem, 0.7rem + 3.1vw, 4.2rem);
    font-weight: 620;
    font-stretch: 78%;
    line-height: 1.02;
    letter-spacing: -0.01em;
    transition:
      color 0.2s,
      translate 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .nm:lang(bn) {
    line-height: 1.3;
    letter-spacing: 0;
  }
  .thumbs {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
    width: calc(4 * 3.25rem + 12px);
  }
  .thumbs img,
  .thumbs i {
    width: 3.25rem;
    height: 4rem;
    border-radius: 2px;
    object-fit: cover;
    background: var(--ink);
    filter: grayscale(1);
    opacity: 0.75;
    transition:
      filter 0.3s,
      opacity 0.3s;
  }
  li a:hover .nm,
  li a:focus-visible .nm,
  li a[aria-current='page'] .nm {
    color: var(--accent);
  }
  li a:hover .nm,
  li a:focus-visible .nm {
    translate: 0.6rem 0;
  }
  li a:hover .thumbs img,
  li a:focus-visible .thumbs img {
    filter: none;
    opacity: 1;
  }

  .formats {
    margin-top: 2rem;
  }

  /* Under the topics: who we are, and the standing pages. */
  .house {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.25rem 3rem;
    margin-top: 2.5rem;
    animation: rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) calc(var(--i) * 35ms) both;
  }
  .house p {
    max-width: 30rem;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: var(--mute);
  }
  .house nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.5rem;
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .house a {
    color: var(--ink);
    text-decoration: none;
  }
  .house a:hover,
  .house a:focus-visible {
    color: var(--accent-text);
    outline: none;
  }

  /* The Menu is the newsroom's own space: indigo, with the type in white.
     (Orange on indigo is unreadable, so the two never sit on each other.) */
  #menu {
    --line: rgb(255 255 255 / 0.25);
    background: var(--indigo);
    color: #fff;
  }
  #menu li a {
    color: #fff;
  }
  #menu .i,
  #menu .ct,
  #menu .house p {
    color: rgb(255 255 255 / 0.72);
  }
  /* No underlines here — the rows already have rules. The current page is
     marked by an orange square in place of its number (orange as a mark,
     never as type on indigo, where it vibrates and can't be read). */
  #menu li a:hover .nm,
  #menu li a:focus-visible .nm,
  #menu li a[aria-current='page'] .nm {
    color: #fff;
  }
  #menu li a[aria-current='page'] .i {
    width: 0.7rem;
    height: 0.7rem;
    overflow: hidden;
    background: var(--accent);
    color: transparent;
  }
  #menu .house a {
    color: rgb(255 255 255 / 0.8);
    transition: color 0.15s;
  }
  #menu .house a:hover,
  #menu .house a:focus-visible {
    color: #fff;
  }

  @media (max-width: 759px) {
    .gtr {
      --pad: 4vw;
    }
    li a {
      grid-template-columns: 2rem minmax(0, 1fr) auto;
      gap: 0.75rem;
      padding: 0.7rem 0;
    }
    .thumbs {
      display: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    li,
    .house {
      animation: none;
    }
  }
</style>
