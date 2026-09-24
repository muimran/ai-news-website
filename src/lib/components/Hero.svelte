<script>
  import StoryCard from './StoryCard.svelte';
  import Halftone from './Halftone.svelte';
  import { t } from '../i18n.js';

  let { lead, secondary, justIn = [], lang = 'en' } = $props();
  const L = $derived(t(lang));
</script>

<section class="hero shell" id="latest" aria-label="Today's newsroom">
  <!-- left spine: the running feed -->
  <aside class="rail" aria-label="Just in">
    <div class="rail-head">
      <h2 class="label rail-title">{L.justIn}</h2>
      <span class="pulse" aria-hidden="true"></span>
    </div>
    {#each justIn as story}
      <StoryCard {story} variant="list" showArt={false} showDek={false} {lang} />
    {/each}
    <a class="rail-more label" href="#tools">{L.allStories}</a>
  </aside>

  <!-- centre: the lead -->
  <div class="lead">
    {#if lead}<StoryCard story={lead} variant="lead" {lang} />{/if}
  </div>

  <!-- right: secondary + a contrasting block -->
  <div class="side">
    {#if secondary}<StoryCard story={secondary} variant="standard" showDek={false} {lang} />{/if}

    <div class="promo">
      <Halftone seed="promo-block-gt" ratio={0.44} />
      <div class="promo-body">
        <span class="label promo-kicker">{L.memberKicker}</span>
        <p class="promo-h">{L.memberLine}</p>
        <a class="promo-cta label" href="#newsletter">{L.memberCta}</a>
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    display: grid;
    grid-template-columns: 15.5rem minmax(0, 1.75fr) minmax(0, 0.92fr);
    gap: clamp(1.5rem, 3vw, 3.25rem);
    padding-top: clamp(1.75rem, 3.5vw, 3rem);
    padding-bottom: clamp(1.5rem, 2.5vw, 2.25rem);
    align-items: start;
  }

  /* ---- rail ---- */
  .rail {
    border-right: 1px solid var(--rule);
    padding-right: clamp(1rem, 1.8vw, 1.75rem);
  }
  .rail-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.9rem;
  }
  .rail-title {
    color: var(--ink);
  }
  .pulse {
    width: 7px;
    height: 7px;
    background: var(--ember);
    border-radius: 50%;
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.35;
      transform: scale(0.72);
    }
  }
  .rail-more {
    display: flex;
    align-items: center;
    min-height: var(--tap);
    margin-top: 1.1rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--rule);
    color: var(--electric);
    width: 100%;
  }
  .rail-more:hover {
    color: var(--ember);
  }

  /* ---- side column ---- */
  .side {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 2.5vw, 2.25rem);
  }

  .promo {
    background: var(--navy);
    color: var(--paper);
    display: flex;
    flex-direction: column;
  }
  .promo-body {
    padding: 1.15rem 1.25rem 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
  .promo-kicker {
    color: var(--ember);
  }
  .promo-h {
    font-family: var(--font-serif);
    font-size: 1.1875rem;
    line-height: 1.32;
    color: var(--peach);
    text-wrap: pretty;
  }
  .promo-cta {
    display: inline-flex;
    align-items: flex-end;
    min-height: 2.75rem;
    color: var(--paper);
    border-bottom: 1.5px solid var(--ember);
    align-self: flex-start;
    padding-bottom: 0.2rem;
    transition: color 0.18s;
  }
  .promo-cta:hover {
    color: var(--ember);
  }

  /* ---- reflow ---- */
  @media (max-width: 1180px) {
    .hero {
      grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
      grid-template-areas:
        'lead side'
        'rail rail';
    }
    .lead {
      grid-area: lead;
    }
    .side {
      grid-area: side;
    }
    .rail {
      grid-area: rail;
      border-right: none;
      border-top: 2px solid var(--ink);
      padding-right: 0;
      padding-top: 1.25rem;
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 0 clamp(1.25rem, 2.5vw, 2.5rem);
    }
    .rail-head {
      grid-column: 1 / -1;
    }
    .rail-more {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 760px) {
    .hero {
      grid-template-columns: 1fr;
      grid-template-areas:
        'lead'
        'side'
        'rail';
      gap: 2.25rem;
    }
    .rail {
      grid-template-columns: 1fr;
    }
  }
</style>
