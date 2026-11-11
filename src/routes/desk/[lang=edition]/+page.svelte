<script>
  /* Desk: a front page read down, in the family of Núcleo's (a site that
     feels like a tool: a grey ground, ruled paper cards, a serif for what's
     said and a mono for what's about it) but not its layout.

     What's ours:
     - Each topic is a dossier: a tray of paper with a file tab standing on
       its top edge (its number, its name). The rail down the left is the
       drawer's index; it marks the dossier on screen.
     - A dossier's first story is a card in its picture's own colour, the
       object standing in it; the rest are rows with a small square of the
       same.
     - The bar holds the formats. Choosing one (Investigation, Video…)
       leaves every story where it is and lets the others fade back, so the
       page never jumps.
     Nothing moves unless the reader asks: a card lifts under the mouse.
     - The menu and the site's own search are one sheet under the bar
       (Panel.svelte): the Search and Menu buttons, or / from anywhere.

     It shares only data with the site: the edition's stories, their
     pictures and colours, their addresses. */
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { sectionLabel, sectionSlug, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, two, SHORT_DATE, STR } from '$lib/site/reel.js';
  import { storyUrl, gridIndex, gridPage } from '../../grid.js';
  import Panel from '../Panel.svelte';

  let { data } = $props();
  const lang = $derived(data.lang);
  const ed = $derived(data.edition);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const W = {
    en: { front: 'Front page', latest: 'Latest', topics: 'Topics', every: 'All', video: 'Video', about: 'About', other: 'বাংলা', format: 'Format' },
    bn: { front: 'প্রথম পাতা', latest: 'সর্বশেষ', topics: 'বিষয়', every: 'সব', video: 'ভিডিও', about: 'আমাদের কথা', other: 'English', format: 'ধরন' }
  };
  const DAY = {
    en: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD-u-nu-beng', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  };

  /* the dossiers: a topic's first story, and up to four more */
  const dossiers = $derived(
    ed.pages.map((p, i) => ({
      id: sectionSlug(p.key),
      n: two(i + 1, lang),
      label: sectionLabel(p.key, lang),
      total: p.total,
      href: gridIndex(lang, p.key),
      lead: p.stories[0],
      rest: p.stories.slice(1, 5)
    }))
  );
  const everything = $derived([ed.lead, ...ed.seconds, ...ed.pages.flatMap((p) => p.stories)]);

  /* the formats in the bar: only those the page has */
  const isIt = (s, f) => (f === 'Video' ? s.video : s.kind === f);
  const formats = $derived(
    [...KINDS, 'Video'].map((f) => ({ f, n: everything.filter((s) => isIt(s, f)).length })).filter((x) => x.n)
  );
  let format = $state(null);
  /* the menu-and-search sheet: null, 'menu' or 'search' */
  let panel = $state(null);
  const out = (s) => format !== null && !isIt(s, format);
  const formatName = (f) => (f === 'Video' ? W[lang].video : kindLabel(f, lang));

  const mins = (s) => `${num(s.video ? s.duration || s.readTime : s.readTime)} ${L.min}`;
  const kind = (s) => (KINDS.includes(s.kind) ? kindLabel(s.kind, lang) : s.video ? W[lang].video : null);
  const day = (s) => SHORT_DATE[lang].format(new Date(s.date));

  /* the rail marks the section the reader is in */
  let here = $state('front');
  let main = $state();
  onMount(() => {
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) here = e.target.id;
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    for (const el of main.querySelectorAll('[data-sec]')) seen.observe(el);
    return () => seen.disconnect();
  });
  function go(e, id) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }
</script>

<svelte:head>
  <title>Second Order — {L.tagline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400..700&family=Anek+Latin:wght@400..700&family=Fraunces:opsz,wght@9..144,400..700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Serif+Bengali:wght@500..700&display=swap"
  />
</svelte:head>

<!-- what kind of story, in the mono: a square of the accent, or ▶ for a video -->
{#snippet tag(s, withTopic = false)}
  <span class="tag">
    {#if s.video}<i class="tri" aria-hidden="true"></i>{:else}<i class="dot" aria-hidden="true"></i>{/if}
    {[withTopic && sectionLabel(s.section, lang), kind(s)].filter(Boolean).join(' / ') || mins(s)}
  </span>
{/snippet}

{#snippet by(s)}
  <span class="by">{[s.author, day(s), mins(s)].filter(Boolean).join(' · ')}</span>
{/snippet}

{#snippet square(s)}
  {@const p = photo(s)}
  <span class="sq" style:--bg={s.tone?.bg}>{#if p}<img src={p.small} alt="" loading="lazy" />{/if}</span>
{/snippet}

<div class="dk" {lang}>
  <header class="bar">
    <a class="name" href="{base}/desk/{lang}">Second Order</a>
    <div class="chips" role="group" aria-label={W[lang].format}>
      <button type="button" class="chip" aria-pressed={format === null} onclick={() => (format = null)}>{W[lang].every}<small>{num(everything.length)}</small></button>
      {#each formats as x (x.f)}
        <button type="button" class="chip" aria-pressed={format === x.f} onclick={() => (format = format === x.f ? null : x.f)}
          >{formatName(x.f)}<small>{num(x.n)}</small></button
        >
      {/each}
    </div>
    <span class="date">{DAY[lang].format(new Date(ed.date))}</span>
    <button type="button" class="tool seek" aria-expanded={panel === 'search'} aria-controls="desk-menu" onclick={() => (panel = panel === 'search' ? null : 'search')}
      ><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.75" /><path d="M10 10l4.5 4.5" /></svg><span>{L.search}</span><kbd>/</kbd></button
    >
    <a class="lang" href="{base}/desk/{lang === 'en' ? 'bn' : 'en'}" lang={lang === 'en' ? 'bn' : 'en'}>{W[lang].other}</a>
    <button type="button" class="tool" aria-expanded={!!panel} aria-controls="desk-menu" onclick={() => (panel = panel ? null : 'menu')}>{panel ? L.close : L.menu}</button>
  </header>
  <Panel {lang} topics={data.topics} formats={data.formats} pages={data.pages} bind:open={panel} />

  <div class="shell">
    <!-- the drawer's index -->
    <nav class="rail" aria-label={W[lang].topics}>
      <p class="rl">{W[lang].topics}</p>
      <a href="#front" class:here={here === 'front'} onclick={(e) => go(e, 'front')}><b>{two(0, lang)}</b><span>{W[lang].front}</span></a>
      {#each dossiers as d (d.id)}
        <a href="#{d.id}" class:here={here === d.id} onclick={(e) => go(e, d.id)}><b>{d.n}</b><span>{d.label}</span><i>{num(d.total)}</i></a>
      {/each}
      <p class="motto">{L.tagline}</p>
    </nav>

    <main class="main" bind:this={main}>
      <h1 class="sr">Second Order — {L.tagline}</h1>

      <!-- the front: the lead in its picture's colour, two seconds beside it -->
      <section id="front" class="front" data-sec aria-label={W[lang].front}>
        {#if ed.lead}
          {@const p = photo(ed.lead)}
          <a class="card lead" class:out={out(ed.lead)} href={storyUrl(ed.lead)} style:--bg={ed.lead.tone?.bg} style:--fg={ed.lead.tone?.fg}>
            {#if p}<img class="art" src={p.thumb} srcset={p.srcset} sizes="(max-width: 759px) 100vw, 40vw" alt="" />{/if}
            <span class="txt">
              {@render tag(ed.lead, true)}
              <span class="hl">{ed.lead.title}</span>
              {#if ed.lead.dek}<span class="dek">{ed.lead.dek}</span>{/if}
              {@render by(ed.lead)}
            </span>
          </a>
        {/if}
        <div class="seconds">
          {#each ed.seconds as s (s.slug)}
            <a class="card second" class:out={out(s)} href={storyUrl(s)}>
              <span class="txt">
                {@render tag(s, true)}
                <span class="hl">{s.title}</span>
                {@render by(s)}
              </span>
              {@render square(s)}
            </a>
          {/each}
        </div>
      </section>

      <!-- the latest, by day -->
      <section class="card wire" aria-labelledby="wire-h">
        <header>
          <h2 id="wire-h">{W[lang].latest}</h2>
          <a href={gridIndex(lang)}>{L.all} · {num(ed.total)} →</a>
        </header>
        <ol>
          {#each ed.inside.slice(0, 8) as s (s.slug)}
            <li class:out={out(s)}>
              <a href={storyUrl(s)}><time>{day(s)}</time><span>{s.title}</span></a>
            </li>
          {/each}
        </ol>
      </section>

      <!-- a dossier to a topic -->
      {#each dossiers as d (d.id)}
        {@const p = photo(d.lead)}
        <section id={d.id} class="dossier" data-sec aria-labelledby="t-{d.id}">
          <header class="tabs">
            <h2 class="tab" id="t-{d.id}"><b>{d.n}</b>{d.label}</h2>
            <a class="more" href={d.href}>{L.count(num(d.total))} →</a>
          </header>
          <div class="tray" class:alone={!d.rest.length}>
            <a class="card first" class:out={out(d.lead)} href={storyUrl(d.lead)} style:--bg={d.lead.tone?.bg} style:--fg={d.lead.tone?.fg}>
              {#if p}<img class="art" src={p.thumb} srcset={p.srcset} sizes="(max-width: 759px) 100vw, 30vw" alt="" loading="lazy" />{/if}
              <span class="txt">
                {@render tag(d.lead)}
                <span class="hl">{d.lead.title}</span>
                {#if d.lead.dek}<span class="dek">{d.lead.dek}</span>{/if}
                {@render by(d.lead)}
              </span>
            </a>
            {#if d.rest.length}
              <div class="rows">
                {#each d.rest as s (s.slug)}
                  <a class="row" class:out={out(s)} href={storyUrl(s)}>
                    <span class="txt">
                      <span class="hl">{s.title}</span>
                      <span class="by">{[kind(s), s.author, mins(s)].filter(Boolean).join(' · ')}{#if s.video}<i class="tri" aria-hidden="true"></i>{/if}</span>
                    </span>
                    {@render square(s)}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </section>
      {/each}

      <footer class="end">
        <span class="name">Second Order</span>
        <span>{L.tagline}</span>
        <a href={gridIndex(lang)}>{L.all} →</a>
        <a href={gridPage(lang, 'about')}>{W[lang].about} →</a>
      </footer>
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
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
    --accent: #ee4a1b;
    --bar: 3.5rem;
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
  .chip,
  .date,
  .lang,
  .tool,
  .rl,
  .rail b,
  .rail i,
  .tag,
  .by,
  .wire header,
  .wire time,
  .tab b,
  .more,
  .end {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    font-style: normal;
  }
  .hl {
    font-family: var(--serif);
    font-weight: var(--hw);
    line-height: var(--hlh);
    letter-spacing: var(--hls);
    font-variation-settings: 'opsz' 72;
    text-wrap: balance;
  }

  /* ---- the bar: the name, the formats, the day, the other language ---- */
  .bar {
    position: sticky;
    top: 0;
    z-index: 5;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--pad);
    height: var(--bar);
    padding: 0 var(--pad);
    border-bottom: 1px solid var(--ink);
    background: var(--card);
  }
  .name {
    flex: none;
    font-family: var(--serif);
    font-size: 1.375rem;
    font-weight: 650;
    font-variation-settings: 'opsz' 72;
    letter-spacing: -0.03em;
    line-height: 1;
    white-space: nowrap;
  }
  .chips {
    flex: 1;
    display: flex;
    gap: 0.4rem;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .chips::-webkit-scrollbar {
    display: none;
  }
  .chip {
    flex: none;
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0;
    padding: 0.45rem 0.65rem 0.4rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    white-space: nowrap;
    cursor: pointer;
  }
  .chip small {
    font-size: inherit;
    color: var(--mute);
  }
  .chip:hover,
  .chip:focus-visible {
    background: var(--hair);
    outline: none;
  }
  .chip[aria-pressed='true'] {
    background: var(--ink);
    color: var(--card);
  }
  .chip[aria-pressed='true'] small {
    color: inherit;
    opacity: 0.6;
  }
  .date {
    flex: none;
    color: var(--mute);
    white-space: nowrap;
  }
  .lang {
    flex: none;
    padding: 0.45rem 0.65rem 0.4rem;
    border: 1px solid var(--ink);
    letter-spacing: 0.02em;
    text-transform: none;
  }
  .lang:hover,
  .lang:focus-visible,
  .tool:hover,
  .tool:focus-visible,
  .tool[aria-expanded='true'] {
    background: var(--ink);
    color: var(--card);
    outline: none;
  }
  /* search and menu: two buttons to the one sheet */
  .tool {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 0.45rem 0.65rem 0.4rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    white-space: nowrap;
    cursor: pointer;
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
  .lang,
  .tool + .lang {
    margin-left: calc(0.4rem - var(--pad));
  }
  .lang + .tool {
    margin-left: calc(0.4rem - var(--pad));
  }

  /* ---- the rail beside the page ---- */
  .shell {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    align-items: start;
  }
  .rail {
    position: sticky;
    top: var(--bar);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100dvh - var(--bar));
    padding: 1.5rem 0 1.5rem var(--pad);
  }
  .rl {
    margin: 0 0 0.6rem;
    color: var(--mute);
  }
  .rail a {
    display: grid;
    grid-template-columns: 1.75rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.42rem 0;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.2;
    outline: none;
  }
  .rail b {
    display: grid;
    place-items: center;
    height: 1.5rem;
    border: 1px solid var(--ink);
    background: var(--card);
    letter-spacing: 0;
  }
  .rail i {
    color: var(--mute);
  }
  .rail a:hover span,
  .rail a:focus-visible span {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .rail a.here b {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }
  .motto {
    max-width: 14em;
    margin: auto 0 0;
    color: var(--mute);
    font-size: 0.875rem;
    line-height: 1.35;
  }

  /* ---- the page ---- */
  .main {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
    width: 100%;
    max-width: 76rem;
    padding: 1.5rem var(--pad) 0 1.75rem;
  }

  /* paper: one rule round it; under the mouse it lifts off the ground */
  .card {
    position: relative;
    box-sizing: border-box;
    display: block;
    border: 1px solid var(--ink);
    background: var(--bg, var(--card));
    color: var(--fg, var(--ink));
    outline: none;
    transition:
      transform 0.16s ease-out,
      box-shadow 0.16s ease-out,
      opacity 0.25s,
      filter 0.25s;
  }
  @media (hover: hover) {
    a.card:hover,
    a.card:focus-visible {
      transform: translate(-3px, -3px);
      box-shadow: 4px 4px 0 var(--ink);
    }
  }
  /* not the format chosen: it stays where it is and fades back */
  .out {
    opacity: 0.2;
    filter: grayscale(1);
  }
  .row,
  .wire li {
    transition:
      opacity 0.25s,
      filter 0.25s;
  }
  .txt {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dot {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    background: var(--accent);
  }
  .lead .dot,
  .first .dot {
    background: currentColor;
  }
  .tri {
    flex: none;
    display: inline-block;
    width: 0;
    height: 0;
    border: 0.34em solid transparent;
    border-right: 0;
    border-left: 0.58em solid var(--accent);
  }
  .by {
    color: var(--mute);
  }
  .lead .by,
  .first .by {
    color: inherit;
    opacity: 0.72;
  }
  .by .tri {
    margin-left: 0.6em;
  }
  .dek {
    font-size: 1.0625rem;
    line-height: 1.42;
    text-wrap: pretty;
  }
  .dek:lang(bn) {
    line-height: 1.6;
  }
  /* a small square of a story's picture, on its colour */
  .sq {
    flex: none;
    display: block;
    overflow: hidden;
    border: 1px solid var(--ink);
    background: var(--bg, var(--hair));
    aspect-ratio: 1;
  }
  .sq img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 100%;
  }

  /* ---- the front ---- */
  .front {
    display: grid;
    grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
    gap: var(--gap);
    scroll-margin-top: calc(var(--bar) + 1.5rem);
  }
  .lead {
    min-height: 29rem;
    overflow: hidden;
  }
  .lead .txt {
    gap: 1.1rem;
    max-width: 62%;
    padding: 1.4rem 1.5rem 1.6rem;
  }
  .lead .hl {
    font-size: calc(clamp(2.1rem, 3.5vw, 3.6rem) * var(--hk));
  }
  .lead .dek {
    max-width: 21em;
  }
  /* the picture stands in the card's far corner, melting into its colour */
  .art {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 64%;
    height: auto;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 36%), linear-gradient(to right, transparent, #000 30%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to bottom, transparent, #000 36%), linear-gradient(to right, transparent, #000 30%);
    mask-composite: intersect;
  }
  .seconds {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    min-width: 0;
  }
  .second {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 5.5rem;
    align-items: start;
    gap: 1rem;
    padding: 1.2rem 1.25rem;
  }
  .second .txt {
    gap: 0.8rem;
    height: 100%;
  }
  .second .hl {
    font-size: calc(clamp(1.35rem, 1.75vw, 1.7rem) * var(--hk));
  }
  .second .by {
    margin-top: auto;
  }

  /* ---- the latest ---- */
  .wire {
    padding: 0.95rem 1.25rem 0.5rem;
  }
  .wire header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.8rem;
  }
  .wire h2 {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }
  .wire header a {
    color: var(--mute);
  }
  .wire header a:hover,
  .wire header a:focus-visible {
    color: var(--ink);
    outline: none;
  }
  .wire ol {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .wire li a {
    display: grid;
    grid-template-columns: 4.75rem minmax(0, 1fr);
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.62rem 0;
    border-top: 1px solid var(--hair);
    font-weight: 500;
    line-height: 1.25;
    outline: none;
  }
  .wire time {
    color: var(--mute);
    white-space: nowrap;
  }
  .wire li a:hover span,
  .wire li a:focus-visible span {
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }
  .dk:lang(bn) .wire li a {
    grid-template-columns: 6.5rem minmax(0, 1fr);
  }

  /* ---- a dossier: a tab standing on a tray ---- */
  .dossier {
    scroll-margin-top: calc(var(--bar) + 1.5rem);
  }
  .tabs {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }
  .tab {
    position: relative;
    top: 1px;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    margin: 0;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    border: 1px solid var(--ink);
    border-bottom-color: var(--card);
    background: var(--card);
    font-family: var(--sans);
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.2;
  }
  .tab b {
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.5rem;
    background: var(--ink);
    color: var(--card);
    letter-spacing: 0;
  }
  .more {
    padding-bottom: 0.55rem;
    color: var(--mute);
    white-space: nowrap;
  }
  .more:hover,
  .more:focus-visible {
    color: var(--ink);
    outline: none;
  }
  .tray {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--ink);
    background: var(--card);
  }
  .tray.alone {
    grid-template-columns: minmax(0, 1fr);
  }
  /* its first story: a card in the picture's colour, the words above it */
  .first {
    display: flex;
    flex-direction: column;
    min-height: 25rem;
    overflow: hidden;
  }
  .first .txt {
    gap: 0.85rem;
    padding: 1.1rem 1.2rem;
  }
  .first .hl {
    font-size: calc(clamp(1.6rem, 2.2vw, 2.2rem) * var(--hk));
  }
  .first .dek {
    font-size: 1rem;
  }
  /* its picture under the words, never behind them */
  .first .art {
    position: static;
    order: 2;
    display: block;
    width: 100%;
    margin-top: auto;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 40%);
    mask-image: linear-gradient(to bottom, transparent, #000 40%);
  }
  .alone .first .txt {
    max-width: 55%;
  }
  .alone .first .art {
    position: absolute;
    width: 55%;
  }
  /* the rest: rows, each with its square */
  .rows {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .row {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 4.25rem;
    align-items: center;
    gap: 1.25rem;
    padding: 0.9rem 0;
    border-top: 1px solid var(--hair);
    outline: none;
  }
  .row:first-child {
    border-top: 0;
  }
  .row .txt {
    gap: 0.5rem;
  }
  .row .hl {
    font-size: calc(clamp(1.15rem, 1.4vw, 1.375rem) * var(--hk));
    font-weight: calc(var(--hw) - 60);
    line-height: calc(var(--hlh) + 0.1);
    letter-spacing: calc(var(--hls) / 2);
    font-variation-settings: 'opsz' 30;
  }
  .row:hover .hl,
  .row:focus-visible .hl {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.16em;
  }

  /* ---- the end ---- */
  .end {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem 2rem;
    margin-top: 1.5rem;
    padding: 1.25rem 0 2.5rem;
    border-top: 1px solid var(--ink);
    color: var(--mute);
  }
  .end .name {
    margin-right: auto;
    color: var(--ink);
    text-transform: none;
  }
  .end a:hover,
  .end a:focus-visible {
    color: var(--ink);
    outline: none;
  }

  /* ---- narrower: the rail goes; the tabs still name the dossiers ---- */
  @media (max-width: 1099px) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
    }
    .rail,
    .date {
      display: none;
    }
    .main {
      max-width: none;
      padding-left: var(--pad);
    }
  }

  /* ---- a phone: one column; the formats on a line of their own ---- */
  @media (max-width: 759px) {
    .dk {
      --bar: 5.75rem;
    }
    .bar {
      flex-wrap: wrap;
      align-content: center;
      row-gap: 0.55rem;
    }
    .name {
      margin-right: auto;
      font-size: 1.25rem;
    }
    .seek span,
    .seek kbd {
      display: none;
    }
    .seek {
      padding: 0.55rem 0.6rem;
    }
    .chips {
      order: 3;
      flex: none;
      width: calc(100% + var(--pad));
      margin-right: calc(-1 * var(--pad));
      padding-right: var(--pad);
      box-sizing: border-box;
    }
    .main {
      gap: 1.75rem;
      padding-top: 1rem;
    }
    .front {
      grid-template-columns: minmax(0, 1fr);
    }
    .lead {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .lead .txt {
      max-width: none;
      gap: 0.85rem;
      padding: 1.1rem 1.1rem 0;
    }
    .lead .hl {
      font-size: calc(clamp(1.9rem, 8.6vw, 2.4rem) * var(--hk));
    }
    .lead .art,
    .alone .first .art {
      position: static;
      order: 2;
      display: block;
      width: 100%;
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 40%);
      mask-image: linear-gradient(to bottom, transparent, #000 40%);
    }
    .second {
      grid-template-columns: minmax(0, 1fr) 4.5rem;
      padding: 1rem 1.1rem;
    }
    .wire {
      padding: 0.9rem 1.1rem 0.4rem;
    }
    .wire ol {
      grid-template-columns: minmax(0, 1fr);
    }
    .wire li:nth-child(n + 6) {
      display: none;
    }
    .tray,
    .tray.alone {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.5rem;
      padding: 0.75rem;
    }
    .first {
      min-height: 0;
    }
    .first .txt,
    .alone .first .txt {
      max-width: none;
      padding: 1rem 1rem 0;
    }
    .row {
      grid-template-columns: minmax(0, 1fr) 3.75rem;
      gap: 1rem;
    }
    .row:first-child {
      border-top: 1px solid var(--hair);
    }
    .tab {
      font-size: 1rem;
    }
  }
</style>
