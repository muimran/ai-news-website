<script>
  /* The reel: the latest stories, or one section's when `section` is set
     (one format's when `format` is), whose name the top bar then carries. It always ends on a doorway to the full index. */
  import { onMount, untrack } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import { formatNumber, sectionLabel, formatLabel } from '$lib/labels.js';
  import Frame from './Frame.svelte';
  import Odometer from './Odometer.svelte';
  import { lastRead, photo, range, topicUrl, two, SHORT_DATE, STR } from './reel.js';

  /* `opener`: the front reel opens on the issue card — the latest stories,
     who we are, and every topic. Every story card after it is the same size. */
  let { lang, reel, section = null, format = null, opener = false } = $props();
  const L = $derived(STR[lang]);
  const items = $derived(reel.items);
  // every story in order, a pair's two included
  const stories = $derived(items.flatMap((i) => (i.type === 'pair' ? [i.a, i.b].filter(Boolean) : [i])));
  /* A section's last pair can be one story short; the doorway then takes
     the empty half instead of a slot of its own. */
  const doorInPair = $derived(items.at(-1)?.type === 'pair' && !items.at(-1).b);
  const titled = $derived(!!(section || format));
  const opens = $derived(!!opener && !titled);
  const heading = $derived(format ? formatLabel(format, lang) : section && sectionLabel(section, lang));
  const weekStart = (d) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));

  /* The issue: the newest stories whatever their section (the reel after
     it is one per section, so this is where what's new lives): eight, six
     or four, as many as the card's height holds. Titled "This week" when
     they all ran this calendar week, "Latest" when they reach further back.
     Every version is in the page and CSS picks one, so a phone never shows
     eight first. */
  function issueOf(count) {
    const items = (reel.latest ?? []).slice(0, count);
    if (!items.length) return { n: count, items, from: null, to: null, thisWeek: false };
    const to = new Date(items[0].date);
    const from = new Date(items.at(-1).date);
    return { n: count, items, from, to, thisWeek: from >= weekStart(to) };
  }
  const tiers = $derived([8, 6, 4].map(issueOf));
  const issue = $derived(tiers[0]);

  /* Cards without a photo alternate ink and indigo, counted across those
     cards only, so two never sit side by side in the same tone. */
  const tones = $derived.by(() => {
    const m = new Map();
    let k = 0;
    for (const it of stories) if (!photo(it.story)) m.set(it.story.slug, k++ % 2 ? 'indigo' : 'ink');
    return m;
  });
  const num = (n) => formatNumber(n, lang);

  /* The reel's length as CSS, so the server can size the scroll distance
     before any script runs; measure() then corrects it to the pixel. Every
     slot (a story, a pair, the opener, the doorway) is --fw. */
  const reelLength = $derived.by(() => {
    const slots = items.length + (opens ? 1 : 0) + (doorInPair ? 0 : 1);
    return `6vw + ${slots - 1} * 1.2vw + ${slots} * var(--fw)`;
  });

  /* The frame whose photo should fly back into place, if we came from a story. */
  let hero = $state(lastRead());

  let wrap = $state();
  let shelf = $state();
  let shelfOff = $state(false); // the topics box scrolled off its start (phones)
  let track = $state();
  let mobile = $state(false);
  let x = $state(0);
  let over = $state(1);
  let active = $state(0);
  let frames = [];


  function measure() {
    mobile = matchMedia('(max-width: 759px)').matches;
    if (mobile) {
      wrap.style.height = '';
      track.style.transform = '';
      over = Math.max(1, track.scrollWidth - track.clientWidth);
    } else {
      over = Math.max(1, track.offsetWidth - document.documentElement.clientWidth);
      wrap.style.height = `${over + innerHeight}px`;
    }
    frames = [...track.querySelectorAll('.frame')].map((el) => ({ n: +el.dataset.n, left: el.offsetLeft }));
    update();
  }

  /* Vertical scroll drives the reel sideways, one pixel for one pixel. */
  function update() {
    x = mobile ? track.scrollLeft : Math.min(scrollY, over);
    if (!mobile) track.style.transform = `translate3d(${-x}px, 0, 0)`;
    const probe = x + innerWidth * 0.3;
    let cur = frames[0];
    for (const f of frames) if (f.left <= probe) cur = f;
    active = cur?.n ?? 1;
  }

  /* One slot along; a pair's two stories share a slot, so skip to the next
     frame that sits somewhere else. */
  function go(d) {
    const here = frames.find((f) => f.n === active);
    const along = frames.filter((f) => (d > 0 ? f.left > here.left : f.left < here.left));
    const f = d > 0 ? along[0] : along.at(-1);
    if (f) scrollToFrame(f);
  }

  function scrollToFrame(f) {
    const left = Math.max(0, f.left - innerWidth * (mobile ? 0.04 : 0.03));
    if (mobile) track.scrollTo({ left, behavior: 'smooth' });
    else scrollTo({ top: left, behavior: 'smooth' });
  }

  function keys(e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    }
  }

  /* Sideways trackpad swipes move the reel too. */
  function wheel(e) {
    if (mobile || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    scrollBy(0, e.deltaX);
  }

  // re-measure when the language (and so the reel) changes
  $effect(() => {
    void items;
    if (track) untrack(measure);
  });

  onMount(() => {
    const onScroll = () => !mobile && update();
    const onTrack = () => mobile && update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    addEventListener('wheel', wheel, { passive: false });
    track.addEventListener('scroll', onTrack, { passive: true });
    measure();
    // on a phone the box scrolls; bring the current topic into view
    const cur = shelf?.querySelector('[aria-current]');
    if (cur) shelf.scrollLeft = cur.offsetLeft - (shelf.clientWidth - cur.offsetWidth) / 2;
    shelfOff = (shelf?.scrollLeft ?? 0) > 4;
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
      removeEventListener('wheel', wheel);
    };
  });
</script>

<svelte:window onkeydown={keys} />

{#snippet door()}
  <a class="more" href={reel.index}>
    <span class="spacer"></span>
    <span class="door">
      <span class="kick">{L.count(num(reel.total))}</span>
      <span class="big">{L.all} →</span>
      <span class="kick">{range(reel.from, reel.to, lang)}</span>
    </span>
  </a>
{/snippet}

<div class="wrap" bind:this={wrap} style="--length: calc({reelLength})">
  <main class="stage">
    <!-- a topic's name shows in the top bar, beside the site's -->
    <h1 class="sr">{titled ? heading : `Ground Truth — ${L.tagline}`}</h1>
    <div class="track" bind:this={track}>
      {#if opens}
        <div class="opener">
          <span class="spacer"></span>
          <div class="card issuecard">
            <div class="issue-news">
              <div class="issue-head">
                <p class="kick">
                  {#each tiers as t (t.n)}<span class="t{t.n}">{range(t.from, t.to, lang)}</span>{/each}
                </p>
                <p class="issue-title">
                  {#each tiers as t (t.n)}<span class="t{t.n}">{t.thisWeek ? L.thisWeek : L.latest}</span>{/each}
                </p>
              </div>
              <ol class="issue">
                {#each issue.items as s, i (s.slug)}
                  <li class:x4={i >= 4} class:x6={i >= 6}>
                    <a href="{base}/{lang}/{s.slug}" draggable="false">
                      <span class="issue-n">{SHORT_DATE[lang].format(new Date(s.date))}</span>
                      <span class="issue-h">{s.title}</span>
                    </a>
                  </li>
                {/each}
              </ol>
            </div>
            <p class="motto">{L.blurb}</p>
          </div>
        </div>
      {/if}
      {#each items as item (item.key)}
        {#if item.type === 'pair'}
          <div class="pair">
            {#each [item.a, item.b].filter(Boolean) as it (it.key)}
              <Frame
                story={it.story}
                n={it.n}
                size="half"
                tone={tones.get(it.story.slug)}
                sizes="calc((88vh - 8rem) * 5 / 7)"
                named={hero === it.story.slug}
                topic={section}
                {format}
                onpick={(slug) => (hero = slug)}
              />
            {/each}
            {#if !item.b}{@render door()}{/if}
          </div>
        {:else}
          <Frame
            story={item.story}
            n={item.n}
            tone={tones.get(item.story.slug)}
            sizes="calc((88vh - 8rem) * 5 / 7)"
            named={hero === item.story.slug}
            topic={section}
            {format}
            onpick={(slug) => (hero = slug)}
          />
        {/if}
      {/each}
      {#if !doorInPair}{@render door()}{/if}
    </div>

    <div class="rail">
      <!-- The topics take the progress line's place: every one a tap away,
           in one box, the one you're in marked. It starts on the page's
           left edge, under the logo and the first card; the counter, which
           still says where you are along the reel, sits at the right. -->
      <nav
        class="shelf"
        class:off={shelfOff}
        aria-label={L.topics}
        bind:this={shelf}
        onscroll={() => (shelfOff = shelf.scrollLeft > 4)}
      >
        {#each page.data.topics ?? [] as tp (tp.key)}
          <a
            href={topicUrl(tp.key, lang)}
            aria-current={section === tp.key ? 'page' : undefined}
            draggable="false">{sectionLabel(tp.key, lang)}</a
          >
        {/each}
      </nav>
      <span class="count"
        ><b><Odometer value={active || 1} {lang} /></b><span class="sr">{two(active || 1, lang)}</span> / {two(
          stories.length,
          lang
        )}</span
      >
      <span class="hint" class:gone={x > 40}>{L.scroll} →</span>
    </div>
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

  /* On desktop the page scroll is the reel's sideways travel, so the end of
     the reel is the end of the page: no elastic bounce there (Safari's
     would drag the whole page, top bar and all). Phones swipe the track
     itself, and keep pull-to-refresh. */
  @media (min-width: 760px) {
    :global(html:has(.wrap)),
    :global(body:has(.wrap)) {
      overscroll-behavior-y: none;
    }
  }

  /* Desktop: the page is as tall as the reel is wide, and a sticky stage
     turns that vertical scroll into sideways travel. */
  .wrap {
    /* Every card is 5:7 (the photo-print proportion), photo or not. The reel takes 88% of the height between the
       bars (8.5rem: the bottom one sits 1rem off the edge), up to 56rem, centred, so it has air above and below;
       a card is that less its code line (1.75rem). */
    --avail: calc(100vh - 8.5rem);
    --reel: min(calc(var(--avail) * 0.88), 56rem);
    --box: calc(var(--reel) - 1.75rem);
    --fw: calc(var(--box) * 5 / 7);
    position: relative;
    height: calc(100vh + var(--length) - 100vw);
  }
  .stage {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
  .track {
    position: absolute;
    top: calc(4rem + (var(--avail) - var(--reel)) / 2);
    height: var(--reel);
    left: 0;
    display: flex;
    gap: 1.2vw;
    width: max-content;
    padding: 0 3vw;
    will-change: transform;
  }

  .track :global(.frame) {
    width: var(--fw);
  }
  /* On a section's reel everything after its top story goes two to a slot,
     one above the other. */
  .pair {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    width: var(--fw);
  }
  .pair :global(.frame) {
    flex: 1;
    min-height: 0;
    height: auto;
  }



  .spacer {
    height: 1.75rem;
  }
  .card {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.25rem;
    background: var(--accent);
    color: #111;
    overflow: hidden;
  }
  .kick {
    margin: 0;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* The front reel's opener. It scrolls away with the reel rather than
     pinning, since its dates would be wrong once the reel reaches older days. */
  .opener {
    flex: none;
    display: flex;
    flex-direction: column;
    width: var(--fw);
  }
  .motto {
    max-width: 24em;
    margin: 0;
    line-height: 1.4;
  }

  /* The issue: this week's headlines as a contents list, eight, six or four
     by the card's height (a tall screen, a laptop, a phone).
     The card measures itself, so it's the same rule everywhere. */
  .issuecard {
    container-type: size;
  }
  .t6,
  .t4 {
    display: none;
  }
  @container (max-height: 36rem) {
    .t8,
    .issue li.x6 {
      display: none;
    }
    .t6 {
      display: inline;
    }
  }
  @container (max-height: 29rem) {
    .t6,
    .issue li.x4 {
      display: none;
    }
    .t4 {
      display: inline;
    }
  }
  .issue-title {
    margin: 0.75rem 0 0;
    font-size: clamp(2rem, 13cqi, 5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.01em;
  }
  .issue-title:lang(bn) {
    line-height: 1.2;
  }
  /* Two parts. The news, on orange: heading, the five and every topic, with
     the spare height shared evenly between them. Then who we are, on the
     newsroom's indigo, below a thin white line. */
  .issue-news {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .issue {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid rgb(17 17 17 / 0.35);
  }
  .issue li {
    border-bottom: 1px solid rgb(17 17 17 / 0.35);
  }
  .issue a {
    display: grid;
    grid-template-columns: 3.6em minmax(0, 1fr);
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.65em 0;
    color: #111;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 580;
    font-stretch: 85%;
    line-height: 1.12;
    outline: none;
  }
  .issue a:lang(bn) {
    line-height: 1.35;
  }
  .issue a:hover .issue-h,
  .issue a:focus-visible .issue-h {
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  .issue-n {
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.06em;
  }
  .issuecard .motto {
    max-width: none;
    margin: 1.25rem -1.25rem -1.25rem;
    padding: 1rem 1.25rem 1.15rem;
    border-top: 1px solid #fff;
    background: var(--indigo);
    color: #fff;
    font-size: 0.875rem;
  }

  /* The doorway at the end of every reel, into the full index. */
  .more {
    flex: none;
    display: flex;
    flex-direction: column;
    width: var(--fw);
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .door {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.25rem;
    border: 1px solid var(--line);
    transition:
      background 0.3s,
      color 0.3s;
  }
  .more:hover .door,
  .more:focus-visible .door {
    background: var(--ink);
    color: var(--bg);
  }
  .pair .more {
    flex: 1;
    width: auto;
    min-height: 0;
  }
  .pair .door .big {
    font-size: clamp(1.6rem, 0.6rem + 2.4vw, 3.2rem);
  }
  .door .big {
    font-size: clamp(2.2rem, 0.8rem + 3.6vw, 5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.01em;
  }
  .door .big:lang(bn) {
    line-height: 1.2;
    letter-spacing: 0;
  }

  .rail {
    position: absolute;
    left: 3vw;
    right: 3vw;
    bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    height: 3.5rem;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    color: var(--mute);
    white-space: nowrap;
  }
  .count b {
    font-weight: 500;
    color: var(--accent-text);
  }
  /* The front's topics: one outlined box, a cell to each, filled in ink on
     hover like the doorway at the reel's end. */
  .shelf {
    flex: 1;
    display: flex;
    min-width: 0;
    overflow-x: auto;
    /* outlined in ink, no fill: the site's mark for a way somewhere, like
       the language button and the doorway */
    border: 1px solid var(--ink);
    scrollbar-width: none;
  }
  .shelf::-webkit-scrollbar {
    display: none;
  }
  .shelf a {
    flex: 1 0 auto;
    padding: 0.75rem 1rem;
    text-align: center;
    color: var(--ink);
    text-decoration: none;
    font: 600 calc(1rem * var(--k)) / 1.2 'Instrument Sans', 'Noto Sans Bengali', system-ui, sans-serif;
    font-stretch: 85%;
    outline: none;
    position: relative;
    isolation: isolate; /* keeps the fill behind the name */
    /* the name turns as the fill passes its middle */
    transition: color 0.2s 0.1s;
  }
  /* On hover the ink rises from the bottom of the cell. */
  .shelf a::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--ink);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.35s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  .shelf a:hover::before,
  .shelf a:focus-visible::before {
    transform: scaleY(1);
  }
  .shelf a + a {
    border-left: 1px solid color-mix(in srgb, var(--ink) 25%, transparent);
  }
  .shelf a[aria-current='page'] {
    color: var(--accent-text);
    box-shadow: inset 0 -2px 0 var(--accent);
  }
  .shelf a:hover,
  .shelf a:focus-visible {
    color: var(--bg);
  }
  @media (prefers-reduced-motion: reduce) {
    .shelf a,
    .shelf a::before {
      transition: none;
    }
  }
  .hint {
    color: var(--ink);
    transition: opacity 0.4s;
  }
  .hint.gone {
    opacity: 0;
  }

  /* Phone: a native swipe reel instead of scroll-jacking. The same 5:7
     cards, as wide as the screen allows (86vw) unless the phone is short,
     centred with air above and below. */
  @media (max-width: 759px) {
    .wrap {
      /* Full width and as tall as the screen allows, 1rem clear of each
         bar, so no band of empty paper above and below; never taller than
         a phone story (9:16), and on a short phone back to 5:7. */
      --avail: calc(100svh - 8.5rem);
      --fw: min(86vw, calc((var(--avail) - 3.75rem) * 5 / 7));
      --box: min(calc(var(--avail) - 3.75rem), calc(var(--fw) * 16 / 9));
      --reel: calc(var(--box) + 1.75rem);
      height: auto;
    }
    .stage {
      position: relative;
      height: 100svh;
    }
    .track {
      right: 0;
      width: auto;
      gap: 3vw;
      padding: 0 4vw;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-padding: 0 4vw;
      scrollbar-width: none;
      will-change: auto;
    }
    .track::-webkit-scrollbar {
      display: none;
    }
    /* On a phone the cards run full height, the stories format, all one
       width. */
    .track :global(.frame),
    .pair,
    .opener,
    .more {
      width: var(--fw);
      scroll-snap-align: start;
    }
    /* A phone card is short: both parts close up so all of it fits. */
    .issue-news {
      gap: 0.9rem;
    }
    .issue-title {
      margin-top: 0.5rem;
    }
    .issue a {
      padding: 0.5em 0;
    }
    .issuecard .motto {
      margin-top: 0.9rem;
      padding: 0.7rem 1.25rem 0.8rem;
      font-size: 0.875rem;
      line-height: 1.35;
    }
    /* The topics box runs on past the screen's right edge, open on that
       side, the way a row you can swipe does in an app; it closes after the
       last topic. Once swiped, its start fades out on the left. The counter
       moves ahead of it, onto the page's left edge. */
    .rail {
      left: 4vw;
      right: 0;
    }
    .count {
      order: -1;
    }
    .shelf {
      border-right: 0;
    }
    .shelf a:last-child {
      border-right: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    }
    .shelf.off {
      mask-image: linear-gradient(to right, transparent, #000 2rem);
    }
    /* a size down on a phone, and lighter (medium names, grey outline) so
       it doesn't outweigh the card above; still a comfortable tap (40px) */
    .shelf {
      border-color: color-mix(in srgb, var(--ink) 35%, transparent);
    }
    .shelf a {
      padding: 0.65rem 0.8rem;
      font-size: calc(0.875rem * var(--k));
      font-weight: 500;
    }
    .shelf a[aria-current='page'] {
      font-weight: 600;
    }
    .hint {
      display: none;
    }
  }

</style>
