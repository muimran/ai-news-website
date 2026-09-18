<script>
  import StoryCard from '$lib/components/StoryCard.svelte';
  import SignalBar from '$lib/components/SignalBar.svelte';
  import { formatNumber, homeUrl } from '$lib/content.js';
  import { t } from '$lib/i18n.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(t(lang));
</script>

<svelte:head>
  <title>{data.tag} — {lang === 'bn' ? 'গ্রাউন্ড ট্রুথ' : 'Ground Truth'}</title>
  <meta name="description" content="{L.filedUnder}: {data.tag}" />
</svelte:head>

<section class="topic-page shell">
  <nav class="crumb label" aria-label="Breadcrumb">
    <a href={homeUrl(lang)}>{lang === 'bn' ? 'গ্রাউন্ড ট্রুথ' : 'Ground Truth'}</a>
    <span class="sl">/</span> <span>{L.breadcrumbTopic}</span>
  </nav>

  <header class="head">
    <span class="label kicker">{L.filedUnder}</span>
    <h1>{data.tag}</h1>
    <p class="count label">
      {formatNumber(data.stories.length, lang)}
      {data.stories.length === 1 ? L.resultsOne : L.resultsMany}
      {L.inArchive}
    </p>
  </header>

  <SignalBar seed={data.tag} height={8} />

  {#if data.stories.length}
    <div class="grid">
      {#each data.stories as story}
        <StoryCard {story} variant="standard" {lang} />
      {/each}
    </div>
  {:else}
    <div class="empty">
      <p class="e-h">{L.noStoriesHead}</p>
      <p class="e-b">
        {L.noStoriesBody}
        <a href={homeUrl(lang)}>{L.frontPage}</a>.
      </p>
    </div>
  {/if}
</section>

<style>
  .topic-page {
    padding-block: clamp(1.5rem, 3vw, 2.5rem) var(--stack-lg);
  }
  .crumb {
    color: var(--mist);
    display: flex;
    gap: 0.5rem;
  }
  .crumb a:hover {
    color: var(--electric);
  }
  .sl {
    color: var(--rule-strong);
  }

  .head {
    padding-block: clamp(1.5rem, 3vw, 2.5rem) 1.5rem;
  }
  .kicker {
    color: var(--ember);
    display: block;
    margin-bottom: 0.8rem;
  }
  h1 {
    font-size: var(--t-mega);
  }
  .count {
    color: var(--mist);
    margin-top: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
    gap: clamp(1.5rem, 3vw, 2.75rem);
    padding-top: clamp(1.75rem, 3vw, 2.5rem);
  }

  .empty {
    padding-block: 4rem;
    max-width: 44ch;
  }
  .e-h {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--t-lg);
  }
  .e-b {
    font-family: var(--font-serif);
    color: var(--slate);
    margin-top: 0.75rem;
    line-height: 1.5;
  }
  .e-b a {
    color: var(--electric);
    border-bottom: 1px solid currentColor;
  }
</style>
