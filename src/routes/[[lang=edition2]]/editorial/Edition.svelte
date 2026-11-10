<script>
  /* The editorial trial: the reel as the pages of a paper. The same table,
     header row above and topics row below, and the same sideways move, but
     each step is a composed page rather than one more card: the front page
     ranks the day (a lead and two seconds; it stops short of the screen's
     edge, so the next page's ink column shows beside it), then a page for
     each topic, its name in an ink column
     and its stories at different sizes, then the way to all of them.

     The sizes carry the judgement: a lead on its picture's colour across
     most of the page, seconds smaller, the rest as words alone. The deks
     are in the reading face; an Analysis sets its headline in it too, as
     papers set opinion. A phone gets the same pages one under another. */
  import { onMount } from 'svelte';
  import { sectionLabel, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, two, range, SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from '../../Mark.svelte';
  import BottomRow from '../../BottomRow.svelte';
  import { whole } from '../../sentences.js';
  import { gridIndex, storyUrl } from '../../grid.js';

  let { lang, ed } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const W = {
    en: { front: 'Front page' },
    bn: { front: 'প্রথম পাতা' }
  };
  /* the edition's date as a paper prints it under its name */
  const EDITION = {
    en: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD-u-nu-beng', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  };

  /* A topic's page: its name in an ink column, then its stories, the lead
     biggest. Pages take turns between a tall lead (a column of its own)
     and a wide one (across the top), so no two pages in a row look alike.
     Fewer stories, fewer cells, each filling its share. */
  const AREAS = ['a', 'b', 'c', 'd', 'e'];
  function shape(count, wide) {
    if (wide && count >= 3) {
      const cols = 'minmax(0, 2.4fr) repeat(3, minmax(0, 3.4fr))';
      const rows = 'minmax(0, 1.25fr) minmax(0, 1fr)';
      if (count >= 5) return { cols, rows, areas: '"h a a b" "h c d e"', wide: true };
      if (count === 4) return { cols, rows, areas: '"h a a b" "h c d d"', wide: true };
      return { cols, rows, areas: '"h a a b" "h a a c"', wide: true };
    }
    const rows = 'minmax(0, 1fr) minmax(0, 1fr)';
    if (count >= 5) return { cols: 'minmax(0, 2.4fr) minmax(0, 4.4fr) repeat(2, minmax(0, 3fr))', rows, areas: '"h a b c" "h a d e"' };
    if (count === 4) return { cols: 'minmax(0, 2.4fr) minmax(0, 4.4fr) repeat(2, minmax(0, 3fr))', rows, areas: '"h a b c" "h a d c"' };
    if (count === 3) return { cols: 'minmax(0, 2.4fr) repeat(2, minmax(0, 4.4fr))', rows, areas: '"h a b" "h a c"' };
    if (count === 2) return { cols: 'minmax(0, 2.4fr) minmax(0, 5fr) minmax(0, 4fr)', rows, areas: '"h a b" "h a b"' };
    return { cols: 'minmax(0, 2.4fr) minmax(0, 9fr)', rows, areas: '"h a" "h a"' };
  }
  /* a story's part on its page: the lead, then one with its picture, then
     words alone */
  const roleOf = (i) => (i === 0 ? 'lead' : i === 1 ? 'pic' : 'word');

  /* On a computer the page's vertical scroll drives the pages sideways,
     one pixel for one pixel, as on the reel; a phone scrolls down them. */
  let wrap = $state();
  let win = $state();
  let track = $state();
  let mobile = $state(false);
  let over = 0;
  let active = $state(1);
  let frames = [];

  function measure() {
    mobile = matchMedia('(max-width: 759px)').matches;
    over = mobile ? 0 : Math.max(0, track.scrollWidth - win.clientWidth);
    wrap.style.height = mobile ? '' : `${over + innerHeight}px`;
    frames = [...track.querySelectorAll('[data-n]')].map((el) => ({ n: +el.dataset.n, left: el.offsetLeft }));
    update();
  }
  function update() {
    if (mobile) {
      track.style.transform = '';
      return;
    }
    const x = Math.min(scrollY, over);
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    const probe = x + win.clientWidth * 0.5;
    let cur = frames[0];
    for (const f of frames) if (f.left <= probe) cur = f;
    active = cur?.n ?? 1;
  }

  /* a sideways trackpad swipe moves the pages too, and so does dragging
     them with the mouse; a drag isn't a click */
  function wheel(e) {
    if (mobile || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    scrollBy(0, e.deltaX);
  }
  let drag = null;
  let dragged = false;
  function press(e) {
    if (mobile || e.button !== 0 || e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, y: scrollY };
    dragged = false;
  }
  function move(e) {
    if (!drag) return;
    const d = e.clientX - drag.x;
    if (Math.abs(d) > 5 && !dragged) {
      dragged = true;
      win.classList.add('dragging');
    }
    if (dragged) scrollTo(0, drag.y - d);
  }
  function release() {
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
    // the window changes width when the Latest pane opens or folds
    const watch = new ResizeObserver(() => measure());
    watch.observe(win);
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
      watch.disconnect();
      removeEventListener('scroll', update);
      removeEventListener('resize', measure);
      removeEventListener('wheel', wheel);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', release);
      removeEventListener('pointercancel', release);
    };
  });
</script>

<svelte:head>
  <title>Second Order — {L.tagline}</title>
</svelte:head>

{#snippet story(s, role, area, opts = {})}
  {@const pic = role === 'word' ? null : photo(s)}
  <a
    class="st {role}"
    class:toned={pic}
    class:wide={opts.wide && pic}
    class:fill={!pic}
    class:onfront={opts.front}
    style:grid-area={area}
    style:--card={pic ? s.tone?.bg : null}
    style:--on={pic ? s.tone?.fg : null}
    href={storyUrl(s)}
    draggable="false"
  >
    <span class="top">
      <!-- always there, empty or not, so the headlines in a row start level -->
      <span class="kick">
        {#if opts.front}<Mark key={s.section} size={14} /><span class="sl">{sectionLabel(s.section, lang)}</span>{/if}
        {#if KINDS.includes(s.kind)}<span class="kind">{kindLabel(s.kind, lang)}</span>{/if}
      </span>
      <span class="hl" class:serif={s.kind === 'Analysis'}>{s.title}</span>
    </span>
    <span class="more">
      {#if s.dek}<span class="dek" use:whole={s.dek}>{s.dek}</span>{/if}
      <span class="by">{[s.author, SHORT_DATE[lang].format(new Date(s.date)), `${num(s.readTime)} ${L.min}`].filter(Boolean).join(' · ')}</span>
      {#if opts.facts && (s.interviews || s.documents || s.reporting)}
        <span class="facts"
          >{L.method}: {[s.interviews && L.interviews(num(s.interviews), s.interviews), s.documents && L.documents(num(s.documents), s.documents), s.reporting]
            .filter(Boolean)
            .join(' · ')}</span
        >
      {/if}
    </span>
    {#if opts.quote}
      <span class="quote"><span class="qt">“{opts.quote.text}”</span><span class="who">{opts.quote.who}</span></span>
    {/if}
    {#if pic}
      <span class="art">
        <img src={pic.src} srcset={pic.srcset} sizes={role === 'lead' ? '(max-width: 759px) 100vw, 40vw' : '(max-width: 759px) 100vw, 25vw'} alt="" draggable="false" />
      </span>
    {/if}
  </a>
{/snippet}

<div class="ed-wrap" bind:this={wrap}>
  <main class="stage">
    <h1 class="sr">Second Order — {L.tagline}</h1>
    <div class="window" bind:this={win}>
      <div class="track" bind:this={track}>
        <!-- 01, the front page: the edition's line, the lead across most of
             the page, and two seconds -->
        <section class="pg front" data-n="1" aria-label={W[lang].front}>
          <p class="folio">
            <span class="fl"
              ><b class="pn">{two(1, lang)}</b><span class="fc">{W[lang].front}</span><span class="fc date"
                >{EDITION[lang].format(new Date(ed.date))}</span
              ></span
            >
            <span class="fc motto">{L.tagline}</span>
          </p>
          {@render story(ed.lead, 'lead', 'lead', { front: true, wide: true, quote: ed.quote, facts: true })}
          {#each ed.seconds as s, i (s.slug)}
            {@render story(s, i === 0 ? 'pic' : 'word', i === 0 ? 'sa' : 'sb', { front: true })}
          {/each}
        </section>

        <!-- 02 on: a page for each topic -->
        {#each ed.pages as p, k (p.key)}
          {@const sh = shape(p.stories.length, k % 2 === 1)}
          <section class="pg sec" data-n={p.n} aria-label={sectionLabel(p.key, lang)} style:--cols={sh.cols} style:--rows={sh.rows} style:--areas={sh.areas}>
            <div class="head">
              <b class="hn">{two(p.n, lang)}</b>
              <span class="hm"><Mark key={p.key} size={40} /></span>
              <h2 class="name">{sectionLabel(p.key, lang)}</h2>
              <span class="span">{range(new Date(p.from), new Date(p.to), lang)}</span>
              <a class="all fill" href={gridIndex(lang, p.key)} draggable="false">{L.count(num(p.total))} →</a>
            </div>
            {#each p.stories as s, i (s.slug)}
              {@render story(s, roleOf(i), AREAS[i], { wide: i === 0 && sh.wide })}
            {/each}
          </section>
        {/each}

        <a class="pg door fill" href={gridIndex(lang)} draggable="false">
          <span class="kick">{L.count(num(ed.total))}</span>
          <span class="big">{L.all} →</span>
          <span class="kick">{range(new Date(ed.from), new Date(ed.to), lang)}</span>
        </a>
      </div>
    </div>

    <!-- the page count only where the pages go by one at a time -->
    <BottomRow {lang} n={active} total={mobile ? null : ed.pages.length + 1} />
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
  :global(html:has(.g .ed-wrap)),
  :global(body:has(.g .ed-wrap)) {
    overscroll-behavior-y: none;
  }
  .ed-wrap {
    position: relative;
  }
  .stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
  .window {
    container-type: inline-size;
    position: absolute;
    top: calc(var(--mv) + var(--top));
    left: calc(var(--m) + var(--side));
    right: var(--m);
    height: var(--reel);
    overflow: hidden;
    cursor: grab;
    user-select: none;
    transition: left 0.4s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  :global(.window.dragging),
  :global(.window.dragging *) {
    cursor: grabbing !important;
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

  /* ---- a page: cells parted by one rule, drawn by the gaps between them
     over the page's own ink, so every cell meets the next on one line ---- */
  .pg {
    flex: none;
    box-sizing: border-box;
    display: grid;
    gap: var(--line);
    width: max(100cqw, 1080px);
    height: 100%;
    border-right: var(--line) solid var(--rule);
    background: var(--rule);
  }
  /* the front stops short of the screen's edge: the next page's ink column
     stands in the space, saying there's more to the right */
  .front {
    width: max(80cqw, 864px);
    grid-template-columns: minmax(0, 7.2fr) minmax(0, 3fr);
    grid-template-rows: var(--label) minmax(0, 1.15fr) minmax(0, 1fr);
    grid-template-areas: 'f f' 'lead sa' 'lead sb';
  }
  .sec {
    grid-template-columns: var(--cols);
    grid-template-rows: var(--rows);
    grid-template-areas: var(--areas);
  }

  /* the edition's line, under the name: a row of cells like the header's,
     divided on the page's own column rules (it takes the page's columns, and
     the gaps between them show its hairline colour): the page and its date
     over the lead, the motto over the seconds */
  .folio {
    grid-area: f;
    display: grid;
    grid-template-columns: subgrid;
    margin: 0;
    background: color-mix(in srgb, var(--ink) 18%, var(--paper));
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .fl {
    display: flex;
    min-width: 0;
    background: var(--paper);
  }
  .fc,
  .pn {
    display: flex;
    align-items: center;
    padding: 0 var(--in);
    background: var(--paper);
  }
  .fl > * + * {
    border-left: 1px solid var(--hair);
  }
  /* the date to the lead's far edge, against the rule */
  .date {
    margin-left: auto;
  }
  .pn {
    padding: 0 var(--u) 0 var(--in);
    font: 640 1rem / 1 var(--sans);
    font-stretch: 75%;
    letter-spacing: 0;
    color: var(--o-text);
  }
  .motto {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: none;
    letter-spacing: 0;
    font: italic 400 0.9375rem / 1 var(--read);
    color: var(--mute);
  }

  /* ---- a story ---- */
  .st {
    container-type: size;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  /* on its picture's colour, as the reel's cards are, the picture rising
     out of it below the words */
  .st.toned {
    background: var(--card, var(--i3));
    color: var(--on, var(--ink));
  }
  /* the words never shrink to fit: short of room, the picture gives way
     first, and a cell too short for everything loses its foot, never a
     line cut through */
  /* a story's first line is a band one label row high, as the folio
     is beside it, so labels sit level across a page and headlines start
     level under them */
  .top {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: var(--u);
    padding: 0 var(--in);
  }
  .more {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: var(--u);
    padding: calc(1.5 * var(--u)) var(--in) var(--in);
  }
  .kick {
    flex: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    height: var(--label);
    font-size: calc(0.875rem * var(--k));
    font-weight: 540;
    white-space: nowrap;
  }
  .sl {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .kind {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--i);
  }
  .onfront .kind {
    margin-left: auto;
  }
  .toned .kind {
    color: inherit;
    opacity: 0.75;
  }
  .hl {
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  /* an Analysis speaks in the reading face, as a paper sets opinion */
  .hl.serif {
    font-family: var(--read);
    font-weight: 400;
    font-stretch: 100%;
    line-height: 1.06;
    letter-spacing: -0.015em;
  }
  .hl:lang(bn),
  :global(.g:lang(bn)) .hl {
    line-height: 1.28;
  }
  .dek {
    max-width: 36em;
    font-family: var(--read);
    font-size: 1rem;
    line-height: 1.45;
    text-wrap: pretty;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .by,
  .facts {
    font: 500 calc(0.6875rem * var(--k)) / 1.35 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .facts {
    padding-top: var(--u);
    border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  }
  .art {
    position: relative;
    flex: 1;
    min-height: calc(8 * var(--u));
  }
  .art img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 100%;
    /* the picture's top melts into its own colour above it */
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 35%);
    mask-image: linear-gradient(to bottom, transparent, #000 35%);
    transition: transform 0.8s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  @media (hover: hover) {
    .toned:hover .art img {
      transform: scale(1.03);
    }
    .toned:hover .hl {
      text-decoration: underline;
      text-decoration-thickness: 0.06em;
      text-underline-offset: 0.12em;
    }
    .fill:hover .kind {
      color: var(--i2);
    }
  }

  /* the lead: the largest words on the page */
  .lead .hl {
    font-size: clamp(1.8rem, min(11cqi, 7.5cqb), 4rem);
  }
  .lead .dek {
    font-size: clamp(1rem, 3.4cqi, 1.2rem);
    -webkit-line-clamp: 5;
    line-clamp: 5;
  }
  /* wide, the words to the left and the picture beside them */
  .wide {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }
  .wide .top {
    grid-column: 1 / -1;
    grid-row: 1;
  }
  .wide .more {
    grid-column: 1;
    grid-row: 2;
  }
  .wide .quote {
    grid-column: 1;
    grid-row: 4;
  }
  .wide .art {
    grid-column: 2;
    grid-row: 2 / 5;
  }
  .wide .art img {
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%), linear-gradient(to right, transparent, #000 22%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to bottom, transparent, #000 30%), linear-gradient(to right, transparent, #000 22%);
    mask-composite: intersect;
  }
  .wide .hl {
    font-size: clamp(1.8rem, min(6.4cqi, 12cqb), 4.2rem);
  }
  .wide .dek {
    font-size: clamp(1rem, 1.9cqi, 1.25rem);
  }
  /* the front's lead, bigger again: three lines at most across the page */
  .front .lead .hl {
    font-size: clamp(2.2rem, min(9.8cqi, 12cqb), 6.6rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 0.94;
  }
  .front .lead .dek {
    -webkit-line-clamp: 6;
    line-clamp: 6;
  }
  /* on a short screen the quote steps aside for the dek */
  @container (max-height: 640px) {
    .quote {
      display: none !important;
    }
  }
  .quote {
    display: flex;
    flex-direction: column;
    gap: var(--u);
    margin: 0 var(--in) var(--in);
    padding-top: calc(1.5 * var(--u));
    border-top: var(--line) solid currentColor;
  }
  .qt {
    font: italic 400 clamp(1.25rem, 3.3cqi, 2.1rem) / 1.18 var(--read);
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .who {
    font: 500 calc(0.6875rem * var(--k)) / 1.35 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* with its picture, a second */
  .pic .hl {
    font-size: clamp(1.3rem, min(8cqi, 7.5cqb), 2.3rem);
  }
  .pic .dek {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
  /* short, a second keeps its picture and lets its dek go */
  @container (max-height: 340px) {
    .pic .dek {
      display: none;
    }
  }
  /* words alone: the headline is the picture, the byline at the cell's foot */
  .word .hl {
    font-size: clamp(1.4rem, min(9.5cqi, 8cqb), 2.7rem);
  }
  .word .more {
    flex: 1 0 auto;
  }
  .word .by {
    margin-top: auto;
  }
  @container (max-height: 330px) {
    .word .dek {
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
  }

  /* ---- a topic's head: its page, its mark and its name, in ink ---- */
  .head {
    grid-area: h;
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: calc(1.5 * var(--u));
    min-width: 0;
    min-height: 0;
    padding: calc(var(--label) + var(--u)) 0 0;
    background: var(--ink);
    color: var(--paper);
  }
  .head > :not(.all) {
    margin: 0 var(--in);
  }
  .hn {
    font-size: clamp(2.2rem, 24cqi, 4rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 0.9;
    color: var(--o);
  }
  .name {
    margin: 0;
    font-size: clamp(1.6rem, 15cqi, 3.4rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 0.95;
    letter-spacing: -0.01em;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  .name:lang(bn),
  :global(.g:lang(bn)) .name {
    line-height: 1.2;
  }
  .span {
    margin-top: auto !important;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--paper) 70%, transparent);
  }
  /* its foot level with the bylines beside it */
  .all {
    display: flex;
    align-items: flex-end;
    padding: var(--u) var(--in) var(--in);
    line-height: 1.1;
    border-top: 1px solid color-mix(in srgb, var(--paper) 25%, transparent);
    color: var(--paper);
    text-decoration: none;
    font-size: calc(0.875rem * var(--k));
    font-weight: 540;
  }
  /* on the ink column the fill rises in paper */
  .head .all::before {
    background: var(--paper);
  }
  .head .all:hover,
  .head .all:focus-visible {
    color: var(--ink);
  }

  /* ---- the way to every story ---- */
  .door {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: max(36cqw, 380px);
    padding: var(--in);
    border-right: 0;
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
  }
  .door .kick {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .big {
    font-size: clamp(2rem, 1rem + 2.6vw, 4rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.01em;
  }

  /* ---- phone: the same pages, one under another, scrolling down ---- */
  @media (max-width: 759px) {
    .stage {
      position: static;
      height: auto;
      overflow: visible;
      padding: var(--top) 0 var(--bot);
    }
    .window {
      position: static;
      height: auto;
      overflow: visible;
      cursor: auto;
      user-select: auto;
    }
    .track {
      position: static;
      flex-direction: column;
      gap: var(--line);
      width: auto;
      height: auto;
      transform: none !important;
      background: var(--rule);
    }
    .pg {
      display: flex;
      flex-direction: column;
      width: auto;
      height: auto;
      border-right: 0;
    }
    .st {
      container-type: inline-size;
    }
    .folio .motto {
      display: none;
    }
    .folio {
      display: flex;
      height: var(--label);
      flex: none;
    }
    .fl {
      flex: 1;
    }
    /* the picture under the words, cut a little short of its own 3:2 at
       the top, where the illustrations are only their colour */
    .art {
      flex: none;
      aspect-ratio: 21 / 9;
      min-height: 0;
    }
    .lead .art {
      aspect-ratio: 2 / 1;
    }
    /* the picture between the headline and the rest, so the first screen
       has the lead's picture as well as its words; it melts into its colour
       at the foot too, where the words go on */
    .wide {
      display: flex;
    }
    .toned .art {
      order: 1;
      margin-top: var(--u);
    }
    .toned .more {
      order: 2;
      padding-top: 0;
    }
    .toned .quote {
      order: 3;
      margin-top: var(--u);
    }
    .toned .art img,
    .wide .art img {
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 82%, transparent);
      mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 82%, transparent);
    }
    .lead .hl,
    .wide .hl {
      font-size: clamp(1.9rem, 9.5cqi, 2.6rem);
    }
    .front .lead .hl {
      font-size: clamp(2.2rem, 11.5cqi, 3.2rem);
    }
    .lead .dek,
    .wide .dek {
      font-size: 1.05rem;
    }
    .qt {
      font-size: 1.45rem;
    }
    .pic .hl {
      font-size: 1.6rem;
    }
    .word .hl {
      font-size: 1.55rem;
    }
    .word .by {
      margin-top: 0;
    }
    /* the number at the left edge, the mark at the right, on the same
       edges as the words and labels below */
    .head {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      column-gap: var(--in);
      row-gap: var(--u);
      padding-top: var(--in);
    }
    .hn {
      font-size: 2.6rem;
    }
    .hm {
      justify-self: end;
      line-height: 0;
    }
    .name {
      grid-column: 1 / -1;
      font-size: 2.3rem;
    }
    .span {
      grid-column: 1 / -1;
      margin-top: 0 !important;
    }
    .all {
      grid-column: 1 / -1;
    }
    .door {
      width: auto;
      gap: calc(3 * var(--u));
    }
  }
</style>
