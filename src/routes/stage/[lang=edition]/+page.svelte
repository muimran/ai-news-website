<script>
  /* Stage: a front page built from nothing the rest of the site uses.

     The page is one list of headlines, read down, sized by how much each
     matters; the bigger ones carry their summary. Beside it (above it on a
     phone) one framed picture stays put: the picture of the headline the
     reader has come to rest on. It waits for the scrolling to stop and
     then changes with a slow fade, so nothing flickers while the page
     moves. Resting the mouse on a headline shows its picture instead.

     Quiet on purpose: paper and soft ink, hairlines, open space between
     topics, one picture on screen. The headline voice is a serif at
     regular weight against small spaced labels; a switch in the bar tries
     it in the sans instead.

     It shares only data with the site: the edition's stories, their
     pictures and colours, their addresses. */
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { base } from '$app/paths';
  import { sectionLabel, sectionSlug, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, two, SHORT_DATE, STR } from '$lib/site/reel.js';
  import { storyUrl, gridIndex, gridPage } from '../../grid.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const ed = $derived(data.edition);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const W = {
    en: { front: 'Front page', video: 'Video', about: 'About', other: 'বাংলা', serif: 'Serif', sans: 'Sans' },
    bn: { front: 'প্রথম পাতা', video: 'ভিডিও', about: 'আমাদের কথা', other: 'English', serif: 'সেরিফ', sans: 'স্যান্স' }
  };
  const DAY = {
    en: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD-u-nu-beng', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  };

  /* The list: the front's three, then each topic's. A story's rank is its
     size: 1 the lead, 2 the seconds, 3 a topic's first, 4 the rest. */
  const groups = $derived.by(() => {
    let i = 0;
    const row = (s, rank) => ({ s, rank, i: i++ });
    return [
      { id: 'front', label: W[lang].front, note: DAY[lang].format(new Date(ed.date)), rows: [row(ed.lead, 1), ...ed.seconds.map((s) => row(s, 2))] },
      ...ed.pages.map((p) => ({
        id: sectionSlug(p.key),
        label: sectionLabel(p.key, lang),
        more: { href: gridIndex(lang, p.key), text: L.count(num(p.total)) },
        rows: p.stories.map((s, k) => row(s, k === 0 ? 3 : 4))
      }))
    ];
  });
  const rows = $derived(groups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g }))));

  const mins = (s) => `${num(s.video ? s.duration || s.readTime : s.readTime)} ${L.min}`;
  const kind = (s) => (KINDS.includes(s.kind) ? kindLabel(s.kind, lang) : s.video ? W[lang].video : null);

  /* the headline voice, to try: remembered in this browser */
  let voice = $state('serif');
  function speak(v) {
    voice = v;
    try {
      localStorage.setItem('so-stage-voice', v);
    } catch {
      /* private window: the choice lasts the visit */
    }
  }

  /* Which story has the picture: the one the mouse has come to rest on;
     otherwise the one the reading line is in, once the scrolling stops.
     The line starts on the first headline and reaches the last one as the
     page reaches its end, so every story gets its turn. */
  let rested = $state(0);
  let hovered = $state(null);
  const shown = $derived(rows[hovered ?? rested] ?? rows[0]);
  const pic = $derived(photo(shown.s));
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slow = () => (calm() ? 0 : 480);
  const wait = () => ({ duration: slow(), css: () => '' });

  let list = $state();
  let intent = 0;
  function over(e, i) {
    if (e.pointerType !== 'mouse' || hovered === i) return;
    clearTimeout(intent);
    intent = setTimeout(() => (hovered = i), 140);
  }
  function away() {
    clearTimeout(intent);
    hovered = null;
  }

  onMount(() => {
    try {
      if (localStorage.getItem('so-stage-voice') === 'sans') voice = 'sans';
    } catch {
      /* no storage: the serif */
    }
    const els = [...list.querySelectorAll('[data-i]')];
    const pick = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      const first = els[0].getBoundingClientRect().top + scrollY;
      const last = els.at(-1).getBoundingClientRect().top + scrollY - max;
      const line = first + (last - first) * p + 24;
      let k = 0;
      for (let i = 0; i < els.length; i++) {
        if (els[i].getBoundingClientRect().top <= line) k = i;
        else break;
      }
      return k;
    };
    /* settle: a moment after the last movement, or at the latest a little
       way into a long one */
    let quiet = 0;
    let latest = 0;
    const settle = () => {
      clearTimeout(quiet);
      clearTimeout(latest);
      latest = 0;
      rested = pick();
    };
    const onScroll = () => {
      away();
      clearTimeout(quiet);
      quiet = setTimeout(settle, 120);
      latest ||= setTimeout(settle, 520);
    };
    rested = pick();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      clearTimeout(quiet);
      clearTimeout(latest);
      clearTimeout(intent);
    };
  });

  /* a topic in the bar: glide to it, under the bar */
  function go(e, id) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
  }
</script>

<svelte:head>
  <title>Second Order — {L.tagline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400..700&family=Anek+Latin:wght@400..700&family=Newsreader:opsz,wght@6..72,300..600&family=Noto+Serif+Bengali:wght@400..600&display=swap"
  />
</svelte:head>

<div class="so" class:sans={voice === 'sans'} {lang}>
  <header class="bar">
    <a class="name" href="{base}/stage/{lang}">Second Order</a>
    <nav class="topics" aria-label={L.topics}>
      {#each groups.slice(1) as g (g.id)}
        <a href="#{g.id}" class:here={shown.group.id === g.id} onclick={(e) => go(e, g.id)}>{g.label}</a>
      {/each}
    </nav>
    <div class="tools">
      <span class="voice">
        <button type="button" aria-pressed={voice === 'serif'} onclick={() => speak('serif')}>{W[lang].serif}</button>
        <button type="button" aria-pressed={voice === 'sans'} onclick={() => speak('sans')}>{W[lang].sans}</button>
      </span>
      <a class="lang" href="{base}/stage/{lang === 'en' ? 'bn' : 'en'}" lang={lang === 'en' ? 'bn' : 'en'}>{W[lang].other}</a>
    </div>
  </header>

  <div class="split">
    <!-- the list: every headline, biggest first -->
    <main class="list" bind:this={list} onpointerleave={away}>
      <h1 class="sr">Second Order — {L.tagline}</h1>
      {#each groups as g (g.id)}
        <section id={g.id} class="group" aria-labelledby="h-{g.id}">
          <header class="grp">
            <h2 id="h-{g.id}">{g.label}</h2>
            {#if g.more}<a href={g.more.href}>{g.more.text} →</a>{:else}<span>{g.note}</span>{/if}
          </header>
          {#each g.rows as r (r.s.slug)}
            <a class="row r{r.rank}" class:on={shown.i === r.i} data-i={r.i} href={storyUrl(r.s)} onpointermove={(e) => over(e, r.i)} onfocus={() => (hovered = r.i)}>
              <span class="n">{#if shown.i === r.i}<i class="sq" aria-hidden="true"></i>{:else}{two(r.i + 1, lang)}{/if}</span>
              <span class="body">
                <span class="hl">{r.s.title}</span>
                {#if r.rank < 4 && r.s.dek}<span class="dek">{r.s.dek}</span>{/if}
              </span>
              <span class="m">
                <span class="k">{kind(r.s) ?? ''}</span>
                <span class="t">{#if r.s.video}<i class="tri" aria-hidden="true"></i>{/if}{mins(r.s)}</span>
              </span>
            </a>
          {/each}
        </section>
      {/each}
    </main>

    <!-- the stage: one framed picture, the resting headline's -->
    <a class="stage" href={storyUrl(shown.s)} style:--fg={shown.s.tone?.fg} aria-hidden="true" tabindex="-1">
      <span class="frame">
        {#key shown.i}
          <span class="pic" style:--bg={shown.s.tone?.bg} in:fade={{ duration: slow() }} out:wait>
            {#if pic}<img src={pic.thumb} srcset={pic.srcset} sizes="(max-width: 899px) 100vw, 32vw" alt="" />{/if}
          </span>
        {/key}
      </span>
      <span class="cap">
        <span class="cap1"><span>{sectionLabel(shown.s.section, lang)}</span><span>{two(shown.i + 1, lang)} / {two(rows.length, lang)}</span></span>
        <span class="cap2">{[shown.s.author, SHORT_DATE[lang].format(new Date(shown.s.date))].filter(Boolean).join(' · ')}</span>
      </span>
    </a>
  </div>

  <footer class="end">
    <p class="big">Second Order</p>
    <p class="tag">{L.tagline}</p>
    <nav>
      <a href={gridIndex(lang)}>{L.all} · {num(ed.total)} →</a>
      <a href={gridPage(lang, 'about')}>{W[lang].about} →</a>
    </nav>
  </footer>
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

  /* Paper and a soft ink; the only other colour is the picture's own. Two
     voices: a serif for what's said, a sans for what's about it. */
  .so {
    --paper: #f4f2ed;
    --ink: #1b1a18;
    --mute: color-mix(in srgb, var(--ink) 62%, var(--paper));
    --hair: color-mix(in srgb, var(--ink) 15%, var(--paper));
    --bar: 3.5rem;
    --pad: clamp(1.25rem, 3.2vw, 3.25rem);
    --gap: clamp(1rem, 2vw, 2rem);
    --top: 2.25rem; /* paper between the bar and the page */
    --sans: 'Anek Latin', 'Anek Bangla', system-ui, sans-serif;
    --serif: 'Newsreader', 'Noto Serif Bengali', Georgia, serif;
    --head: var(--serif);
    --hw: 400; /* a headline's weight, */
    --hls: -0.022em; /* its spacing, */
    --hlh: 1.04; /* its leading */
    --hk: 1; /* and its size against the English */
    --small: 0.75rem;
    --track: 0.09em;
    min-height: 100dvh;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 1rem;
    -webkit-font-smoothing: antialiased;
  }
  .so.sans {
    --head: var(--sans);
    --hw: 500;
    --hls: -0.028em;
    --hlh: 1.02;
  }
  /* Bangla has no capitals to space out, stands taller, and reads small
     at the labels' size */
  .so:lang(bn) {
    --sans: 'Anek Bangla', 'Anek Latin', system-ui, sans-serif;
    --serif: 'Noto Serif Bengali', 'Newsreader', Georgia, serif;
    --hls: 0;
    --hlh: 1.36;
    --hk: 0.8;
    --small: 0.875rem;
    --track: 0.01em;
  }
  .so.sans:lang(bn) {
    --hlh: 1.3;
    --hk: 0.9;
  }
  @media (prefers-color-scheme: dark) {
    .so {
      --paper: #131311;
      --ink: #e8e5de;
    }
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  /* the small voice: labels, counts, bylines */
  .topics,
  .tools,
  .grp,
  .n,
  .m,
  .cap,
  .end nav {
    font-size: var(--small);
    font-weight: 500;
    letter-spacing: var(--track);
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
  }

  /* ---- the bar: the name, the topics, the tools ---- */
  .bar {
    position: sticky;
    top: 0;
    z-index: 5;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--gap);
    height: var(--bar);
    padding: 0 var(--pad);
    border-bottom: 1px solid var(--hair);
    background: var(--paper);
  }
  .name {
    font-family: var(--head);
    font-size: 1.375rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
    white-space: nowrap;
  }
  .topics {
    display: flex;
    gap: clamp(0.75rem, 1.6vw, 1.75rem);
    min-width: 0;
    white-space: nowrap;
    color: var(--mute);
  }
  .topics a {
    padding: 0.35rem 0;
    border-bottom: 1px solid transparent;
    transition: color 0.2s;
  }
  .topics a.here,
  .topics a:hover,
  .topics a:focus-visible {
    color: var(--ink);
    border-bottom-color: currentColor;
    outline: none;
  }
  .tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1.25rem;
    white-space: nowrap;
  }
  .voice {
    display: flex;
    gap: 0.75rem;
    color: var(--mute);
  }
  .voice button {
    margin: 0;
    padding: 0.35rem 0;
    border: 0;
    border-bottom: 1px solid transparent;
    background: none;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
  }
  .voice button[aria-pressed='true'],
  .voice button:hover,
  .voice button:focus-visible {
    color: var(--ink);
    border-bottom-color: currentColor;
    outline: none;
  }
  .lang {
    letter-spacing: 0.02em;
  }
  .lang:hover,
  .lang:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.25em;
    outline: none;
  }

  /* ---- the page: twelve columns; the list on seven, one left open, the
     picture on four ---- */
  .split {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--gap);
    align-items: start;
    padding: var(--top) var(--pad) 0;
  }
  .list {
    grid-column: 1 / 8;
    min-width: 0;
  }

  /* a group opens on the page's one full rule, after a pause of paper */
  .group {
    scroll-margin-top: calc(var(--bar) + var(--top));
  }
  .group + .group {
    margin-top: 3.5rem;
  }
  .grp {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 0 0.75rem;
    border-top: 1px solid var(--ink);
    white-space: nowrap;
  }
  .grp h2 {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }
  .grp span,
  .grp a {
    color: var(--mute);
  }
  .grp a:hover,
  .grp a:focus-visible {
    color: var(--ink);
    outline: none;
  }

  /* a story: its number, its headline (and summary, for the bigger ones),
     what kind it is and how long */
  .row {
    display: grid;
    grid-template-columns: 2.75rem minmax(0, 1fr) auto;
    align-items: baseline;
    padding: 0.85rem 0;
    border-top: 1px solid var(--hair);
    outline: none;
  }
  .n {
    color: var(--mute);
  }
  /* the story with the picture: a square of ink where its number was */
  .sq {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    background: var(--ink);
  }
  .body {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .hl {
    font-family: var(--head);
    font-weight: var(--hw);
    line-height: var(--hlh);
    letter-spacing: var(--hls);
    text-wrap: balance;
    text-decoration: underline transparent 1px;
    text-underline-offset: 0.14em;
    transition: text-decoration-color 0.2s;
  }
  .row:hover .hl,
  .row:focus-visible .hl {
    text-decoration-color: currentColor;
  }
  .r1 .hl {
    font-size: calc(clamp(2.6rem, 5vw, 4.9rem) * var(--hk));
  }
  .r2 .hl {
    font-size: calc(clamp(1.85rem, 2.8vw, 2.7rem) * var(--hk));
  }
  .r3 .hl {
    font-size: calc(clamp(1.55rem, 2.15vw, 2.05rem) * var(--hk));
  }
  .r4 .hl {
    font-size: calc(clamp(1.2rem, 1.45vw, 1.4rem) * var(--hk));
    line-height: calc(var(--hlh) + 0.12);
    letter-spacing: calc(var(--hls) / 2);
  }
  .dek {
    max-width: 36em;
    margin-top: 0.7rem;
    color: var(--mute);
    font-size: 1rem;
    line-height: 1.45;
    text-wrap: pretty;
  }
  .dek:lang(bn) {
    line-height: 1.6;
  }
  .r1 {
    padding: 1.5rem 0 1.7rem;
  }
  .r1 .dek {
    margin-top: 1.1rem;
    font-size: 1.125rem;
  }
  .r2 {
    padding: 1.3rem 0 1.4rem;
  }
  .r3 {
    padding: 1.15rem 0 1.25rem;
  }
  /* the lead's headline runs the list's whole width; its facts go under */
  .r1 .body {
    grid-column: 2 / -1;
  }
  .r1 .m {
    grid-column: 2 / -1;
    grid-template-columns: auto auto;
    justify-content: start;
    column-gap: 1.25rem;
    margin-top: 1.1rem;
    padding-left: 0;
  }
  /* what kind and how long, in two columns that hold down the page */
  .m {
    display: grid;
    grid-template-columns: 7.25rem 4rem;
    padding-left: 1rem;
    white-space: nowrap;
  }
  .k {
    color: var(--mute);
  }
  .k:empty {
    display: none;
  }
  .t {
    text-align: right;
  }
  .m:has(.k:empty) .t {
    grid-column: 2;
  }
  .r1 .m:has(.k:empty) .t {
    grid-column: 1;
  }
  .tri {
    display: inline-block;
    width: 0;
    height: 0;
    margin-right: 0.45em;
    border: 0.36em solid transparent;
    border-right: 0;
    border-left: 0.6em solid currentColor;
  }

  /* ---- the stage: a frame on the picture's colour, the picture standing
     at its foot; under it, whose it is ---- */
  .stage {
    grid-column: 9 / 13;
    position: sticky;
    top: calc(var(--bar) + var(--top));
    display: block;
  }
  .frame {
    position: relative;
    display: block;
    aspect-ratio: 5 / 6;
    max-height: calc(100dvh - var(--bar) - var(--top) - 6.5rem);
    overflow: hidden;
    background: var(--hair);
  }
  .pic {
    position: absolute;
    inset: 0;
    background: var(--bg, var(--hair));
  }
  .pic img {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    /* the picture's top melts into its colour */
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 38%);
    mask-image: linear-gradient(to bottom, transparent, #000 38%);
  }
  .cap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 0.85rem;
  }
  .cap1 {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  .cap2 {
    color: var(--mute);
  }

  /* ---- the end ---- */
  .end {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--gap);
    align-items: end;
    margin: 5rem var(--pad) 0;
    padding: 1.75rem 0 3rem;
    border-top: 1px solid var(--ink);
  }
  .big {
    grid-column: 1 / 8;
    margin: 0;
    font-family: var(--head);
    font-size: clamp(2.4rem, 5vw, 4.9rem);
    font-weight: var(--hw);
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .tag {
    grid-column: 1 / 8;
    max-width: 30em;
    margin: 0.9rem 0 0;
    color: var(--mute);
    line-height: 1.4;
  }
  .end nav {
    grid-column: 9 / 13;
    grid-row: 1 / 3;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .end nav a:hover,
  .end nav a:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.25em;
    outline: none;
  }

  /* the topics leave the bar when there isn't room for all six */
  @media (max-width: 1279px) {
    .bar {
      grid-template-columns: 1fr auto;
    }
    .topics {
      display: none;
    }
  }

  /* ---- a phone: the picture on top, held there; the list passes under ---- */
  @media (max-width: 899px) {
    .so {
      --bar: 3rem;
      --top: 0px;
    }
    .split {
      display: flex;
      flex-direction: column;
      padding: 0;
    }
    .stage {
      order: -1;
      z-index: 3;
      top: var(--bar);
      align-self: stretch;
      color: var(--fg, var(--ink));
      border-bottom: 1px solid var(--hair);
    }
    .frame {
      aspect-ratio: auto;
      height: clamp(10.5rem, 27dvh, 16rem);
      max-height: none;
    }
    .pic img {
      height: 100%;
      object-fit: cover;
      object-position: 50% 100%;
    }
    /* whose picture it is, on the picture */
    .cap {
      position: absolute;
      inset: 0.7rem var(--pad) auto;
      margin: 0;
    }
    .cap2 {
      display: none;
    }
    .list {
      padding: 0 var(--pad);
    }
    .group:first-of-type .grp {
      border-top: 0;
    }
    .group + .group {
      margin-top: 2.5rem;
    }
    .voice {
      display: none;
    }
    .name {
      font-size: 1.25rem;
    }
    /* a row: the headline, its summary, then its line of facts */
    .row,
    .r1,
    .r2,
    .r3 {
      grid-template-columns: minmax(0, 1fr);
      padding: 0.95rem 0 0.9rem;
    }
    .n {
      display: none;
    }
    .r1 .body,
    .r1 .m {
      grid-column: 1;
    }
    .m,
    .r1 .m {
      display: flex;
      gap: 1rem;
      margin-top: 0.6rem;
      padding-left: 0;
    }
    .r1 .hl {
      font-size: calc(clamp(2.1rem, 10vw, 2.7rem) * var(--hk));
    }
    .r2 .hl {
      font-size: calc(1.75rem * var(--hk));
    }
    .r3 .hl {
      font-size: calc(1.5rem * var(--hk));
    }
    .r4 .hl {
      font-size: calc(1.2rem * var(--hk));
    }
    .dek,
    .r1 .dek {
      margin-top: 0.55rem;
      font-size: 1rem;
    }
    .r3 .dek {
      display: none;
    }
    .end {
      display: block;
      margin-top: 3.5rem;
      padding-bottom: 2.5rem;
    }
    .end nav {
      margin-top: 1.75rem;
    }
  }
</style>
