<script>
  /* One story in the reel: a photo with the headline over it, or, when there
     is no photo, a solid block of type. Width comes from the parent. The
     section in the code line is its own link, to that topic's reel. */
  import { base } from '$app/paths';
  import { sectionLabel, formatNumber } from '$lib/labels.js';
  import { photo, topicUrl, two, SHORT_DATE, STR } from './reel.js';

  let { story: s, n, lead = false, named = false, sizes = '100vw', topic = null, onpick } = $props();

  const lang = $derived(s.lang);
  const pic = $derived(photo(s));
</script>

<div class="frame" class:pic={!!pic} class:text={!pic} class:lead data-n={n}>
  <span class="code">
    <b class="n">{two(n, lang)}</b>
    {#if topic === s.section}
      <span class="sec">{sectionLabel(s.section, lang)}</span>
    {:else}
      <a class="sec" href={topicUrl(s.section, lang)}>{sectionLabel(s.section, lang)}</a>
    {/if}
    <span class="when">{SHORT_DATE[lang].format(s.date)} · {formatNumber(s.readTime, lang)} {STR[lang].min}</span>
  </span>
  <a class="box" href="{base}/new/{s.lang}/{s.slug}" draggable="false" onclick={() => onpick?.(s.slug)}>
    <span class="media" style:view-transition-name={named ? 'hero' : null}>
      {#if pic}
        <img
          src={pic.src}
          srcset={pic.srcset}
          sizes="(max-width: 759px) 84vw, {sizes}"
          alt=""
          loading={n <= 6 ? 'eager' : 'lazy'}
          draggable="false"
        />
      {/if}
    </span>
    {#if !pic}<span class="big" aria-hidden="true">{two(n, lang)}</span>{/if}
    <span class="cap">
      <span class="title">{s.title}</span>
      {#if s.dek}<span class="dek">{s.dek}</span>{/if}
      <span class="go">{STR[lang].read} →</span>
    </span>
  </a>
</div>

<style>
  .frame {
    flex: none;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  /* Three levels: the number anchors, the topic names the story, the date
     and length sit back at the far edge. */
  .code {
    display: flex;
    align-items: baseline;
    height: 1.75rem;
    white-space: nowrap;
  }
  .n {
    flex: none;
    margin-right: 0.55rem;
    font-size: 1.05rem;
    font-weight: 640;
    font-stretch: 75%;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--ink);
  }
  .lead .n {
    color: var(--accent);
  }
  .sec {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: calc(0.8125rem * var(--k));
    font-weight: 540;
    /* room above and below for Bangla vowel signs, which the ellipsis
       clipping would otherwise slice off */
    line-height: 1.6;
    color: var(--ink);
    text-decoration: none;
  }
  a.sec:hover,
  a.sec:focus-visible {
    color: var(--accent);
    outline: none;
  }
  .when {
    flex: none;
    margin-left: auto;
    padding-left: 1rem;
    font: 400 calc(0.625rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }

  /* Type inside the card is sized off the card (cqi = 1% of its width), so a
     card looks the same whether the window is wide, tall or a phone. */
  .box {
    container-type: inline-size;
    position: relative;
    display: block;
    flex: 1;
    overflow: hidden;
    border-radius: 3px;
    color: var(--ink);
    text-decoration: none;
    -webkit-user-drag: none;
  }
  .media {
    position: absolute;
    inset: 0;
    background: var(--card);
  }
  .text .media {
    background: var(--ink);
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .frame:hover img,
  .box:focus-visible img {
    transform: scale(1.045);
  }

  .big {
    position: absolute;
    top: 1rem;
    left: 1.25rem;
    font-size: clamp(4rem, 26cqi, 10rem);
    font-weight: 600;
    font-stretch: 75%;
    line-height: 0.8;
    letter-spacing: -0.02em;
    color: var(--bg);
    opacity: 0.16;
  }

  .cap {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 1.25rem 1.25rem 1.1rem;
  }
  .pic .cap {
    padding-top: 5rem;
    color: #fff;
    background: linear-gradient(transparent, rgb(0 0 0 / 0.55) 40%, rgb(0 0 0 / 0.78));
  }
  .text .cap {
    color: var(--bg);
  }

  .title {
    font-size: clamp(1.3rem, 7cqi, 3rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 0.98;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .lead .title {
    font-size: clamp(1.6rem, 7.6cqi, 4.5rem);
    line-height: 0.94;
  }
  .title:lang(bn) {
    line-height: 1.22;
    letter-spacing: 0;
  }
  .dek {
    max-width: 34em;
    margin-top: 0.8rem;
    font-size: clamp(0.875rem, 2.7cqi, 1.05rem);
    line-height: 1.42;
    opacity: 0.82;
  }
  .lead .dek {
    font-size: 1.05rem;
  }
  .go {
    margin-top: 1rem;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0;
    translate: 0 4px;
    transition:
      opacity 0.25s,
      translate 0.25s;
  }
  .frame:hover .go,
  .box:focus-visible .go {
    opacity: 1;
    translate: 0 0;
  }
  /* Held closer, a phone card wants its headline a notch larger. */
  @media (max-width: 759px) {
    .title {
      font-size: clamp(1.3rem, 8cqi, 2rem);
    }
    .lead .title {
      font-size: clamp(1.5rem, 9.2cqi, 2.4rem);
    }
  }
  .box:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
</style>
