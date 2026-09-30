<script>
  /* One story in the reel: a photo with the headline over it, or, when there
     is no photo, a plain card in one of two tones (`tone`: 'ink' or 'indigo',
     alternated by the parent so two never sit side by side in the same
     tone). Headlines sit at the same size and place on every card, so they
     line up along the reel. Width comes from the parent. The section in the
     code line is its own link, and so is the format pill (Investigation,
     Interview); each is left out on that topic's or format's own page.
     `size` 'half': half the height, stacked with another on a section's
     reel; the photo is cropped wide and the summary left out. */
  import { base } from '$app/paths';
  import { sectionLabel, kindLabel, formatNumber, FORMATS } from '$lib/labels.js';
  import { photo, topicUrl, formatUrl, two, SHORT_DATE, STR } from './reel.js';

  let { story: s, n, tone = 'ink', size = 'story', named = false, sizes = '100vw', topic = null, format = null, onpick } = $props();

  const lang = $derived(s.lang);
  const half = $derived(size === 'half');
  const pic = $derived(photo(s));
</script>

<div
  class="frame"
  class:pic={!!pic}
  class:text={!pic}
  class:indigo={!pic && tone === 'indigo'}
  class:half
  data-n={n}
>
  <span class="code">
    <b class="n">{two(n, lang)}</b>
    <!-- left out on the topic's own page, where every card would repeat it -->
    {#if topic !== s.section}
      <a class="sec" href={topicUrl(s.section, lang)}>{sectionLabel(s.section, lang)}</a>
    {/if}
    <span class="when">{SHORT_DATE[lang].format(s.date)} · {formatNumber(s.readTime, lang)} {STR[lang].min}</span>
  </span>
  <div class="card">
    <a class="box" href="{base}/{s.lang}/{s.slug}" draggable="false" onclick={() => onpick?.(s.slug)}>
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
      <span class="cap">
        <span class="title">{s.title}</span>
        {#if s.dek && !half}<span class="dek">{s.dek}</span>{/if}
        {#if s.author}<span class="by">{s.author}</span>{/if}
        <span class="go">{STR[lang].read} →</span>
      </span>
    </a>
    <!-- outside the story link, since a link can't hold another -->
    {#if FORMATS[s.kind] && format !== s.kind}
      <a class="tag" href={formatUrl(s.kind, lang)} draggable="false">{kindLabel(s.kind, lang)}</a>
    {/if}
  </div>
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
    font-size: 1rem;
    font-weight: 640;
    font-stretch: 75%;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    /* every card's number carries the accent, so the brand colour runs
       through the whole reel, not just its first card */
    color: var(--accent-text);
  }
  .sec {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: calc(0.875rem * var(--k));
    font-weight: 540;
    /* room above and below for Bangla vowel signs, which the ellipsis
       clipping would otherwise slice off */
    line-height: 1.6;
    color: var(--ink);
    text-decoration: none;
  }
  a.sec:hover,
  a.sec:focus-visible {
    color: var(--accent-text);
    outline: none;
  }
  .when {
    flex: none;
    margin-left: auto;
    padding-left: 1rem;
    font: 400 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }

  /* Type inside the card is sized off the card (cqi = 1% of its width), so a
     card looks the same whether the window is wide, tall or a phone. */
  .card {
    position: relative;
    display: flex;
    flex: 1;
  }
  .box {
    container-type: inline-size;
    position: relative;
    display: block;
    flex: 1;
    overflow: hidden;
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
  .indigo .media {
    background: var(--indigo);
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

  /* Formats worth browsing carry an indigo pill that opens all of them. */
  .tag {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 1;
    padding: 0.4rem 0.6rem;
    border-radius: 999px;
    background: var(--indigo);
    color: #fff;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .indigo .tag {
    background: #111;
  }
  a.tag:hover,
  a.tag:focus-visible {
    background: #fff;
    color: #111;
    outline: none;
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
  .indigo .cap {
    color: var(--indigo-text);
  }

  .title {
    font-size: clamp(1.3rem, 7cqi, 3rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 0.98;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .title:lang(bn) {
    line-height: 1.22;
    letter-spacing: 0;
  }
  .dek {
    max-width: 34em;
    margin-top: 0.8rem;
    font-size: 0.875rem;
    line-height: 1.42;
    opacity: 0.82;
  }
  /* The byline: who reported it, under the summary on every card. */
  .by {
    margin-top: 0.75rem;
    font: 500 calc(0.6875rem * var(--k))/1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.8;
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
  /* A half card's headline sits a notch below a full card's, to fit. */
  .half .title {
    font-size: clamp(1.15rem, 5.6cqi, 2.2rem);
  }
  .half .cap {
    padding: 1rem 1.1rem 0.95rem;
  }
  .half.pic .cap {
    padding-top: 3rem;
  }
  .half .by {
    margin-top: 0.6rem;
  }
  /* Held closer, a phone card wants its headline a notch larger. */
  @media (max-width: 759px) {
    .title {
      font-size: clamp(1.3rem, 8cqi, 2rem);
    }
    .half .title {
      font-size: clamp(1.1rem, 7cqi, 1.6rem);
    }
  }
  .box:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
</style>
