<script>
  /* Another of our stories, set beside the text where the writer pasted its
     link: one cell of the reel in small. Its topic in the label row, which
     fills with ink when it's pointed at, as a reel card's does; its picture
     on its own colour; its headline; when and how long. It knows what the
     reader has done with it: read, or begun and how far. It stays inside
     the text column, edge to edge with the text (the margin is the source
     notes' alone), its picture beside its headline. */
  import { sectionLabel, formatNumber } from '$lib/labels.js';
  import { photo, SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from './Mark.svelte';
  import { storyUrl } from './grid.js';
  import { progress, isRead, isBegun } from './memory.svelte.js';

  let { story: s, lang } = $props();
  const L = $derived(STR[lang]);
  const pic = $derived(photo(s));
  const p = $derived(progress(s));
</script>

<aside class="also" aria-label={L.alsoRead}>
  <a class="card" href={storyUrl(s)} lang={s.lang} style:--card={s.tone?.bg} style:--p={p || null}>
    <span class="lab">
      <Mark key={s.section} size={13} />
      <span class="sec">{sectionLabel(s.section, s.lang)}</span>
      {#if isRead(s)}<span class="st">{L.done}</span>{:else if isBegun(s)}<span class="st">{L.goOn} · {formatNumber(Math.round(p * 100), lang)}%</span>{/if}
    </span>
    <span class="row">
      {#if pic}<span class="media"><img src={pic.thumb} alt="" loading="lazy" /></span>{/if}
      <span class="words">
        <span class="t">{s.title}</span>
        <span class="meta">{SHORT_DATE[s.lang].format(new Date(s.date))} · {formatNumber(s.readTime, s.lang)} {STR[s.lang].min}</span>
      </span>
    </span>
  </a>
</aside>

<style>
  .also {
    margin: 1.75rem 0;
    font-family: var(--sans);
  }
  .card {
    display: block;
    border: 1px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
  }
  /* the label row, the card's handle: it fills with ink from below when
     the card is pointed at, and how far the reader got runs along its foot */
  .lab {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    height: 2.1rem;
    padding: 0 0.7rem;
    border-bottom: 1px solid var(--hair);
    font-size: 0.8125rem;
    font-weight: 560;
    white-space: nowrap;
    transition: color 0.2s 0.1s;
  }
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
  .card[style*='--p'] .lab::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: calc(var(--p) * 100%);
    height: 3px;
    background: var(--o);
  }
  .card:focus-visible .lab::before {
    transform: scaleY(1);
  }
  .card:focus-visible {
    outline: none;
  }
  .card:focus-visible .lab {
    color: var(--paper);
  }
  @media (hover: hover) {
    .card:hover .lab::before {
      transform: scaleY(1);
    }
    .card:hover .lab {
      color: var(--paper);
    }
  }
  .sec {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .st {
    margin-left: auto;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.75;
  }
  /* narrow: picture beside the headline */
  .row {
    display: flex;
    gap: 0.75rem;
    padding: 0.7rem;
  }
  .media {
    flex: none;
    width: 5.5rem;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--card, var(--o3));
  }
  .media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .words {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }
  .t {
    font-size: 1.05rem;
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1.12;
  }
  .card:lang(bn) .t {
    line-height: 1.4;
  }
  .meta {
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  /* with room, a strip across the text column, edge to edge with the
     text: the picture at its left, the headline beside it. (It doesn't
     float: text wrapping round it would push the margin's source notes
     down, away from their sentences.) */
  @container (min-width: 760px) {
    .row {
      gap: 1.1rem;
      padding: 0.8rem;
    }
    .media {
      width: 11rem;
      aspect-ratio: 16 / 10;
    }
    .words {
      justify-content: center;
    }
    .t {
      font-size: 1.3rem;
    }
  }
</style>
