<script>
  import StoryCard from './StoryCard.svelte';
  import SignalBar from './SignalBar.svelte';
  import { sectionSlug, sectionLabel, formatNumber } from '../content.js';
  import { t } from '../i18n.js';

  /** pattern: 'a' spine+lead | 'b' three across | 'c' inverted band */
  let { title, stories = [], pattern = 'a', blurb = '', lang = 'en' } = $props();

  const L = $derived(t(lang));
  /* the slug stays English so section anchors are stable across both desks */
  const slug = $derived(sectionSlug(title));
  const label = $derived(sectionLabel(title, lang));
  const lead = $derived(stories[0]);
  const rest = $derived(stories.slice(1));
</script>

<section class="topic p-{pattern}" id={slug} aria-labelledby="{slug}-h">
  <div class="shell">
    <SignalBar seed={title} height={4} {stories} {lang} />

    <div class="grid">
      <header class="spine">
        <h2 class="s-title" id="{slug}-h">
          <a href="#{slug}">{label} <span class="arrow" aria-hidden="true">→</span></a>
        </h2>
        {#if blurb}<p class="s-blurb">{blurb}</p>{/if}
        <span class="s-count label"
          >{formatNumber(stories.length, lang)}
          {stories.length === 1 ? L.resultsOne : L.resultsMany}</span
        >
      </header>

      {#if pattern === 'b'}
        <div class="across">
          {#each stories.slice(0, 3) as story}
            <StoryCard {story} variant="standard" showDek={false} {lang} inSection />
          {/each}
        </div>
      {:else if pattern === 'c'}
        <div class="band">
          {#if lead}<StoryCard story={lead} variant="feature" showDek={false} {lang} inSection />{/if}
          <div class="band-rest">
            {#each rest.slice(0, 3) as story}
              <StoryCard {story} variant="compact" showDek={false} {lang} inSection />
            {/each}
          </div>
        </div>
      {:else}
        <div class="flow">
          {#if lead}<StoryCard story={lead} variant="feature" showDek={false} {lang} inSection />{/if}
          <div class="supporting">
            {#each rest.slice(0, 3) as story, i}
              <StoryCard {story} variant="compact" showDek={false} {lang} inSection />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .topic {
    padding-block: var(--stack-lg) 0;
  }

  .grid {
    display: grid;
    /* wider than the article spine: the section name is now the biggest type
       in the block and needs the room */
    grid-template-columns: 17rem minmax(0, 1fr);
    gap: clamp(1.5rem, 3.5vw, 3.5rem);
    padding-top: clamp(1.5rem, 2.5vw, 2.25rem);
  }

  /* ---- spine ---- */
  .spine {
    position: sticky;
    top: 7rem;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    container-type: inline-size;
  }
  /* Capped against the column's own width (cqi) so the longest single word in
     any section name — "Infrastructure" — never overflows the column, navy
     padding included. */
  .s-title {
    font-size: min(clamp(1.375rem, 1rem + 1.1vw, 1.75rem), 11.5cqi);
    line-height: var(--lh-display);
  }
  .s-title a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    transition: color 0.2s;
  }
  .s-title a:hover {
    color: var(--electric);
  }
  .arrow {
    color: var(--ember);
    display: inline-block;
    transition: transform 0.25s var(--ease);
  }
  .s-title a:hover .arrow {
    transform: translateX(5px);
  }
  .s-blurb {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    line-height: var(--lh-prose);
    color: var(--slate);
    max-width: 26ch;
  }
  .s-count {
    color: var(--mist);
  }

  /* ---- pattern a: lead + supporting ---- */
  .flow {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 3rem);
  }
  .supporting {
    display: flex;
    flex-direction: column;
    gap: 1.65rem;
  }

  /* ---- pattern b: three across ---- */
  .across {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(1.25rem, 2.5vw, 2.25rem);
  }

  /* ---- pattern c: the navy spine ----
     This used to be a full-bleed navy band. Now only the title column is
     navy, inside the page margins, running the full height of the section;
     the stories sit on paper beside it. Still marks the section as the
     special one, without a wall of colour across the screen. --band and
     --band-ink resolve per theme. */
  .p-c .spine {
    background: var(--band);
    color: var(--band-ink);
    padding: 1.25rem;
    align-self: stretch;
    position: static;
  }
  .p-c .s-blurb {
    color: var(--peach);
  }
  .p-c .s-count {
    color: rgba(255, 194, 168, 0.6);
  }
  .p-c .s-title a:hover {
    color: var(--ember);
  }
  .band {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 3rem);
  }
  .band-rest {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
  }

  /* ---- reflow ---- */
  @media (max-width: 1080px) {
    .grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .spine {
      position: static;
      flex-direction: row;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid currentColor;
    }
    .s-blurb {
      max-width: none;
      flex: 1 1 18rem;
    }
    .p-c .spine {
      border-bottom: none;
      padding: 1rem 1.1rem;
    }
    .across {
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    }
  }
  @media (max-width: 800px) {
    .flow,
    .band {
      grid-template-columns: 1fr;
    }
  }
</style>
