<script>
  /* Desk's front page (the look, the bar and the menu are the layout's).

     - Each topic is a dossier: a tray of paper with a file tab standing on
       its top edge (its number, its name). The rail down the left is the
       drawer's index; it marks the dossier on screen.
     - A dossier's first story is a card in its picture's own colour, the
       object standing in it; the rest are rows with a small square of the
       same.
     Nothing moves unless the reader asks: a card lifts under the mouse. */
  import { onMount } from 'svelte';
  import { sectionLabel, sectionSlug, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, two, SHORT_DATE, STR } from '$lib/site/reel.js';
  import { deskTopic, deskAll, deskStory, deskFormat } from '../urls.js';
  import { formatName } from '../formats.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const ed = $derived(data.edition);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const W = {
    en: { front: 'Front page', latest: 'Latest', topics: 'Topics', formats: 'Formats', video: 'Video', play: 'Play' },
    bn: { front: 'প্রথম পাতা', latest: 'সর্বশেষ', topics: 'বিষয়', formats: 'ধরন', video: 'ভিডিও', play: 'চালান' }
  };
  /* the way from the newest few to all of them */
  const EVERY = { en: (n) => `See all ${n} stories, by date`, bn: (n) => `সব ${n}টি প্রতিবেদন, তারিখ অনুযায়ী` };

  /* the dossiers: a topic's first story, and up to four more */
  const dossiers = $derived(
    ed.pages.map((p, i) => ({
      id: sectionSlug(p.key),
      n: two(i + 1, lang),
      label: sectionLabel(p.key, lang),
      total: p.total,
      href: deskTopic(p.key, lang),
      lead: p.stories[0],
      rest: p.stories.slice(1, 5)
    }))
  );
  const mins = (s) => `${num(s.video ? s.duration || s.readTime : s.readTime)} ${L.min}`;
  const kind = (s) => (KINDS.includes(s.kind) ? kindLabel(s.kind, lang) : s.video ? W[lang].video : null);
  const day = (s) => SHORT_DATE[lang].format(new Date(s.date));

  /* a YouTube video: its id from any of its addresses. It's only a still
     and a play button until the reader asks; then the player loads (from
     youtube-nocookie, so nothing of YouTube's runs before that). */
  const ytId = (url) => url?.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/)?.[1] ?? null;
  let playing = $state(null);

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

<div class="shell">
    <!-- the drawer's index -->
    <nav class="rail" aria-label={W[lang].topics}>
      <p class="rl">{W[lang].topics}</p>
      <a href="#front" class:here={here === 'front'} onclick={(e) => go(e, 'front')}><b>{two(0, lang)}</b><span>{W[lang].front}</span></a>
      {#each dossiers as d (d.id)}
        <a href="#{d.id}" class:here={here === d.id} onclick={(e) => go(e, d.id)}><b>{d.n}</b><span>{d.label}</span><i>{num(d.total)}</i></a>
      {/each}
      <!-- the other way in: the kinds of story, across the topics -->
      {#if data.formats?.length}
        <p class="rl kinds">{W[lang].formats}</p>
        {#each data.formats as f (f.key)}
          <a href={deskFormat(f.key, lang)}><span class="pad" aria-hidden="true"></span><span>{formatName(f.key, lang)}</span><i>{num(f.count)}</i></a>
        {/each}
      {/if}
      <p class="motto">{L.tagline}</p>
    </nav>

    <main class="main" bind:this={main}>
      <h1 class="sr">Second Order — {L.tagline}</h1>

      <!-- the front: the lead in its picture's colour, two seconds beside it -->
      <section id="front" class="front" data-sec aria-label={W[lang].front}>
        {#if ed.lead}
          {@const p = photo(ed.lead)}
          <a class="card lead" href={deskStory(ed.lead)} style:--bg={ed.lead.tone?.bg} style:--fg={ed.lead.tone?.fg}>
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
            {@const yt = ytId(s.watch)}
            {#if yt}
              <!-- a video: it plays here; the headline is the way to its page -->
              <div class="card second vid">
                <div class="screen">
                  {#if playing === s.slug}
                    <iframe src="https://www.youtube-nocookie.com/embed/{yt}?autoplay=1&rel=0" title={s.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
                  {:else}
                    <button type="button" class="play" onclick={() => (playing = s.slug)} aria-label="{W[lang].play}: {s.title}">
                      <img src="https://i.ytimg.com/vi/{yt}/hqdefault.jpg" alt="" loading="lazy" />
                      <span class="btn" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" /></svg>{W[lang].play} · {mins(s)}</span>
                    </button>
                  {/if}
                </div>
                <span class="txt">
                  {@render tag(s, true)}
                  <a class="hl" href={deskStory(s)}>{s.title}</a>
                </span>
              </div>
            {:else}
            <a class="card second" href={deskStory(s)}>
              <span class="txt">
                {@render tag(s, true)}
                <span class="hl">{s.title}</span>
                {@render by(s)}
              </span>
              {@render square(s)}
            </a>
            {/if}
          {/each}
        </div>
      </section>

      <!-- the latest, by day. Purple marks the present: its tab is the one
           "now" on the page (later it may hold a new interview or video). -->
      <section class="now" aria-labelledby="wire-h">
        <header class="tabs">
          <h2 class="tab" id="wire-h">{W[lang].latest}{#if ed.inside[0]}<time class="when">{day(ed.inside[0])}</time>{/if}</h2>
          <a class="more" href={deskAll(lang)}>{EVERY[lang](num(ed.total))} →</a>
        </header>
        <div class="card wire">
          <ol>
            {#each ed.inside.slice(0, 8) as s (s.slug)}
              <li>
                <a href={deskStory(s)}><time>{day(s)}</time><span>{s.title}</span></a>
              </li>
            {/each}
          </ol>
        </div>
      </section>

      <!-- a dossier to a topic -->
      {#each dossiers as d (d.id)}
        {@const p = photo(d.lead)}
        <section id={d.id} class="dossier" class:here={here === d.id} data-sec aria-labelledby="t-{d.id}">
          <header class="tabs">
            <h2 class="tab" id="t-{d.id}"><b>{d.n}</b>{d.label}</h2>
            <a class="more" href={d.href}>{L.count(num(d.total))} →</a>
          </header>
          <div class="tray" class:alone={!d.rest.length}>
            <a class="card first" href={deskStory(d.lead)} style:--bg={d.lead.tone?.bg} style:--fg={d.lead.tone?.fg}>
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
                  <a class="row" href={deskStory(s)}>
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

    </main>
</div>

<style>
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
  /* the mono voice */
  .rl,
  .rail b,
  .rail i,
  .tag,
  .by,
  .wire header,
  .wire time,
  .tab b,
  .more {
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

  /* ---- the rail beside the page ---- */
  .shell {
    display: grid;
    grid-template-columns: var(--side) minmax(0, 1fr);
    align-items: start;
  }
  .rail {
    position: sticky;
    top: var(--bar);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100dvh - var(--bar));
    /* a short screen: the index scrolls rather than being cut off */
    overflow-y: auto;
    scrollbar-width: none;
    padding: 1.5rem 0 1.5rem var(--pad);
  }
  .rl {
    margin: 0 0 0.6rem;
    color: var(--mute);
  }
  /* the formats sit under the topics, their names on the same line */
  .kinds {
    margin-top: 1.4rem;
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
      box-shadow 0.16s ease-out;
  }
  @media (hover: hover) {
    a.card:hover,
    a.card:focus-visible {
      transform: translate(-3px, -3px);
      box-shadow: 4px 4px 0 var(--ink);
    }
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
  /* a video card: the screen across the top, the headline under it */
  .vid {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.9rem;
    padding: 0;
  }
  .vid .txt {
    padding: 0 1.25rem 1.2rem;
  }
  .screen {
    position: relative;
    aspect-ratio: 16 / 9;
    border-bottom: 1px solid var(--ink);
    background: var(--ink);
  }
  .screen iframe,
  .play,
  .play img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .play {
    padding: 0;
    background: none;
    cursor: pointer;
  }
  .play img {
    object-fit: cover;
    filter: grayscale(1) contrast(1.05);
  }
  /* the play button: in the middle of the still, where a reader looks for
     it; paper with one ink rule, the bar's own kind of box, so it shows on
     any picture */
  .play .btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    height: 2.5rem;
    padding: 0 0.95rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .play .btn svg {
    width: 0.85rem;
    height: 0.85rem;
    fill: currentColor;
  }
  @media (hover: hover) {
    .play:hover .btn {
      box-shadow: 4px 4px 0 var(--ink);
    }
  }
  .play:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .vid a.hl:hover,
  .vid a.hl:focus-visible {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    outline: none;
  }

  /* ---- the latest ---- */
  .wire {
    padding: 0.5rem 1.25rem 0.5rem;
  }
  /* the one "now" on the page: a purple tab standing on a purple edge */
  .now .tab {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
    padding-left: 1rem;
  }
  .now .when {
    white-space: nowrap;
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    opacity: 0.75;
  }
  .now .wire {
    border-top: 3px solid var(--accent);
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
  :global(.dk:lang(bn)) .wire li a {
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
  /* the dossier being read: a purple edge along its tab, as the rail marks it */
  .dossier.here .tab {
    box-shadow: inset 0 3px 0 var(--accent);
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

  /* ---- narrower: the rail goes; the tabs still name the dossiers ---- */
  @media (max-width: 1099px) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
    }
    .rail {
      display: none;
    }
    .main {
      max-width: none;
      padding-left: var(--pad);
    }
  }

  /* ---- a phone: one column ---- */
  @media (max-width: 759px) {
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
    .second.vid {
      grid-template-columns: minmax(0, 1fr);
      padding: 0;
    }
    .vid .txt {
      padding: 0 1.1rem 1rem;
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
