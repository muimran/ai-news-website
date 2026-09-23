<script>
  import { marked } from 'marked';
  import Halftone from '$lib/components/Halftone.svelte';
  import StoryCard from '$lib/components/StoryCard.svelte';
  import SignalBar from '$lib/components/SignalBar.svelte';
  import {
    sectionLabel,
    sectionSlug,
    liveSections,
    kindLabel,
    formatNumber,
    storyUrl,
    topicUrl,
    homeUrl
  } from '$lib/content.js';
  import { t } from '$lib/i18n.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(t(lang));
  const story = $derived(data.story);
  const twin = $derived(data.twin);
  const html = $derived(marked.parse(story.body, { mangle: false, headerIds: false }));

  /* Link the breadcrumb to the section only when the front page actually
     renders it. A lead story's own section is pulled from the section feed, so
     its anchor would not exist on the page we are sending the reader to. */
  const sectionHref = $derived(
    liveSections(lang).includes(story.section)
      ? `${homeUrl(lang)}#${sectionSlug(story.section)}`
      : homeUrl(lang)
  );
</script>

<svelte:head>
  <title>{story.title} — Ground Truth</title>
  <meta name="description" content={story.dek} />
</svelte:head>

<article class="story t-{story.template}">
  <div class="shell">
    <nav class="crumb label" aria-label="Breadcrumb">
      <a href={homeUrl(lang)}>{lang === 'bn' ? 'গ্রাউন্ড ট্রুথ' : 'Ground Truth'}</a>
      <span class="sl">/</span>
      <a href={sectionHref}>{sectionLabel(story.section, lang)}</a>
    </nav>

    <header class="head">
      <span class="label kind">{kindLabel(story.kind, lang)}</span>
      <h1>{story.title}</h1>
      <p class="dek lede">{story.dek}</p>

      {#if twin}
        <!-- the switch keeps the reader on this story rather than dropping
             them at a front page in the other language -->
        <a class="twin label" href={storyUrl(twin)} hreflang={twin.lang} lang={twin.lang}>
          {lang === 'bn' ? 'ইংরেজিতে পড়ুন' : 'বাংলায় পড়ুন'} →
        </a>
      {/if}

      <div class="meta">
        <div class="who">
          <p class="label by">{story.author}</p>
          {#if story.authorTitle}<p class="role">{story.authorTitle}</p>{/if}
        </div>
        <div class="when label">
          <time datetime={story.dateISO}>{story.dateLabel}</time>
          <span class="sl">/</span>{formatNumber(story.readTime, lang)} {L.readTime}
          {#if story.location}<span class="sl">/</span>{story.location}{/if}
        </div>
      </div>
    </header>
  </div>

  <div class="art-wrap">
    <div class="shell">
      <!-- same name as the card that linked here, so the browser morphs one
           into the other rather than cross-fading -->
      <div style="view-transition-name: art-{story.slug}">
        {#if story.image?.src}
          <img class="hero-img" src={story.image.src} alt={story.image.alt} />
        {:else}
          <Halftone seed={story.slug} ratio={0.42} />
        {/if}
      </div>
    </div>
  </div>

  <div class="shell">
    <div class="body-grid">
      <aside class="aside">
        <h2 class="label a-h">{L.filedUnder}</h2>
        <div class="tags">
          {#each story.tags as tag}
            <a class="tag label" href={topicUrl(tag, lang)}>{tag}</a>
          {/each}
        </div>
      </aside>

      <div class="prose">
        {@html html}
      </div>
    </div>

    {#if data.related.length}
      <section class="related" aria-labelledby="rel-h">
        <SignalBar seed={story.section} height={6} />
        <h2 class="rel-h" id="rel-h">{L.moreFrom} {sectionLabel(story.section, lang)}</h2>
        <div class="rel-grid">
          {#each data.related as s}
            <StoryCard story={s} variant="standard" {lang} inSection />
          {/each}
        </div>
      </section>
    {/if}
  </div>
</article>

<style>
  .story {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
  .crumb {
    color: var(--mist);
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .crumb a:hover {
    color: var(--electric);
  }
  .sl {
    color: var(--rule-strong);
  }

  .head {
    padding-block: clamp(1.25rem, 2.5vw, 2rem);
    max-width: 58rem;
  }
  .kind {
    color: var(--ember);
    display: block;
    margin-bottom: 0.9rem;
  }
  h1 {
    font-size: var(--t-mega);
    font-stretch: 105%;
  }
  .lede {
    margin-top: 1.1rem;
    font-size: clamp(1.125rem, 1.7vw, 1.5rem);
    max-width: 48ch;
  }

  .twin {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    margin-top: 1.1rem;
    padding: 0 0.85rem;
    background: var(--electric);
    color: #fff;
    letter-spacing: 0.06em;
    transition: background 0.2s;
  }
  .twin:hover {
    background: var(--ember);
    color: var(--navy);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.75rem;
    padding-top: 1rem;
    border-top: 2px solid var(--ink);
  }
  .by {
    color: var(--ink);
  }
  .role {
    font-family: var(--font-serif);
    font-size: 0.9375rem;
    color: var(--slate);
    margin-top: 0.25rem;
  }
  .when {
    color: var(--mist);
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .art-wrap {
    padding-block: clamp(1.25rem, 2.5vw, 2rem);
  }
  .hero-img {
    width: 100%;
    aspect-ratio: 2.38;
    object-fit: cover;
    background: var(--paper-3);
  }

  .body-grid {
    display: grid;
    grid-template-columns: var(--spine) minmax(0, 1fr);
    gap: clamp(1.5rem, 3.5vw, 3.5rem);
    padding-block: clamp(1.5rem, 3vw, 2.5rem) var(--stack-lg);
  }
  .aside {
    position: sticky;
    top: 7rem;
    align-self: start;
  }
  .a-h {
    color: var(--mist);
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 0.75rem;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .tag {
    border: 1px solid var(--rule-strong);
    color: var(--slate);
    padding: 0.35rem 0.6rem 0.3rem;
    transition: all 0.16s;
  }
  .tag:hover {
    background: var(--electric);
    border-color: var(--electric);
    color: #fff;
  }

  /* ---- long-form ---- */
  .prose {
    max-width: 38rem;
    font-family: var(--font-serif);
    font-size: 1.1875rem;
    line-height: var(--lh-body);
    color: var(--ink);
  }
  .prose :global(p) {
    margin-bottom: 1.35rem;
    text-wrap: pretty;
  }
  .prose :global(p:first-of-type) {
    font-size: 1.3125rem;
    line-height: var(--lh-body);
  }
  .prose :global(p:first-of-type::first-letter) {
    float: left;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 3.6em;
    line-height: 0.78;
    padding: 0.06em 0.12em 0 0;
    color: var(--electric);
  }
  .prose :global(h2) {
    font-family: var(--font-display);
    font-size: 1.5rem;
    margin: 2.5rem 0 0.9rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--rule);
  }
  .prose :global(blockquote) {
    margin: 2rem 0;
    padding-left: 1.25rem;
    border-left: 3px solid var(--ember);
    font-size: 1.4375rem;
    line-height: 1.38;
    font-style: italic;
    color: var(--slate);
  }

  .related {
    padding-bottom: var(--stack-lg);
  }
  .rel-h {
    font-size: var(--t-lg);
    margin: 1.5rem 0 1.5rem;
  }
  .rel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: clamp(1.25rem, 2.5vw, 2.25rem);
  }

  @media (max-width: 1080px) {
    .body-grid {
      grid-template-columns: 1fr;
    }
    .aside {
      position: static;
    }
  }

  /* ---- template: wide ----
     Photo essays and visual pieces. Sidebar drops below, prose runs broader. */
  .t-wide .body-grid {
    grid-template-columns: 1fr;
  }
  .t-wide .aside {
    position: static;
    display: flex;
    align-items: baseline;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .t-wide .a-h {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .t-wide .prose {
    max-width: 46rem;
  }

  /* ---- template: immersive ----
     Data investigations. Dark ground edge to edge; charts and custom
     components dropped into the body inherit this palette. */
  .t-immersive {
    background: var(--navy);
    color: var(--paper);
    margin-top: -1px;
    padding-top: clamp(2rem, 4vw, 3.5rem);
  }
  .t-immersive h1,
  .t-immersive .by {
    color: var(--paper);
  }
  .t-immersive .lede,
  .t-immersive .role {
    color: var(--peach);
  }
  .t-immersive .meta {
    border-top-color: var(--ember);
  }
  .t-immersive .crumb,
  .t-immersive .when {
    color: rgba(255, 194, 168, 0.65);
  }
  .t-immersive .prose {
    color: var(--paper);
    max-width: 42rem;
  }
  .t-immersive .prose :global(h2) {
    border-top-color: rgba(255, 194, 168, 0.28);
  }
  .t-immersive .prose :global(p:first-of-type::first-letter) {
    color: var(--ember);
  }
  .t-immersive .prose :global(blockquote) {
    color: var(--peach);
  }
  .t-immersive .a-h {
    color: rgba(255, 194, 168, 0.7);
    border-bottom-color: rgba(255, 194, 168, 0.25);
  }
  .t-immersive .tag {
    border-color: rgba(255, 194, 168, 0.4);
    color: var(--peach);
  }
  .t-immersive .tag:hover {
    background: var(--ember);
    border-color: var(--ember);
    color: var(--navy);
  }
</style>
