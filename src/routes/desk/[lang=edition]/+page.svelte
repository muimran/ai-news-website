<script>
  /* Desk's front page (the look, the bar and the menu are the layout's).

     - Each topic is a dossier: a tray of paper with its number and name in
       a notch cut into its top-left corner, the page's grey showing through
       (a step-cut index, like a ledger's); nothing stands above the box. The rail down the left is the
       drawer's index; it marks the dossier on screen.
     - A dossier's first story is a card in its picture's own colour, the
       object standing in it, and its notch takes a pale wash of the same;
       the rest are rows with a small 4:3 picture of the same.
     Nothing moves unless the reader asks: a card lifts under the mouse. */
  import { onMount } from 'svelte';
  import { sectionLabel, sectionSlug, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, two, SHORT_DATE, STR } from '$lib/site/reel.js';
  import { ytId } from '$lib/youtube.js';
  import { deskTopic, deskAll, deskStory, deskFormat } from '../urls.js';
  import { formatName } from '../formats.js';
  import Screen from '../Screen.svelte';

  let { data } = $props();
  const lang = $derived(data.lang);
  const ed = $derived(data.edition);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const W = {
    en: { front: 'Front page', latest: 'Latest', topics: 'Topics', formats: 'Formats', video: 'Video', play: 'Play', feed: 'On our feed', story: 'Story' },
    bn: { front: 'প্রথম পাতা', latest: 'সর্বশেষ', topics: 'বিষয়', formats: 'ধরন', video: 'ভিডিও', play: 'চালান', feed: 'আমাদের ফিডে', story: 'প্রতিবেদন' }
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

  /* the rail marks the section the reader is in */
  let here = $state('front');
  /* trial: the feed box's colour, picked from four swatches in its corner */
  const TONES = [
    ['indigo', 'Pale indigo'],
    ['orange', 'Pale orange'],
    ['purple', 'Light purple'],
    ['black', 'Near-black']
  ];
  let feedTone = $state('indigo');

  /* Chart of the week. SAMPLE DATA: a placeholder until an editor sets the
     week's chart; the page says so beside it. Three lines, one per division,
     each named at its end; the fastest climber in the site's orange. */
  const CHART = {
    en: {
      title: 'Data centres are pulling more power outside Dhaka',
      dek: 'Electricity drawn by data centres on the national grid, by division, megawatts',
      unit: 'MW',
      note: 'Sample data, for layout only.',
      since: (y) => `Chattogram since ${y}`,
      event: 'Gazipur cluster opens',
      names: { dhaka: 'Dhaka', ctg: 'Chattogram', khulna: 'Khulna' }
    },
    bn: {
      title: 'ঢাকার বাইরে ডেটা সেন্টারের বিদ্যুৎ টান বাড়ছে',
      dek: 'জাতীয় গ্রিডে ডেটা সেন্টারের বিদ্যুৎ ব্যবহার, বিভাগ অনুযায়ী, মেগাওয়াট',
      unit: 'মেগাওয়াট',
      note: 'নমুনা তথ্য, শুধু নকশার জন্য।',
      since: (y) => `${y} থেকে চট্টগ্রামে`,
      event: 'গাজীপুর ক্লাস্টার চালু',
      names: { dhaka: 'ঢাকা', ctg: 'চট্টগ্রাম', khulna: 'খুলনা' }
    }
  };
  const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const SERIES = [
    { key: 'dhaka', colour: '#5a52c4', v: [12, 14, 19, 26, 33, 41, 50, 58] },
    { key: 'ctg', colour: '#c25418', v: [4, 5, 7, 10, 16, 26, 39, 56] },
    { key: 'khulna', colour: '#3b8f5a', v: [2, 3, 4, 5, 8, 12, 17, 24] }
  ];
  const EVENT_AT = 4; // 2023
  // between the last two topics, so it never trails after the final box;
  // if the feed already sits there, one gap higher
  const chartAt = $derived.by(() => {
    const k = Math.max(0, dossiers.length - 2);
    return k === ed.feed?.after ? k - 1 : k;
  });
  const chartMax = 60;
  let chartHover = $state(null);
  let chartW = $state(560);
  const year = (y) => num(y).replace(/[,،]/g, '');
  const chartTimes = Math.round(SERIES[1].v.at(-1) / SERIES[1].v[0]);
  // the plot's frame: room at the left for the scale, at the right for names
  const CH = 260;
  const PAD = { l: 34, r: 92, t: 14, b: 26 };
  const cx = (k) => PAD.l + (k / (YEARS.length - 1)) * (chartW - PAD.l - PAD.r);
  const cy = (v) => PAD.t + (1 - v / chartMax) * (CH - PAD.t - PAD.b);
  const path = (v) => v.map((n, k) => `${k ? 'L' : 'M'}${cx(k).toFixed(1)},${cy(n).toFixed(1)}`).join('');
  // end names, nudged apart so they never sit on each other
  const ends = $derived.by(() => {
    const e = SERIES.map((s) => ({ ...s, y: cy(s.v.at(-1)) })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < e.length; k++) if (e[k].y - e[k - 1].y < 16) e[k].y = e[k - 1].y + 16;
    return e;
  });
  function chartMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const step = (chartW - PAD.l - PAD.r) / (YEARS.length - 1);
    const k = Math.round((x - PAD.l) / step);
    chartHover = k >= 0 && k < YEARS.length ? k : null;
  }
  let main = $state();
  /* It is the section under a line 30% down the screen, the same either way
     the reader scrolls; above the first dossier (the latest included) it is
     the front, and in the small gap between two dossiers the mark holds. */
  onMount(() => {
    const secs = [...main.querySelectorAll('[data-sec]')];
    let queued = false;
    const mark = () => {
      queued = false;
      const line = innerHeight * 0.3;
      const on = secs.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= line && r.bottom > line;
      });
      if (on) here = on.id;
      else if (secs[1] && secs[1].getBoundingClientRect().top > line) here = 'front';
    };
    const ask = () => {
      if (!queued) (queued = true), requestAnimationFrame(mark);
    };
    mark();
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    return () => {
      removeEventListener('scroll', ask);
      removeEventListener('resize', ask);
    };
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
                <Screen id={yt} title={s.title} label="{W[lang].play} · {mins(s)}" />
                <span class="txt">
                  {@render tag(s, true)}
                  <a class="hl" href={deskStory(s)}>{s.title}</a>
                </span>
              </div>
            {:else}
            {@const sp = photo(s)}
            <!-- a story: its picture across the top, as the video's screen is -->
            <a class="card second pic" href={deskStory(s)}>
              <span class="shot" style:--bg={s.tone?.bg}>{#if sp}<img src={sp.thumb} srcset={sp.srcset} sizes="(max-width: 759px) 100vw, 30vw" alt="" />{/if}</span>
              <span class="txt">
                {@render tag(s, true)}
                <span class="hl">{s.title}</span>
                {@render by(s)}
              </span>
            </a>
            {/if}
          {/each}
        </div>
      </section>

      <!-- the latest, by day. Purple marks the present: its tab is the one
           "now" on the page (later it may hold a new interview or video). -->
      <section class="now" aria-labelledby="wire-h">
        <div class="card wire">
          <header class="tabs">
            <h2 class="tab" id="wire-h">{W[lang].latest}{#if ed.inside[0]}<time class="when">{day(ed.inside[0])}</time>{/if}</h2>
            <a class="more" href={deskAll(lang)}>{EVERY[lang](num(ed.total))}&nbsp;→</a>
          </header>
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
      {#each dossiers as d, i (d.id)}
        {@const p = photo(d.lead)}
        <section id={d.id} class="dossier" class:here={here === d.id} data-sec aria-labelledby="t-{d.id}">
          <div class="tray" class:alone={!d.rest.length}>
            <header class="tabs">
              <h2 class="tab" id="t-{d.id}" style:--wash={d.lead.tone?.bg}><b>{d.n}</b>{d.label}</h2>
              <a class="more" href={d.href}>{L.count(num(d.total))}&nbsp;→</a>
            </header>
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
        {#if i === chartAt}
          {@const C = CHART[lang]}
          <section class="chart" aria-labelledby="chart-h">
            <div class="chart-t">
              <p class="chart-k">{lang === 'bn' ? 'এই সপ্তাহের চার্ট' : 'Chart of the week'}</p>
              <h2 id="chart-h">{C.title}</h2>
              <p class="chart-d">{C.dek}</p>
              <p class="chart-big"><b>{num(chartTimes)}×</b><span>{C.since(year(YEARS[0]))}</span></p>
              <p class="chart-n">{C.note}</p>
            </div>
            <figure class="chart-f">
              <p class="chart-key">
                {#each SERIES as s (s.key)}<span><i style:background={s.colour}></i>{C.names[s.key]}</span>{/each}
                <span class="u">{C.unit}</span>
              </p>
              <div class="lines" bind:clientWidth={chartW}>
                <svg width={chartW} height={CH} role="img" aria-label="{C.title}. {SERIES.map((s) => `${C.names[s.key]}: ${s.v.map((n, k) => `${year(YEARS[k])} ${num(n)}`).join(', ')}`).join('. ')} {C.unit}" onpointermove={chartMove} onpointerleave={() => (chartHover = null)}>
                  {#each [0, 20, 40, 60] as g (g)}
                    <line class="g" class:base={g === 0} x1={PAD.l} x2={chartW - PAD.r} y1={cy(g)} y2={cy(g)} />
                    <text class="gl" x={PAD.l - 8} y={cy(g)} dy="0.32em" text-anchor="end">{num(g)}</text>
                  {/each}
                  {#each YEARS as y, k (y)}
                    {#if k % 2 === 1 || k === YEARS.length - 1 || chartW > 480}
                      <text class="yl" class:on={chartHover === k} x={cx(k)} y={CH - 6} text-anchor="middle">{year(y)}</text>
                    {/if}
                  {/each}
                  <!-- the week's marked moment -->
                  <line class="ev" x1={cx(EVENT_AT)} x2={cx(EVENT_AT)} y1={PAD.t} y2={CH - PAD.b} />
                  <text class="evl" x={cx(EVENT_AT) - 6} y={cy(52)} text-anchor="end">{C.event}</text>
                  {#if chartHover !== null}
                    <line class="xh" x1={cx(chartHover)} x2={cx(chartHover)} y1={PAD.t} y2={CH - PAD.b} />
                  {/if}
                  {#each SERIES as s (s.key)}
                    <path class="ln" class:hi={s.key === 'ctg'} d={path(s.v)} stroke={s.colour} />
                    <circle class="end" cx={cx(YEARS.length - 1)} cy={cy(s.v.at(-1))} r="4" fill={s.colour} />
                    {#if chartHover !== null}
                      <circle class="pt" cx={cx(chartHover)} cy={cy(s.v[chartHover])} r="4.5" fill={s.colour} />
                    {/if}
                  {/each}
                  {#each ends as s (s.key)}
                    <text class="nm" x={chartW - PAD.r + 10} y={s.y} dy="0.32em"><tspan class="v">{num(s.v.at(-1))}</tspan> {C.names[s.key]}</text>
                  {/each}
                </svg>
                {#if chartHover !== null}
                  <div class="tip" style:left="{cx(chartHover)}px" class:flip={cx(chartHover) > chartW / 2}>
                    <b>{year(YEARS[chartHover])}</b>
                    {#each SERIES as s (s.key)}
                      <span><i style:background={s.colour}></i>{C.names[s.key]}<em>{num(s.v[chartHover])}</em></span>
                    {/each}
                  </div>
                {/if}
              </div>
            </figure>
          </section>
        {/if}
        {#if ed.feed && ed.feed.after === i}
          <!-- halfway down, a breath between the boxes: our feed's newest
               posts, each the way to its story -->
          <section class="feed tone-{feedTone}" aria-labelledby="feed-h">
            <header class="feed-h">
              <h2 id="feed-h">{W[lang].feed}</h2>
              <p>Instagram · Facebook · LinkedIn</p>
              <span class="tones" role="group" aria-label="Box colour (trial)">
                {#each TONES as [key, name] (key)}
                  <button type="button" class="tone-{key}" class:on={feedTone === key} aria-pressed={feedTone === key} title={name} aria-label={name} onclick={() => (feedTone = key)}></button>
                {/each}
              </span>
            </header>
            <ol>
              {#each ed.feed.posts as s, k (s.slug)}
                {@const p = photo(s)}
                <li>
                  <a class="post" class:dark={k % 2 === 1} href={deskStory(s)} style:--bg={s.tone?.bg} style:--fg={s.tone?.fg}>
                    {#if k % 2 === 0 && p}<img src={p.thumb} alt="" loading="lazy" />{/if}
                    <span class="post-txt">
                      <span class="post-tag">{kind(s) ?? W[lang].story}</span>
                      <span class="post-hl">{s.title}</span>
                    </span>
                    <span class="post-mark">Second Order</span>
                  </a>
                </li>
              {/each}
            </ol>
          </section>
        {/if}
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
    gap: 3.5rem;
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
  /* a small picture of a story, on its colour: always 4:3, the same shape
     as in every list, so a row of them reads as one set */
  .sq {
    flex: none;
    display: block;
    overflow: hidden;
    border: 1px solid var(--ink);
    background: var(--bg, var(--hair));
    aspect-ratio: 4 / 3;
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
    grid-template-columns: minmax(0, 1fr) 6.5rem;
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
  /* a story card: its picture across the top on its own colour, as big as
     the video's screen, the headline under it */
  /* the words keep their room, the byline its padding; the picture takes
     what height is left (at least 8rem) */
  .second.pic {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(8rem, 1fr) auto;
    gap: 0.9rem;
    padding: 0;
  }
  .shot {
    display: block;
    min-height: 0;
    overflow: hidden;
    border-bottom: 1px solid var(--ink);
    background: var(--bg, var(--hair));
  }
  .shot img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 65%;
  }
  .pic .txt {
    height: auto;
    padding: 0 1.25rem 1.2rem;
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
  .vid a.hl:hover,
  .vid a.hl:focus-visible {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    outline: none;
  }

  /* ---- the latest ---- */
  /* the same box as a dossier's tray: the same edge, padding and room under
     its notch, so the two read as one family down the page */
  .wire {
    /* how far its corner is from its words: padding and edge (the notch reaches out to it) */
    --edge-t: calc(1rem + 1px);
    --edge-x: calc(1rem + 1px);
    padding: 1rem 1rem 0.5rem;
  }
  .wire .tabs {
    margin-bottom: 0.75rem;
  }
  /* the one "now" on the page: its notch filled purple, its date light on it */
  .now .tab {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }
  .now .when {
    white-space: nowrap;
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    color: inherit;
    opacity: 0.8;
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
  /* no rule straight under the notch: the first row of each column opens clean */
  .wire li:nth-child(-n + 2) a {
    border-top: 0;
  }
  .wire li time {
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

  /* ---- chart of the week: on the open page, between two rules; its
     point at the left, the chart at the right, on the trays' 5:6 grid ---- */
  .chart {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 1.5rem 2.5rem;
    padding: 1.5rem 0;
    border-top: 1px solid var(--ink);
    border-bottom: 1px solid var(--ink);
  }
  .chart-t {
    display: flex;
    flex-direction: column;
    padding-right: 1rem;
  }
  .chart-k,
  .chart-n,
  .chart-u {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    font-style: normal;
  }
  .chart-k {
    margin: 0 0 0.75rem;
    color: var(--accent);
  }
  .chart h2 {
    margin: 0;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }
  .chart-d {
    margin: 0.6rem 0 0;
    color: var(--mute);
    line-height: 1.4;
  }
  /* the one number to take away */
  .chart-big {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin: auto 0 0;
    padding-top: 1.5rem;
  }
  .chart-big b {
    font-size: clamp(3.5rem, 6vw, 5rem);
    font-weight: 600;
    line-height: 0.9;
    letter-spacing: -0.03em;
    color: #e07a3f;
  }
  .chart-big span {
    max-width: 8rem;
    color: var(--mute);
    line-height: 1.25;
  }
  .chart-n {
    margin: 0.9rem 0 0;
    color: var(--mute);
  }
  .chart-f {
    margin: 0;
    min-width: 0;
  }
  .chart-key {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem 1rem;
    margin: 0 0 0.6rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .chart-key span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .chart-key i {
    width: 0.9rem;
    height: 3px;
    border-radius: 2px;
  }
  .chart-key .u {
    margin-left: auto;
    font-family: var(--mono);
    font-size: var(--ms);
    letter-spacing: var(--mt);
    text-transform: uppercase;
    color: var(--mute);
  }
  .lines {
    position: relative;
    width: 100%;
  }
  .lines svg {
    display: block;
    overflow: visible;
    touch-action: pan-y;
  }
  .lines .g {
    stroke: var(--hair);
    stroke-width: 1;
  }
  .lines .g.base {
    stroke: var(--ink);
  }
  .lines text {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    fill: var(--mute);
  }
  .lines .yl.on {
    fill: var(--ink);
  }
  .lines .ev {
    stroke: var(--ink);
    stroke-width: 1;
    stroke-dasharray: 2 3;
  }
  .lines .evl {
    fill: var(--ink);
    text-transform: uppercase;
  }
  .lines .xh {
    stroke: var(--ink);
    stroke-width: 1;
    opacity: 0.35;
  }
  .lines .ln {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .lines .ln.hi {
    stroke-width: 3;
  }
  .lines .pt {
    stroke: var(--ground);
    stroke-width: 2;
  }
  .lines .nm {
    font-family: var(--sans);
    font-size: 13px;
    letter-spacing: 0;
    fill: var(--ink);
  }
  .lines .nm .v {
    font-weight: 700;
  }
  /* the year under the pointer: all three values */
  .tip {
    position: absolute;
    top: 0;
    z-index: 2;
    display: grid;
    gap: 0.2rem;
    min-width: 9.5rem;
    margin-left: 0.75rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--ink);
    background: var(--card);
    font-size: 0.8125rem;
    pointer-events: none;
  }
  .tip.flip {
    transform: translateX(calc(-100% - 1.5rem));
  }
  .tip b {
    font-family: var(--mono);
    font-weight: 500;
    letter-spacing: var(--mt);
  }
  .tip span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .tip i {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
  }
  .tip em {
    margin-left: auto;
    padding-left: 0.75rem;
    font-style: normal;
    font-weight: 600;
  }

  /* ---- the feed: posts on one topic, as square-ish tiles in a row ---- */
  /* the feed sits in a box of its own, a shade darker than the page, so
     its posts read as one set apart from the topics */
  .feed {
    --fp: 1rem;
    padding: var(--fp);
    background: color-mix(in srgb, var(--ink) 7%, var(--ground));
  }
  /* trial colours */
  .feed.tone-indigo { background: color-mix(in srgb, #5f5e9c 12%, var(--ground)); }
  .feed.tone-orange { background: color-mix(in srgb, #e07a3f 12%, var(--ground)); }
  .feed.tone-purple { background: color-mix(in srgb, var(--accent) 9%, var(--ground)); }
  .feed.tone-black { background: #161615; color: #fff; }
  .feed.tone-black .feed-h p { color: rgba(255, 255, 255, 0.6); }
  .feed.tone-black .post.dark { border-color: rgba(255, 255, 255, 0.35); }
  .tones {
    display: flex;
    gap: 0.35rem;
    margin-left: 0.75rem;
  }
  .tones button {
    width: 0.9rem;
    height: 0.9rem;
    padding: 0;
    border: 1px solid var(--ink);
    cursor: pointer;
  }
  .tones button.on {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .tones .tone-indigo { background: #5f5e9c; }
  .tones .tone-orange { background: #e07a3f; }
  .tones .tone-purple { background: var(--accent); }
  .tones .tone-black { background: #161615; }
  .feed.tone-black .tones button { border-color: rgba(255, 255, 255, 0.6); }
  .feed-h {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  .feed-h h2,
  .feed-h p {
    margin: 0;
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  .feed-h p {
    margin-left: auto;
    color: var(--mute);
  }
  .feed ol {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* a post, 4:5 as the feed crops it: a picture on its colour with the
     words on a band of paper; every other one dark, words alone */
  .post {
    position: relative;
    display: flex;
    flex-direction: column;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border: 1px solid var(--ink);
    background: var(--bg, var(--card));
    color: var(--ink);
  }
  .post img {
    flex: 1;
    min-height: 0;
    width: 100%;
    object-fit: contain;
    object-position: center bottom;
  }
  .post-txt {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.75rem 0.85rem 2rem;
    background: var(--card);
  }
  .post-tag,
  .post-mark {
    font-family: var(--mono);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  .post-hl {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
    font-weight: 600;
    font-size: 1.05rem;
    line-height: 1.2;
  }
  .post-mark {
    position: absolute;
    left: 0.85rem;
    bottom: 0.7rem;
    color: var(--mute);
  }
  .post.dark {
    justify-content: flex-start;
    background: #161615;
    color: #fff;
  }
  .post.dark .post-txt {
    flex: 1;
    gap: 0.75rem;
    padding: 0.85rem;
    background: none;
  }
  /* its label on a block of the story's colour */
  .post.dark .post-tag {
    align-self: flex-start;
    padding: 0.2rem 0.4rem;
    background: var(--bg, var(--accent));
    color: var(--fg, #fff);
  }
  .post.dark .post-hl {
    -webkit-line-clamp: 6;
    font-size: 1.35rem;
    line-height: 1.15;
  }
  .post.dark .post-mark {
    color: rgba(255, 255, 255, 0.6);
  }
  .post:hover .post-hl,
  .post:focus-visible .post-hl {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.12em;
  }
  .post:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* ---- a dossier: a tray, its name in a notch cut into its corner ---- */
  .dossier {
    scroll-margin-top: calc(var(--bar) + 1.5rem);
  }
  /* A box's first row: the notch at the left, the way to all its stories at
     the right. It reaches out over the box's padding and edge to the corner,
     so the notch takes the corner away and the page's grey shows through;
     its words start where the box's words do. */
  .tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: calc(-1 * var(--edge-t)) 0 0 calc(-1 * var(--edge-x));
  }
  .tab {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    margin: 0;
    padding: 0.55rem 1rem 0.55rem var(--edge-x);
    border-right: 1px solid var(--ink);
    border-bottom: 1px solid var(--ink);
    background: var(--ground);
    font-family: var(--sans);
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.2;
  }
  /* A dossier's notch takes a deep shade of its first story's colour, so the
     name and the card under it read as one; the words turn light, and its
     number box flips to light with ink. With no colour it is deep ink. */
  .dossier .tab {
    background: color-mix(in srgb, var(--wash, var(--ink)) 45%, #111);
    color: #fff;
  }
  .dossier .tab b {
    background: #fff;
    color: #111;
  }
  /* the dossier being read: its number turns purple, as the rail's does */
  .dossier.here .tab b {
    background: var(--accent);
    color: #fff;
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
    color: var(--mute);
    white-space: nowrap;
  }
  .more:hover,
  .more:focus-visible {
    color: var(--ink);
    outline: none;
  }
  .tray {
    --tp: 1rem; /* its padding */
    --tg: 1.5rem; /* the gap between what's in it */
    --edge-t: var(--tp);
    --edge-x: var(--tp);
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: var(--tg);
    padding: var(--tp);
    background: var(--card);
  }
  /* the notch's row across the whole tray, the stories 0.75rem under it */
  .tray > .tabs {
    grid-column: 1 / -1;
    margin-bottom: calc(0.75rem - var(--tg));
  }
  /* Two columns: the notch is as wide as the cover card under it, a header
     on it with no empty paper beside it; the way to all its stories sits
     over the list. */
  @media (min-width: 760px) {
    .tray:not(.alone) > .tabs {
      display: grid;
      grid-template-columns: subgrid;
      column-gap: var(--tg);
      margin-left: 0;
    }
    .tray:not(.alone) > .tabs .tab {
      margin-left: calc(-1 * var(--edge-x));
      width: calc(100% + var(--edge-x));
      box-sizing: border-box;
    }
    .tray:not(.alone) > .tabs .more {
      justify-self: end;
    }
  }
  .tray.alone {
    grid-template-columns: minmax(0, 1fr);
  }
  /* its first story: a card in the picture's colour, the words above it */
  /* The cover card hangs straight from its notch and runs to the tray's
     edge, so notch and card read as one folder and its tab: no strip of
     paper between them, no second edge beside the tray's. It stays put
     under the mouse (it is part of the tray); its headline underlines. */
  .first {
    display: flex;
    flex-direction: column;
    min-height: 25rem;
    overflow: hidden;
    margin: -0.75rem 0 calc(-1 * var(--tp)) calc(-1 * var(--tp));
    border-width: 0 1px 0 0;
  }
  .tray > .tabs .tab {
    border-bottom: 0;
  }
  .alone .first {
    margin-right: calc(-1 * var(--tp));
    border-width: 0;
  }
  a.card.first:hover,
  a.card.first:focus-visible {
    transform: none;
    box-shadow: none;
  }
  a.first:hover .hl,
  a.first:focus-visible .hl {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.12em;
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
    grid-template-columns: minmax(0, 1fr) 8rem;
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
      gap: 2.5rem;
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
      grid-template-columns: minmax(0, 1fr) 6rem;
      padding: 1rem 1.1rem;
    }
    .second.vid,
    .second.pic {
      grid-template-columns: minmax(0, 1fr);
      padding: 0;
    }
    /* stacked, the card has no set height: the picture keeps its shape */
    .second.pic {
      grid-template-rows: auto auto;
    }
    .shot {
      aspect-ratio: 16 / 9;
    }
    .vid .txt,
    .pic .txt {
      padding: 0 1.1rem 1rem;
    }
    .wire {
      --edge-t: calc(0.75rem + 1px);
      --edge-x: calc(0.75rem + 1px);
      padding: 0.75rem 0.75rem 0.4rem;
    }
    .wire ol {
      grid-template-columns: minmax(0, 1fr);
    }
    .chart {
      grid-template-columns: minmax(0, 1fr);
    }
    .chart-t {
      padding-right: 0;
    }
    .chart-big {
      padding-top: 1rem;
    }
    /* the feed: a row the thumb swipes, a post and a bit of the next */
    .feed ol {
      grid-template-columns: none;
      grid-auto-flow: column;
      grid-auto-columns: 68%;
      gap: 0.75rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      margin-right: calc(-1 * var(--fp));
      padding-right: var(--fp);
    }
    .feed {
      --fp: 0.75rem;
    }
    .feed li {
      scroll-snap-align: start;
    }
    .feed-h p {
      display: none;
    }
    .wire li:nth-child(2) a {
      border-top: 1px solid var(--hair);
    }
    .wire li:nth-child(n + 6) {
      display: none;
    }
    .tray,
    .tray.alone {
      --tp: 0.75rem;
      --tg: 0.5rem;
      grid-template-columns: minmax(0, 1fr);
    }
    .first {
      min-height: 0;
      margin: -0.75rem calc(-1 * var(--tp)) 0;
      border-width: 0 0 1px;
    }
    .first .txt,
    .alone .first .txt {
      max-width: none;
      padding: 1rem 1rem 0;
    }
    .row {
      grid-template-columns: minmax(0, 1fr) 6rem;
      gap: 1rem;
    }
    .tab {
      font-size: 1rem;
    }
    /* the notch and the way to all its stories share one row: the way may
       take two lines, at the right, rather than leave the box */
    .more {
      min-width: 0;
      white-space: normal;
      text-align: right;
    }
  }
</style>
