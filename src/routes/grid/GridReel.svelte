<script>
  /* The reel as a row of ruled cells between the header row and the topics
     row, inside the table's frame. The two rows stay put; the cells slide
     sideways between them, like a ledger under a ruler. Each card is paper
     with its photo set in, so neighbours are parted by paper and one rule. */
  import { onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { sectionLabel, kindLabel, formatNumber, FORMATS } from '$lib/labels.js';
  import { photo, two, range, lastRead, SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from './Mark.svelte';
  import BottomRow from './BottomRow.svelte';
  import { gridIndex, storyUrl } from './grid.js';

  let { lang, reel, section = null, opens = false } = $props();
  const L = $derived(STR[lang]);
  const items = $derived(reel.items);
  const stories = $derived(items.flatMap((i) => (i.type === 'pair' ? [i.a, i.b].filter(Boolean) : [i])));
  const issue = $derived(reel.latest ?? []);
  /* This week shows as many headlines as fit the card at their own height,
     no more and no stretching: the rest are hidden, and the dates above
     cover the ones shown. */
  let fit = $state(8);
  const shown = $derived(issue.slice(0, Math.max(1, fit)));
  let list = $state();
  async function fitIssue() {
    if (!list) return;
    fit = issue.length;
    await tick();
    const bottom = list.getBoundingClientRect().bottom + 0.5;
    fit = [...list.children].filter((li) => li.getBoundingClientRect().bottom <= bottom).length;
  }
  const num = (n) => formatNumber(n, lang);

  let wrap = $state();
  /* the card whose photo morphs into the story (or back out of it) */
  let hero = $state(lastRead());
  let win = $state();
  let track = $state();
  let mobile = $state(false);
  let over = 1;
  let active = $state(1);
  let frames = [];

  function measure() {
    mobile = matchMedia('(max-width: 759px)').matches;
    if (mobile) {
      wrap.style.height = '';
      track.style.transform = '';
    } else {
      over = Math.max(1, track.scrollWidth - win.clientWidth);
      wrap.style.height = `${over + innerHeight}px`;
    }
    frames = [...track.querySelectorAll('[data-n]')].map((el) => ({ n: +el.dataset.n, left: el.offsetLeft }));
    update();
    fitIssue();
  }

  /* Vertical scroll drives the cells sideways, one pixel for one pixel;
     on a phone the track is swiped instead. */
  function update() {
    const x = mobile ? track.scrollLeft : Math.min(scrollY, over);
    if (!mobile) track.style.transform = `translate3d(${-x}px, 0, 0)`;
    const probe = x + innerWidth * 0.3;
    let cur = frames[0];
    for (const f of frames) if (f.left <= probe) cur = f;
    active = cur?.n ?? 1;
  }

  /* Measure again when the stories change: moving from one topic to
     another reuses this reel, which otherwise kept the last one's length. */
  $effect(() => {
    void items;
    if (track) tick().then(measure);
  });

  onMount(() => {
    const onScroll = () => !mobile && update();
    const onTrack = () => mobile && update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    track.addEventListener('scroll', onTrack, { passive: true });
    measure();
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
    };
  });
</script>

{#snippet card(it, half)}
  {@const s = it.story}
  {@const pic = photo(s)}
  <a class="card" class:half class:bare={!pic} href={storyUrl(s)} data-n={it.n} draggable="false" onclick={() => (hero = s.slug)}>
    <span class="lab">
      <b class="n">{two(it.n, lang)}</b>
      {#if !section}<span class="sec">{sectionLabel(s.section, lang)}</span>{/if}
      {#if FORMATS[s.kind]}<span class="kind">{kindLabel(s.kind, lang)}</span>{/if}
      <span class="when">{SHORT_DATE[lang].format(new Date(s.date))} · {num(s.readTime)} {L.min}</span>
    </span>
    <span class="media" style:view-transition-name={hero === s.slug ? 'hero' : null}>
      {#if pic}
        <img src={pic.src} srcset={pic.srcset} sizes="(max-width: 759px) 86vw, 40vw" alt="" loading={it.n <= 4 ? 'eager' : 'lazy'} draggable="false" />
      {:else}
        <span class="bare-mark"><Mark key={s.section} size={48} /></span>
      {/if}
      <span class="cap">
        <span class="title">{s.title}</span>
        {#if s.dek && !half}<span class="dek">{s.dek}</span>{/if}
        {#if s.author}<span class="by">{s.author}</span>{/if}
      </span>
    </span>
  </a>
{/snippet}

<div class="wrap" bind:this={wrap}>
  <main class="stage">
    <h1 class="sr">{section ? sectionLabel(section, lang) : `Ground Truth — ${L.tagline}`}</h1>
    <div class="window" bind:this={win}>
    <div class="track" bind:this={track}>
      {#if opens && issue.length}
        <!-- This week: the one filled cell in the reel, pale orange, with
             who we are below in pale indigo -->
        <section class="issue" data-n="0">
          <div class="sheet">
          <div class="issue-head">
            <p class="kick">{range(new Date(shown.at(-1).date), new Date(shown[0].date), lang)}</p>
            <h2>{L.thisWeek}</h2>
          </div>
          <ol bind:this={list}>
            {#each issue as s, i (s.slug)}
              <li class:gone={i >= fit}>
                <a href={storyUrl(s)} draggable="false">
                  <span class="d">{SHORT_DATE[lang].format(new Date(s.date))}</span>
                  <span class="h">{s.title}</span>
                </a>
              </li>
            {/each}
          </ol>
          <p class="motto">{L.blurb}</p>
          </div>
        </section>
      {/if}
      {#each items as item (item.key)}
        {#if item.type === 'pair'}
          <div class="pair">
            {@render card(item.a, true)}
            {#if item.b}{@render card(item.b, true)}{:else}<span class="card half empty"></span>{/if}
          </div>
        {:else}
          {@render card(item, false)}
        {/if}
      {/each}
      <a class="door fill" href={gridIndex(lang, section)} draggable="false">
        <span class="kick">{L.count(num(reel.total))}</span>
        <span class="big">{L.all} →</span>
        <span class="kick">{range(reel.from, reel.to, lang)}</span>
      </a>
    </div>
    </div>

    <BottomRow {lang} {section} n={active} total={stories.length} />
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
  @media (min-width: 760px) {
    :global(html:has(.g .wrap)),
    :global(body:has(.g .wrap)) {
      overscroll-behavior-y: none;
    }
  }
  .wrap {
    position: relative;
  }
  .stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
  /* the frame's sides; the header row and topics row close it above and below */
  .window {
    position: absolute;
    top: calc(var(--mv) + var(--top));
    left: var(--m);
    right: var(--m);
    height: var(--reel);
    overflow: hidden;
    border-left: var(--frame) solid var(--rule);
    border-right: var(--frame) solid var(--rule);
  }
  .track {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    height: 100%;
    width: max-content;
    will-change: transform;
  }
  .track > * {
    box-sizing: border-box;
  }
  /* the frame closes the last cell */
  .track > :last-child {
    border-right: 0;
  }

  /* ---- a card: a label row over the photo, the headline on the photo ---- */
  .card {
    container-type: inline-size;
    position: relative;
    flex: none;
    display: flex;
    flex-direction: column;
    width: var(--fw);
    padding: 0 var(--pad) var(--pad);
    border-right: var(--line) solid var(--rule);
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .lab {
    position: relative;
    isolation: isolate;
    flex: none;
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    height: var(--label);
    padding: 0 var(--in);
    box-sizing: border-box;
    line-height: var(--label);
    white-space: nowrap;
    transition: color 0.2s 0.1s;
  }
  /* the label row is the card's handle: on hover it fills from below */
  .lab::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--ink);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.35s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  .card:hover .lab::before,
  .card:focus-visible .lab::before {
    transform: scaleY(1);
  }
  .card:hover .lab,
  .card:focus-visible .lab,
  .card:hover .lab .n,
  .card:focus-visible .lab .n {
    color: var(--paper);
  }
  .n {
    flex: none;
    font-size: 1rem;
    font-weight: 640;
    font-stretch: 75%;
    color: var(--o-text);
  }
  .sec {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: calc(0.875rem * var(--k));
    font-weight: 540;
  }
  .kind {
    flex: none;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--i);
  }
  .card:hover .kind,
  .card:focus-visible .kind {
    color: var(--i2);
  }
  .when {
    flex: none;
    margin-left: auto;
    font: 400 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .card:hover .when,
  .card:focus-visible .when {
    color: inherit;
  }
  .media {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--i3);
  }
  .media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  .card:hover .media img {
    transform: scale(1.03);
  }
  .bare-mark {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
  }
  .cap {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: calc(5 * var(--u)) var(--in) var(--in);
    background: linear-gradient(to top, rgb(0 0 0 / 0.78), rgb(0 0 0 / 0.45) 55%, transparent);
    color: #fff;
  }
  .bare .cap {
    background: none;
    color: var(--ink);
  }
  .title {
    font-size: clamp(1.5rem, 6.4cqi, 2.6rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .title:lang(bn),
  :global(.g:lang(bn)) .title {
    line-height: 1.3;
  }
  .dek {
    max-width: 34em;
    font-size: 0.875rem;
    line-height: 1.45;
    opacity: 0.88;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .by {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* On a topic's reel the rest go two to a column, one above the other,
     split by a rule. */
  .pair {
    flex: none;
    display: flex;
    flex-direction: column;
    width: var(--fw);
    border-right: var(--line) solid var(--rule);
  }
  .pair .card {
    flex: 1;
    min-height: 0;
    width: auto;
    border-right: 0;
  }
  .pair .card + .card {
    border-top: var(--line) solid var(--rule);
  }
  .half .title {
    font-size: clamp(1.2rem, 5cqi, 1.9rem);
  }
  .half .cap {
    padding-top: calc(4 * var(--u));
  }
  .empty {
    pointer-events: none;
  }

  /* ---- this week ---- */
  .issue {
    flex: none;
    display: flex;
    width: var(--fw);
    border-right: var(--line) solid var(--rule);
  }
  /* the week fills its cell, pale orange to the lines */
  .sheet {
    container-type: size;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--o3);
  }
  .issue-head {
    padding: var(--in) var(--in) var(--in);
    border-bottom: var(--line) solid var(--rule);
  }
  .kick {
    margin: 0;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .issue h2 {
    margin: 0.6rem 0 0;
    font-size: clamp(2.2rem, 12cqi, 4.5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.01em;
  }
  .issue h2:lang(bn),
  :global(.g:lang(bn)) .issue h2 {
    line-height: 1.2;
  }
  .issue ol {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .issue li {
    border-bottom: 1px solid var(--hair);
  }
  .issue li.gone {
    display: none;
  }
  .issue li a {
    display: grid;
    grid-template-columns: 4.2rem minmax(0, 1fr);
    align-items: baseline;
    gap: 0.5rem;
    padding: var(--u) var(--in);
    color: var(--ink);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 580;
    font-stretch: 85%;
    line-height: 1.15;
    outline: none;
  }
  .issue li a:hover .h,
  .issue li a:focus-visible .h {
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  .d {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.04em;
    color: var(--o-text);
  }
  .motto {
    margin: 0;
    padding: var(--in) var(--in) var(--u);
    border-top: var(--line) solid var(--rule);
    background: var(--i3);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* ---- the doorway to everything ---- */
  .door {
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: calc(var(--fw) * 0.7);
    box-sizing: border-box;
    padding: var(--in);
    border-right: var(--line) solid var(--rule);
    color: var(--ink);
    text-decoration: none;
  }
  .big {
    font-size: clamp(2rem, 1rem + 2.6vw, 4rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.01em;
  }

  /* ---- phone: a swiped track of full-width cells ---- */
  @media (max-width: 759px) {
    .wrap {
      height: auto;
    }
    .stage {
      position: relative;
      height: 100svh;
    }
    .track {
      right: 0;
      width: auto;
      height: 100%;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      will-change: auto;
    }
    .track::-webkit-scrollbar {
      display: none;
    }
    .card,
    .pair,
    .issue,
    .door {
      width: 80vw;
      scroll-snap-align: start;
    }
    .track > :last-child {
      border-right: var(--line) solid var(--rule);
    }
    .pair .card {
      width: auto;
    }
  }
</style>
