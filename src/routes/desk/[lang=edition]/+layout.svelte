<script>
  /* Desk: the site read down, in the family of Núcleo's (a site that feels
     like a tool: a grey ground, ruled paper cards, a serif for what's said
     and a mono for what's about it) but not its layout.

     This is what every Desk page shares: the colours and the three voices,
     the bar (the name, which is the way home; the formats, each a link to
     its own page, the one being read filled; the day; search, the other
     language, the menu), the two pages that open over the page, Search
     and the Menu (Panel.svelte), and the foot. While either is open the
     bar keeps only the name and the buttons. */
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { formatNumber } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';
  import Panel from '../Panel.svelte';
  import { deskHome, deskAll, deskAuthors, deskPage } from '../urls.js';

  let { data, children } = $props();
  const lang = $derived(data.lang);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const W = {
    en: { about: 'About', other: 'বাংলা', format: 'Formats' },
    bn: { about: 'আমাদের কথা', other: 'English', format: 'ধরন' }
  };
  const DAY = {
    en: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD-u-nu-beng', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  };
  /* the menu-and-search sheet: null, 'menu' or 'search' */
  let panel = $state(null);
  afterNavigate(() => {
    panel = null;
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400..700&family=Anek+Latin:wght@400..700&family=Fraunces:opsz,wght@9..144,400..700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Serif+Bengali:wght@500..700&display=swap"
  />
</svelte:head>

<div class="dk" class:open={!!panel} {lang}>
  <header class="bar">
    <a class="name" href={deskHome(lang)}>Second Order</a>
    {#if data.day}<span class="date">{DAY[lang].format(new Date(data.day))}</span>{/if}
    <button type="button" class="tool seek" aria-expanded={panel === 'search'} aria-controls="desk-menu" onclick={() => (panel = panel === 'search' ? null : 'search')}
      ><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.75" /><path d="M10 10l4.5 4.5" /></svg><span>{panel === 'search' ? L.close : L.search}</span>{#if panel !== 'search'}<kbd>/</kbd>{/if}</button
    >
    <a class="tool lang" href={page.data.alt?.[other] ?? deskHome(other)} lang={other} hreflang={other}>{W[lang].other}</a>
    <button type="button" class="tool" aria-expanded={panel === 'menu'} aria-controls="desk-menu" onclick={() => (panel = panel === 'menu' ? null : 'menu')}>{panel === 'menu' ? L.close : L.menu}</button>
  </header>
  <Panel {lang} topics={data.topics} formats={data.formats} pages={data.pages} total={data.total} bind:open={panel} />

  {@render children()}

  <footer class="end">
    <span class="name">Second Order</span>
    <span class="motto">{L.tagline}</span>
    <a href={deskAll(lang)}>{L.all} →</a>
    <a href={deskAuthors(lang)}>{L.reporters} →</a>
    <a href={deskPage(lang, 'about')}>{W[lang].about} →</a>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
  }

  /* A grey ground, paper on it, one ink and one accent. Three voices: a
     serif for what's said, a sans for the page's own words, a mono for
     the facts about a story. */
  .dk {
    --ground: #e7e5e0;
    --card: #fbfaf6;
    --ink: #161615;
    --mute: color-mix(in srgb, var(--ink) 60%, var(--card));
    --hair: color-mix(in srgb, var(--ink) 14%, var(--card));
    --accent: #6a3fd1;
    --bar: 4rem;
    --side: 17rem; /* the column down the left of every page; the name stands over it */
    --title: 1.625rem; /* a page's own name in that column: a clear step under the site's */
    --pad: clamp(1rem, 2vw, 1.75rem);
    --gap: 1rem;
    --serif: 'Fraunces', 'Noto Serif Bengali', Georgia, serif;
    --sans: 'Anek Latin', 'Anek Bangla', system-ui, sans-serif;
    --mono: 'IBM Plex Mono', 'Anek Bangla', ui-monospace, monospace;
    --hw: 560; /* a headline's weight, */
    --hlh: 1.04; /* its leading, */
    --hls: -0.022em; /* its spacing */
    --hk: 1; /* and its size against the English */
    --ms: 0.6875rem; /* the mono's size */
    --mt: 0.07em; /* and its spacing */
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--ground);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 1rem;
    -webkit-font-smoothing: antialiased;
  }
  /* Bangla stands taller, has no capitals to space out, and reads small
     at the mono's size */
  .dk:lang(bn) {
    --serif: 'Noto Serif Bengali', 'Fraunces', Georgia, serif;
    --sans: 'Anek Bangla', 'Anek Latin', system-ui, sans-serif;
    --mono: 'Anek Bangla', 'IBM Plex Mono', ui-monospace, monospace;
    --hw: 600;
    --hlh: 1.34;
    --hls: 0;
    --hk: 0.82;
    --ms: 0.8125rem;
    --mt: 0.01em;
  }
  @media (prefers-color-scheme: dark) {
    .dk {
      --ground: #0f0f0e;
      --card: #1b1b19;
      --ink: #ecebe5;
    }
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  /* the mono voice */
  .date,
  .tool,
  .end {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }

  /* ---- the bar ---- */
  .bar {
    position: sticky;
    top: 0;
    z-index: 5;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    height: var(--bar);
    padding: 0 var(--pad);
    border-bottom: 1px solid var(--ink);
    background: var(--card);
  }
  .name {
    flex: none;
    margin-right: calc(var(--pad) - 0.4rem);
    /* the name is the same letters in both editions */
    font-family: 'Fraunces', var(--serif);
    font-size: 1.375rem;
    font-weight: 650;
    font-variation-settings: 'opsz' 72;
    letter-spacing: -0.03em;
    line-height: 1;
    white-space: nowrap;
  }
  /* In the bar the name is the largest thing on it, plain ink on the
     paper, and as wide as the side column under it: what follows it in the
     bar starts on the left edge of the page's cards. */
  .bar .name {
    box-sizing: border-box;
    width: calc(var(--side) + 1.75rem - var(--pad) - 0.4rem);
    margin-right: 0;
    font-size: 2.375rem;
    font-weight: 700;
    letter-spacing: -0.045em;
    outline: none;
  }
  .bar .name:hover,
  .bar .name:focus-visible {
    color: var(--accent);
  }
  .tool {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    /* one height for every box in the bar, whatever's in it */
    box-sizing: border-box;
    height: 2rem;
    margin: 0;
    padding: 0 0.65rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
  }
  .tool:hover,
  .tool:focus-visible,
  .tool[aria-expanded='true'] {
    background: var(--ink);
    color: var(--card);
    outline: none;
  }
  /* Search or the Menu is open: the day steps out (its room is kept, so
     the buttons don't move) */
  .open .date {
    visibility: hidden;
  }
  .date {
    flex: none;
    margin: 0 calc(var(--pad) - 0.4rem) 0 auto;
    color: var(--mute);
    white-space: nowrap;
  }
  .tool svg {
    width: 0.8rem;
    height: 0.8rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
  }
  .tool kbd {
    font: inherit;
    opacity: 0.55;
  }
  .lang {
    letter-spacing: 0.02em;
    text-transform: none;
  }

  /* ---- the foot ---- */
  .end {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem 2rem;
    margin: auto var(--pad) 0;
    padding: 1.25rem 0 2.5rem;
    border-top: 1px solid var(--ink);
    color: var(--mute);
  }
  .end::before {
    content: '';
    flex: 0 0 100%;
    height: 0;
    margin-top: 2.5rem;
    order: -1;
  }
  .end {
    border-top: 0;
  }
  .end .name {
    margin-right: auto;
    color: var(--ink);
    text-transform: none;
    letter-spacing: -0.03em;
  }
  .motto {
    text-transform: none;
    letter-spacing: 0;
    font-family: var(--sans);
    font-size: 0.875rem;
  }
  .end a:hover,
  .end a:focus-visible {
    color: var(--ink);
    outline: none;
  }

  @media (max-width: 1099px) {
    .date {
      display: none;
    }
    /* no side column here: the name takes its own width, the tools go right */
    .bar .name {
      width: auto;
      margin-right: auto;
      font-size: 1.875rem;
    }
  }
  /* a phone: a shorter bar, a smaller name */
  @media (max-width: 759px) {
    .dk {
      --bar: 3.5rem;
      --title: 1.375rem;
    }
    .bar .name {
      font-size: 1.625rem;
    }
    .seek span,
    .seek kbd {
      display: none;
    }
    .seek {
      padding: 0 0.6rem;
    }
    .motto {
      flex-basis: 100%;
    }
  }
</style>
