<script>
  /* The reel: the latest stories, or one section's when `section` is set
     (one format's when `format` is), in which case it opens on a title card
     for it. It always ends on a doorway to the full index. */
  import { onMount, untrack } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import { formatNumber, sectionLabel, formatLabel } from '$lib/labels.js';
  import Frame from './Frame.svelte';
  import Odometer from './Odometer.svelte';
  import { lastRead, photo, range, topicUrl, two, DAY_DATE, SHORT_DATE, STR } from './reel.js';

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
  /* The title card's name, as big as its longest word allows across the card
     (in % of the card's width). Letters are counted as a reader sees them, so
     a Bangla vowel sign doesn't count as one of its own; measured in these
     faces a letter runs up to 0.49em wide in English and 0.85em in Bangla,
     so each allowance leaves a little room. */
  const fit = $derived.by(() => {
    if (!heading) return 0;
    const letters = new Intl.Segmenter(lang, { granularity: 'grapheme' });
    const longest = Math.max(...heading.split(/\s+/).map((w) => [...letters.segment(w)].length));
    return Math.min(24, 100 / (longest * (lang === 'bn' ? 0.88 : 0.5)));
  });

  const weekStart = (d) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));

  /* The issue: the five newest stories whatever their section (the reel
     after it is one per section, so this is where what's new lives), three
     when the card is short. Titled "This week" when they all ran this
     calendar week, "Latest" when they reach further back. Both versions are
     in the page and CSS picks one, so a phone never shows five first. */
  function issueOf(count) {
    const items = (reel.latest ?? []).slice(0, count);
    if (!items.length) return { items, from: null, to: null, thisWeek: false };
    const to = new Date(items[0].date);
    const from = new Date(items.at(-1).date);
    return { items, from, to, thisWeek: from >= weekStart(to) };
  }
  const issue = $derived(issueOf(5));
  const issueShort = $derived(issueOf(3));

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
     slot (a story, a pair, the title card or opener, the doorway) is --fw. */
  const reelLength = $derived.by(() => {
    const slots = items.length + (opens ? 1 : 0) + (doorInPair ? 0 : 1);
    const pieces = slots + (titled ? 1 : 0); // the title card is half a slot
    return `6vw + ${pieces - 1} * 1.2vw + ${slots} * var(--fw)${titled ? ' + var(--tw)' : ''}`;
  });

  /* The frame whose photo should fly back into place, if we came from a story. */
  let hero = $state(lastRead());

  let wrap = $state();
  let track = $state();
  let card = $state();
  let cardL = 0;
  let cardW = 0;
  let spineW = 0;
  let morph = null;
  const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mobile = $state(false);
  let x = $state(0);
  let over = $state(1);
  let active = $state(0);
  let frames = [];

  const activeStory = $derived(stories.find((i) => i.n === active)?.story);

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
    if (card) {
      card.style.translate = '';
      cardL = card.offsetLeft;
      cardW = card.offsetWidth;
      spineW = card.querySelector('.spine').offsetWidth;
      // resting geometry, card-relative, for the title → spine morph
      const h = card.querySelector('h1');
      const v = card.querySelector('.vlabel');
      h.style.transform = '';
      v.style.transform = '';
      const face = card.querySelector('.card');
      morph = {
        // how much of the card to trim from the top once the name has settled,
        // leaving a tab just tall enough for it (20px above and below)
        cut: Math.max(0, face.offsetHeight - v.offsetWidth - 40),
        h,
        v,
        hx: h.offsetLeft,
        hy: h.offsetTop,
        bx: v.offsetLeft,
        by: v.offsetTop,
        k: parseFloat(getComputedStyle(v).fontSize) / parseFloat(getComputedStyle(h).fontSize)
      };
    }
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
    stick();
  }

  /* The title card rides out with the reel until only its spine is left at
     the screen edge; there it stays, and the stories pass underneath. On a
     phone `position: sticky` does the holding, so only the morph is set here. */
  function stick() {
    if (!card || !morph) return;
    const right = cardL + cardW - x; // where its right edge would be by now
    const stickAt = (mobile ? 0 : cardL) + spineW; // on a phone it sits flush with the edge
    if (!mobile) card.style.translate = `${Math.max(0, stickAt - right)}px 0`;
    // the turn runs over the last 260px before it's held, or the whole card
    // if that's narrower, so at rest (x = 0) it hasn't started
    const run = Math.min(260, cardW - spineW);
    const p = ease((stickAt + run - right) / run);
    card.classList.toggle('stuck', p > 0.6);
    card.style.setProperty('--fade', String(ease(p / 0.4)));

    /* The big title shrinks and turns onto the spine; halfway round it hands
       over to the one-line spine label, which has been riding along with it
       from the same spot at the same size and angle. */
    const { h, v, hx, hy, bx, by, k } = morph;
    const swap = ease((p - 0.35) / 0.3);
    h.style.opacity = String(1 - swap);
    v.style.opacity = String(swap);
    card.style.setProperty('--cut', `${ease((p - 0.6) / 0.4) * morph.cut}px`);
    if (still) return;
    const dx = (bx - hx) * p;
    const dy = (by - hy) * p;
    const turn = `rotate(${-90 * p}deg)`;
    h.style.transform = `translate(${dx}px, ${dy}px) ${turn} scale(${k ** p})`;
    v.style.transform = `translate(${hx - bx + dx}px, ${hy - by + dy}px) ${turn} scale(${k ** (p - 1)})`;
  }

  function ease(t) {
    const u = Math.min(1, Math.max(0, t));
    return u * u * (3 - 2 * u);
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

  function toStart() {
    if (mobile) track.scrollTo({ left: 0, behavior: 'smooth' });
    else scrollTo({ top: 0, behavior: 'smooth' });
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
    {#if !titled}<h1 class="sr">Ground Truth — {L.tagline}</h1>{/if}
    <div class="track" class:titled bind:this={track}>
      {#if titled}
        <div class="titlecard" bind:this={card}>
          <span class="spacer"></span>
          <div class="card" style:--fit="{fit}cqi">
            <p class="kick">
              {format ? L.format : L.topic} · {L.count(num(reel.total))}
            </p>
            <h1>{heading}</h1>
            <a href="{base}/{lang}">← {L.latest}</a>
            <span class="vlabel" aria-hidden="true">{heading}</span>
            <button type="button" class="spine" onclick={toStart} tabindex="-1" aria-hidden="true"></button>
          </div>
        </div>
      {/if}
      {#if opens}
        <div class="opener">
          <span class="spacer"></span>
          <div class="card issuecard">
            <div class="issue-news">
              <div class="issue-head">
                <p class="kick">
                  <span class="wide">{range(issue.from, issue.to, lang)}</span><span class="narrow"
                    >{range(issueShort.from, issueShort.to, lang)}</span
                  >
                </p>
                <p class="issue-title">
                  <span class="wide">{issue.thisWeek ? L.thisWeek : L.latest}</span><span class="narrow"
                    >{issueShort.thisWeek ? L.thisWeek : L.latest}</span
                  >
                </p>
              </div>
              <ol class="issue">
                {#each issue.items as s, i (s.slug)}
                  <li class:extra={i >= 3}>
                    <a href="{base}/{lang}/{s.slug}" draggable="false">
                      <span class="issue-n">{SHORT_DATE[lang].format(new Date(s.date))}</span>
                      <span class="issue-h">{s.title}</span>
                    </a>
                  </li>
                {/each}
              </ol>
              <div class="issue-foot">
                <p class="issue-label">{L.topics}</p>
                <nav class="issue-topics" aria-label={L.topics}>
                  {#each page.data.topics ?? [] as tp, i (tp.key)}
                    <span class="tp"
                      ><a href={topicUrl(tp.key, lang)}>{sectionLabel(tp.key, lang)}</a
                      >{#if i < page.data.topics.length - 1}<span class="sep" aria-hidden="true">/</span>{/if}</span
                    >
                  {/each}
                </nav>
              </div>
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
      <span class="count"
        ><b><Odometer value={active || 1} {lang} /></b><span class="sr">{two(active || 1, lang)}</span> / {two(
          stories.length,
          lang
        )}</span
      >
      {#if activeStory}<span class="when">{DAY_DATE[lang].format(activeStory.date)}</span>{/if}
      <span class="line"><i style="transform: scaleX({x / over})"></i></span>
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
       bars (7.5rem), up to 56rem, centred, so it has air above and below;
       a card is that less its code line (1.75rem). */
    --avail: calc(100vh - 7.5rem);
    --reel: min(calc(var(--avail) * 0.88), 56rem);
    --box: calc(var(--reel) - 1.75rem);
    --fw: calc(var(--box) * 5 / 7);
    --tw: calc(var(--fw) / 2); /* a topic's or format's title card */
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



  .titlecard {
    position: relative;
    z-index: 2;
    flex: none;
    display: flex;
    flex-direction: column;
    width: var(--tw);
    background: var(--bg); /* frames' code lines pass under the spacer too */
  }
  /* Half a slot wide, so the name is set to the card: big, wrapping by word,
     a long word broken only if it can't fit at all. */
  .titlecard .card {
    container-type: inline-size;
  }
  .titlecard .card h1 {
    font-size: clamp(1.4rem, var(--fit), 3.75rem);
    overflow-wrap: break-word;
    hyphens: auto;
  }
  /* A fixed gutter the width of the reel's own gap: stories disappear at its
     far edge, so their text never runs up against the card. */
  .titlecard::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 100%;
    width: 1.2vw;
    background: var(--bg);
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
    border-radius: 3px;
    background: var(--accent);
    color: #111;
  }
  .kick,
  .card > a {
    margin: 0;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .card h1 {
    margin: auto 0 1.5rem;
    font-size: clamp(2.2rem, 0.8rem + 3.6vw, 5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .card h1:lang(bn) {
    line-height: 1.2;
    letter-spacing: 0;
  }
  .card > a {
    align-self: flex-start;
    color: #111;
    text-decoration: none;
  }
  .card > a:hover,
  .card > a:focus-visible {
    text-decoration: underline;
    outline: none;
  }
  .titlecard {
    --spine: 2.75rem; /* what stays showing at the edge */
    --label: 1.2rem; /* the title's size once it's on the spine */
    --fade: 0;
  }
  .card {
    overflow: hidden;
    /* once held at the edge the card trims down from the top to a tab */
    clip-path: inset(var(--cut, 0px) 0 0 0 round 3px);
  }
  .card .kick,
  .card > a {
    opacity: calc(1 - var(--fade));
  }
  .card h1 {
    transform-origin: 0 0;
  }

  /* The title as it ends up: one line, turned to read up the spine. Placed
     so that after the turn it is centred in the spine, its start at the foot. */
  .vlabel {
    position: absolute;
    left: calc(100% - var(--spine) / 2 - var(--label) / 2);
    top: calc(100% - 1.25rem);
    font-size: var(--label);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 1;
    letter-spacing: -0.01em;
    white-space: nowrap;
    transform-origin: 0 0;
    transform: rotate(-90deg);
    opacity: 0;
    pointer-events: none;
  }

  /* Click target over the spine once the card is held at the edge. */
  .spine {
    position: absolute;
    top: var(--cut, 0px);
    right: 0;
    bottom: 0;
    width: var(--spine);
    padding: 0;
    border: 0;
    background: none;
    pointer-events: none;
    cursor: pointer;
  }
  .stuck .spine {
    pointer-events: auto;
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

  /* The issue: this week's headlines as a contents list, five when the card
     is tall enough and three when it isn't (a phone, a short laptop screen).
     The card measures itself, so it's the same rule everywhere. */
  .issuecard {
    container-type: size;
  }
  .narrow {
    display: none;
  }
  @container (max-height: 44rem) {
    .wide,
    .issue li.extra {
      display: none;
    }
    .narrow {
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
    font-size: clamp(0.875rem, 3.8cqi, 1.15rem);
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
  /* Every topic, one tap away: the names run as one wrapping line, never
     broken mid-name. */
  .issue-label {
    margin: 0 0 0.5rem;
    font: 500 calc(0.625rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.7;
  }
  .issue-topics {
    display: flex;
    flex-wrap: wrap;
    row-gap: 0.1rem;
    font-size: clamp(0.95rem, 4.3cqi, 1.3rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1.3;
  }
  .issue-topics:lang(bn) {
    line-height: 1.5;
  }
  .tp {
    white-space: nowrap;
  }
  .issue-topics a {
    color: #111;
    text-decoration: none;
    outline: none;
  }
  .issue-topics a:hover,
  .issue-topics a:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  .sep {
    margin: 0 0.4em;
    opacity: 0.45;
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
    border-radius: 3px;
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
    bottom: 0;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    height: 3.5rem;
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
    color: var(--mute);
    white-space: nowrap;
  }
  .count b {
    font-weight: 500;
    color: var(--accent-text);
  }
  .line {
    position: relative;
    flex: 1;
    height: 1px;
    background: var(--line);
  }
  .line i {
    position: absolute;
    inset: 0;
    background: var(--accent);
    transform-origin: 0 0;
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
      --avail: calc(100svh - 7.5rem);
      --box: min(calc(86vw * 7 / 5), calc(var(--avail) * 0.88 - 1.75rem));
      --fw: calc(var(--box) * 5 / 7);
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
    .issue-label {
      margin-bottom: 0.35rem;
    }
    .issue-topics {
      font-size: 0.875rem;
    }
    .issuecard .motto {
      margin-top: 0.9rem;
      padding: 0.7rem 1.25rem 0.8rem;
      font-size: 0.8125rem;
      line-height: 1.35;
    }
    /* Held flush with the screen edge (past the track's 4vw padding), showing
       only the spine. */
    .titlecard {
      width: var(--tw);
      scroll-snap-align: start;
      position: sticky;
      left: calc(1.75rem - var(--tw) - 4vw);
    }
    .titlecard {
      --spine: 1.75rem;
      --label: 0.95rem;
    }
    .titlecard::after {
      width: 3vw;
    }
    /* Cards come to rest clear of the spine and its gutter, not under them. */
    .track.titled {
      scroll-padding-left: calc(1.75rem + 3vw + 2px);
    }
    .rail {
      left: 4vw;
      right: 4vw;
    }
    .when {
      display: none;
    }
  }

</style>
