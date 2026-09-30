<script>
  import { kindLabel, sectionLabel, formatNumber } from '$lib/labels.js';
  import Frame from '$lib/site/Frame.svelte';
  import { photo, setLastRead, topicUrl, two, SHORT_DATE, STR } from '$lib/site/reel.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const L = $derived(STR[lang]);
  const s = $derived(data.story);
  const n = $derived(data.n);
  const next = $derived(data.next);
  const pic = $derived(photo(s));
  const tones = $derived.by(() => {
    let k = 0;
    return next.map((it) => (photo(it.story) ? 'ink' : k++ % 2 ? 'indigo' : 'ink'));
  });

  /* Only one element may hold the `hero` name at a time: this page's photo,
     or the frame the reader just picked below it. Resets on every story. */
  let picked = $derived.by(() => {
    void data.story.slug;
    return null;
  });

  $effect(() => {
    setLastRead(data.story.slug);
  });
</script>

<svelte:head>
  <title>{s.title} — Ground Truth</title>
  <meta name="description" content={s.dek} />
</svelte:head>

<main>
  <article>
    <header class="hero" class:pic={!!pic}>
      <div class="media" style:view-transition-name={picked ? null : 'hero'}>
        {#if pic}<img src={pic.src} srcset={pic.srcset} sizes="100vw" alt="" />{/if}
      </div>
      <div class="cap">
        <p class="code">
          <b class="n">{two(n, lang)}</b>
          <a class="sec" href={topicUrl(s.section, lang)}>{sectionLabel(s.section, lang)}</a>
          <span class="when">{SHORT_DATE[lang].format(s.date)} · {formatNumber(s.readTime, lang)} {L.min}</span>
        </p>
        <h1>{s.title}</h1>
      </div>
    </header>

    <div class="text">
      {#if s.dek}<p class="dek">{s.dek}</p>{/if}
      <p class="byline">
        <span>{kindLabel(s.kind, lang)}</span>
        <span>{#if data.writer}<a class="writer" href={data.writer}>{s.author}</a>{:else}{s.author}{/if}{s.authorTitle ? `, ${s.authorTitle}` : ''}</span>
        {#if s.location}<span>{s.location}</span>{/if}
      </p>
      <div class="body">{@html data.html}</div>
      {#if data.translated}
        <p class="other"><a href={data.alt[other]} hreflang={other} lang={other}>{L.readOther} →</a></p>
      {/if}
    </div>
  </article>

  <section class="next" aria-labelledby="next-h">
    <h2 id="next-h">{L.next} →</h2>
    <div class="strip">
      {#each next as item, i (item.story.slug)}
        <Frame
          tone={tones[i]}
          story={item.story}
          n={item.n}
          sizes="21rem"
          named={picked === item.story.slug}
          onpick={(slug) => (picked = slug)}
        />
      {/each}
    </div>
  </section>
</main>

<style>
  .hero {
    position: relative;
    height: min(62svh, 40rem);
    min-height: 22rem;
  }
  .hero.pic {
    height: min(94svh, 64vw);
    min-height: 26rem;
  }
  .media {
    position: absolute;
    inset: 0;
    background: var(--ink);
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cap {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 6rem var(--pad) clamp(1.5rem, 3vw, 3rem);
    color: var(--bg);
  }
  .pic .cap {
    color: #fff;
    background: linear-gradient(transparent, rgb(0 0 0 / 0.5) 35%, rgb(0 0 0 / 0.78));
  }
  /* Same three levels as the reel's cards: number, topic, then the details. */
  .code {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.4rem 0;
    margin: 0 0 1.25rem;
  }
  .n {
    margin-right: 0.6rem;
    font-size: 1.25rem;
    font-weight: 640;
    font-stretch: 75%;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--accent);
  }
  .sec {
    margin-right: 1.1rem;
    font-size: 0.875rem;
    font-weight: 540;
    line-height: 1;
    color: inherit;
    text-decoration: none;
  }
  .sec:hover,
  .sec:focus-visible {
    text-decoration: underline;
    outline: none;
  }
  .when {
    font: 400 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.7;
  }
  h1 {
    max-width: 15em;
    margin: 0;
    font-size: clamp(2.4rem, 0.9rem + 4.8vw, 6.25rem);
    font-weight: 620;
    font-stretch: 78%;
    line-height: 0.93;
    letter-spacing: -0.012em;
    text-wrap: balance;
  }
  h1:lang(bn) {
    line-height: 1.2;
    letter-spacing: 0;
  }

  .text {
    max-width: 40rem;
    margin: 0 auto;
    padding: clamp(2.5rem, 6vw, 4.5rem) var(--pad) 4rem;
    font-size: 1.125rem;
    line-height: 1.65;
  }
  .text:lang(bn) {
    line-height: 1.85;
  }
  .dek {
    margin: 0 0 1.75rem;
    font-size: clamp(1.3rem, 1rem + 0.8vw, 1.6rem);
    font-weight: 500;
    line-height: 1.35;
    letter-spacing: -0.01em;
  }
  .writer {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-underline-offset: 0.2em;
  }
  .byline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 1rem;
    margin: 0 0 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--line);
    font: 400 calc(0.6875rem * var(--k))/1.4 var(--mono);
    color: var(--mute);
  }
  .body :global(p) {
    margin: 0 0 1.1em;
  }
  .body :global(h2),
  .body :global(h3) {
    margin: 2em 0 0.5em;
    font-size: 1.125rem;
    font-weight: 620;
  }
  .body :global(blockquote) {
    margin: 2em 0;
    padding: 0;
    font-size: clamp(1.5rem, 1rem + 1.4vw, 2.1rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1.1;
    color: var(--indigo-ink);
  }
  .body :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.18em;
  }
  .other a {
    color: var(--accent-text);
  }
  .other {
    margin: 2.5rem 0 0;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
  }

  .next {
    padding: 2rem 0 3rem;
    border-top: 1px solid var(--line);
  }
  .next h2 {
    margin: 0 var(--pad) 1.25rem;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .strip {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 0 var(--pad) 1rem;
    scroll-snap-type: x proximity;
    scroll-padding: 0 var(--pad);
  }
  /* Same 5:7 cards as the reel: 28.25rem of card under a 1.75rem code line. */
  .strip :global(.frame) {
    height: 30rem;
    width: calc(28.25rem * 5 / 7);
    scroll-snap-align: start;
  }
</style>
