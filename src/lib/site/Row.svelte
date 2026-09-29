<script>
  /* One story as a line in an index or in search results: date, headline,
     length, and a small 5:7 thumbnail when there is a photo. */
  import { base } from '$app/paths';
  import { sectionLabel, formatNumber } from '$lib/labels.js';
  import { photo, SHORT_DATE, STR } from './reel.js';

  let { story: s, showTopic = false } = $props();

  const lang = $derived(s.lang);
  const pic = $derived(photo(s));
  const date = $derived(new Date(s.date));
</script>

<a class="row" href="{base}/{s.lang}/{s.slug}" lang={s.lang}>
  <span class="date">{SHORT_DATE[lang].format(date)}</span>
  <span class="main">
    {#if showTopic}<span class="topic">{sectionLabel(s.section, lang)}</span>{/if}
    <span class="title">{s.title}</span>
  </span>
  <span class="min">{formatNumber(s.readTime, lang)} {STR[lang].min}</span>
  <span class="thumb">{#if pic}<img src={pic.thumb} alt="" loading="lazy" />{/if}</span>
</a>

<style>
  .row {
    display: grid;
    grid-template-columns: 6.5rem minmax(0, 1fr) 4.5rem 2.5rem;
    align-items: center;
    gap: 1.5rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .date,
  .min {
    font: 400 calc(0.6875rem * var(--k))/1.2 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .min {
    text-align: right;
  }
  .main {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
  }
  .topic {
    font-size: calc(0.75rem * var(--k));
    font-weight: 540;
    color: var(--mute);
  }
  .title {
    font-size: clamp(1.15rem, 0.95rem + 0.6vw, 1.55rem);
    font-weight: 580;
    font-stretch: 85%;
    line-height: 1.12;
    letter-spacing: -0.01em;
    text-wrap: pretty;
    transition: color 0.15s;
  }
  .title:lang(bn) {
    line-height: 1.35;
    letter-spacing: 0;
  }
  .thumb {
    width: 2.5rem;
    height: 3.5rem;
    overflow: hidden;
    border-radius: 2px;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .row:hover .title,
  .row:focus-visible .title {
    color: var(--accent-text);
  }
  .row:hover img,
  .row:focus-visible img {
    transform: scale(1.08);
  }

  @media (max-width: 759px) {
    .row {
      grid-template-columns: minmax(0, 1fr) 2.5rem;
      grid-template-areas:
        'date thumb'
        'main thumb';
      gap: 0.35rem 1rem;
    }
    .date {
      grid-area: date;
    }
    .main {
      grid-area: main;
    }
    .thumb {
      grid-area: thumb;
    }
    .min {
      display: none;
    }
  }
</style>
