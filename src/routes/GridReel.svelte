<script>
  /* The reel as a row of ruled cells between the header row and the topics
     row, inside the table's frame. The two rows stay put; the cells slide
     sideways between them, like a ledger under a ruler. Each card is paper
     with its photo set in, so neighbours are parted by paper and one rule. */
  import { onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { sectionLabel, kindLabel, formatLabel, formatNumber, FORMATS, KINDS } from '$lib/labels.js';
  import { photo, two, range, lastRead, SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from './Mark.svelte';
  import BottomRow from './BottomRow.svelte';
  import { ui } from './ui.svelte.js';
  import { gridIndex, gridFormat, storyUrl } from './grid.js';

  /* `section` or `format`: one topic's reel or one format's; neither is
     repeated on its own cards */
  let { lang, reel, section = null, format = null, opens = false } = $props();
  const L = $derived(STR[lang]);
  /* A topic's or format's reel keeps one shape: its lead full height, the
     rest two to a column, and the way to all its stories always in the last
     column's lower half. So it shows an even number of stories: of an odd
     number, the oldest waits in the full list. With nothing but the lead,
     the way in takes a column of its own. The front reel is one story to a
     column and keeps its doorway at the end. */
  const shaped = $derived.by(() => {
    if (!section && !format) return { items: reel.items, doorIn: false };
    const [lead, ...rest] = reel.items;
    const halves = rest.flatMap((i) => (i.type === 'pair' ? [i.a, i.b].filter(Boolean) : [i]));
    if (!halves.length) return { items: [lead], doorIn: false };
    const keep = halves.length % 2 ? halves : halves.slice(0, -1);
    const pairs = [];
    for (let k = 0; k < keep.length; k += 2) {
      pairs.push({ type: 'pair', key: keep[k].key, a: keep[k], b: keep[k + 1] ?? null });
    }
    return { items: [lead, ...pairs], doorIn: true };
  });
  const items = $derived(shaped.items);
  const doorIn = $derived(shaped.doorIn);
  const allHref = $derived(format ? `${gridFormat(format, lang)}/all` : gridIndex(lang, section));
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
  let stops = [];
  /* where a phone's reel stands: there the page doesn't scroll (so the
     browser's bars stay put); the finger moves the reel itself */
  let pos = 0;

  function measure() {
    mobile = matchMedia('(max-width: 759px)').matches;
    /* how many whole cards the window holds: those whose photos come
       nearest their natural 5:7 at the reel's height */
    const media = track.querySelector(':scope > .card .media');
    const spine = track.querySelector('.spine');
    if (mobile || !media || !spine) win.style.removeProperty('--per');
    else {
      const natural = (media.offsetHeight * 5) / 7 + spine.offsetWidth;
      win.style.setProperty('--per', Math.max(1, Math.round((win.clientWidth - spine.offsetWidth) / natural)));
    }
    over = Math.max(1, track.scrollWidth - win.clientWidth);
    wrap.style.height = mobile ? '' : `${over + innerHeight}px`;
    frames = [...track.querySelectorAll('[data-n]')].map((el) => ({ n: +el.dataset.n, left: el.offsetLeft }));
    /* each column's start, and the reel's end */
    stops = [...new Set([...[...track.children].map((el) => el.offsetLeft).filter((x) => x < over), over])];
    pos = stops.reduce((b, s) => (Math.abs(s - pos) < Math.abs(b - pos) ? s : b), 0);
    update();
    fitIssue();
  }

  /* On a computer the page's vertical scroll drives the cells sideways,
     one pixel for one pixel; on a phone the finger does. */
  function update() {
    const x = mobile ? pos : Math.min(scrollY, over);
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    const probe = x + innerWidth * 0.3;
    let cur = frames[0];
    for (const f of frames) if (f.left <= probe) cur = f;
    active = cur?.n ?? 1;
  }

  /* Measure again whenever the reel's length can change: other stories
     (moving from one topic to another reuses this reel, so without this it
     kept the last topic's length and scrolled on past its own end), or
     the pane folding and opening. */
  $effect(() => {
    void items;
    void ui.folded;
    pos = 0;
    if (track) tick().then(measure);
  });

  /* On a computer the reel moves three ways, all through the page's
     scroll: scrolling, a sideways trackpad swipe, and dragging it with the
     mouse. A drag isn't a click, so letting go doesn't open a story. */
  function wheel(e) {
    if (mobile || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    scrollBy(0, e.deltaX);
  }
  /* On a phone a swipe any way moves the reel, up or left for the next
     card, down or right for the one before: it follows the finger, then
     settles a whole card on (or back, for a short swipe). */
  let drag = null;
  let dragged = false;
  const travel = (e) => {
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.cy;
    return Math.abs(dx) > Math.abs(dy) ? dx : dy;
  };
  function press(e) {
    if (e.button !== 0 || (e.pointerType === 'mouse') === mobile) return;
    drag = { x: e.clientX, cy: e.clientY, y: scrollY, from: pos, touch: mobile, d: 0 };
    dragged = false;
    if (mobile) track.style.transition = 'none';
  }
  function move(e) {
    if (!drag) return;
    const d = drag.touch ? travel(e) : e.clientX - drag.x;
    if (Math.abs(d) > 5 && !dragged) {
      dragged = true;
      win.classList.add('dragging');
    }
    if (!dragged) return;
    drag.d = d;
    if (drag.touch) {
      pos = Math.min(over, Math.max(0, drag.from - d));
      update();
    } else scrollTo(0, drag.y - d);
  }
  function release() {
    if (drag?.touch && dragged) {
      const i = stops.indexOf(drag.from);
      const step = drag.d < -30 ? 1 : drag.d > 30 ? -1 : 0;
      pos = stops[Math.min(stops.length - 1, Math.max(0, (i < 0 ? 0 : i) + step))];
      track.style.transition = 'transform 0.35s cubic-bezier(0.3, 0.7, 0.1, 1)';
      update();
    }
    drag = null;
    win?.classList.remove('dragging');
  }
  function swallow(e) {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    }
  }

  onMount(() => {
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', measure);
    addEventListener('wheel', wheel, { passive: false });
    addEventListener('pointermove', move);
    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);
    win.addEventListener('pointerdown', press);
    win.addEventListener('click', swallow, true);
    measure();
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', measure);
      removeEventListener('wheel', wheel);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', release);
      removeEventListener('pointercancel', release);
    };
  });
</script>

{#snippet door()}
  <a class="door fill" href={allHref} draggable="false">
    <span class="kick">{L.count(num(reel.total))}</span>
    <span class="big">{L.all} →</span>
    <span class="kick">{range(reel.from, reel.to, lang)}</span>
  </a>
{/snippet}

{#snippet card(it, half)}
  {@const s = it.story}
  {@const pic = photo(s)}
  <a class="card" class:half class:bare={!pic} class:toned={pic} style:--card={s.tone?.bg} style:--on={s.tone?.fg} href={storyUrl(s)} data-n={it.n} draggable="false" onclick={() => (hero = s.slug)}>
    <span class="lab">
      <b class="n">{two(it.n, lang)}</b>
      {#if !section}<span class="sec">{sectionLabel(s.section, lang)}</span>{/if}
      {#if KINDS.includes(s.kind) && s.kind !== format}<span class="kind">{kindLabel(s.kind, lang)}</span>{/if}
    </span>
    <span class="body">
    <!-- date and length up a spine beside the photo, read from its foot -->
    <span class="spine"><span>{SHORT_DATE[lang].format(new Date(s.date))} · {num(s.readTime)} {L.min}</span></span>
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
    </span>
  </a>
{/snippet}

<div class="wrap" bind:this={wrap}>
  <main class="stage">
    <h1 class="sr">{section ? sectionLabel(section, lang) : format ? formatLabel(format, lang) : `Second Order — ${L.tagline}`}</h1>
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
            {#if item.b}{@render card(item.b, true)}{:else if doorIn}{@render door()}{/if}
          </div>
        {:else}
          {@render card(item, false)}
        {/if}
      {/each}
      {#if !doorIn}{@render door()}{/if}
    </div>
    </div>

    <BottomRow {lang} {section} />
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
  /* the reel's page is a fixed table, not a sheet: it doesn't pull past
     its ends (no bounce, no pull-to-refresh) */
  :global(html:has(.g .wrap)),
  :global(body:has(.g .wrap)) {
    overscroll-behavior-y: none;
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
  /* the frame's sides; the header row and topics row close it above and below.
     Whole cards and the next card's date strip fill it exactly, so it ends
     on a strip, never on a cut photo: as many cards as keep each photo
     nearest its natural 5:7 (counted in measure), one on a phone. */
  .window {
    container-type: inline-size;
    --per: 2;
    --fw: calc((100cqw - var(--spine)) / var(--per));
    position: absolute;
    top: calc(var(--mv) + var(--top));
    left: calc(var(--m) + var(--side));
    right: var(--m);
    height: var(--reel);
    overflow: hidden;
    border-right: var(--frame) solid var(--rule);
  }
  /* the reel can be dragged: say so, and don't select text while it moves */
  @media (min-width: 760px) {
    .window {
      cursor: grab;
      user-select: none;
    }
    :global(.window.dragging),
    :global(.window.dragging *) {
      cursor: grabbing !important;
    }
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
    padding: 0 var(--in) 0 0;
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
  /* the number stands over the date strip, flush with the date on its
     photo side, so a card cut down to its strip at the window's edge still
     shows it whole; the topic starts where the headline does */
  .n {
    flex: none;
    width: var(--spine);
    margin-right: calc(var(--in) - 0.6rem);
    padding-right: calc(var(--u) / 2);
    box-sizing: border-box;
    text-align: right;
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
  /* the format sits at the row's far end and glows: its letters lit in
     lilac light, a soft halo round them, as the lilac lights up on the ink
     bar when the card is pointed at */
  .kind {
    flex: none;
    margin-left: auto;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--i);
    text-shadow:
      0 0 0.3em var(--i2),
      0 0 0.9em var(--i2);
  }
  .card:hover .kind,
  .card:focus-visible .kind {
    color: var(--i2);
  }
  .body {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  /* a strip one label row thick, a hairline from the photo */
  /* the date reads up the strip's photo side, a few px off its own photo,
     so it plainly belongs to that card and not the one before */
  .spine {
    flex: none;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    width: var(--spine);
    padding: 0 calc(var(--u) / 2) var(--in) 0;
    box-sizing: border-box;
    border-right: 1px solid var(--hair);
  }
  .spine span {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font: 400 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--mute);
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
  /* The words stand at the top of the card, dark or white (--on), on the
     picture's dominant colour (--card, read at build time): solid behind
     the words, then fading into the picture over a long tail below them, so
     the wash goes as deep as the words need and no further. No dark shade
     over any picture. */
  .toned .cap {
    top: 0;
    bottom: auto;
    z-index: 1;
    padding: calc(var(--in) + var(--u)) var(--in) calc(3 * var(--u));
    background: var(--card, var(--i3));
    color: var(--on, #26282f);
  }
  .toned .cap::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: calc(16 * var(--u));
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      var(--card),
      color-mix(in srgb, var(--card) 82%, transparent) 25%,
      color-mix(in srgb, var(--card) 52%, transparent) 50%,
      color-mix(in srgb, var(--card) 22%, transparent) 75%,
      transparent
    );
  }
  .half.toned .cap::after {
    height: calc(10 * var(--u));
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
  .half.toned .cap {
    padding-top: calc(var(--in) + var(--u));
  }
  /* the way to all of them, in the last column's lower half */
  .pair .door {
    flex: 1;
    min-height: 0;
    width: auto;
    border-right: 0;
    border-top: var(--line) solid var(--rule);
  }
  /* set to the right, so it isn't clipped while the column is only peeking in */
  .pair .door .big {
    align-self: flex-end;
    text-align: right;
    font-size: clamp(1.6rem, 0.8rem + 1.8vw, 2.8rem);
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

  /* ---- phone: one card at a time; scrolling down swipes the reel ---- */
  @media (max-width: 759px) {
    /* the page itself doesn't scroll, so the browser's bars stay put */
    :global(html:has(.g .wrap)),
    :global(body:has(.g .wrap)) {
      overflow: hidden;
    }
    .stage {
      height: 100dvh;
    }
    /* every swipe on the reel is the reel's */
    .window {
      --per: 1;
      touch-action: none;
    }
    .card,
    .pair,
    .issue,
    .door {
      width: var(--fw);
    }
    .track > :last-child {
      border-right: var(--line) solid var(--rule);
    }
    .pair .card {
      width: auto;
    }
  }
</style>
