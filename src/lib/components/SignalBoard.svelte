<script>
  import { RADAR_FILTERS, radar, kindLabel, formatNumber } from '../content.js';
  import { storyUrl } from '../content.js';
  import { t } from '../i18n.js';

  let { lang = 'en' } = $props();
  const L = $derived(t(lang));

  let active = $state('week');
  let track = $state(null);

  const items = $derived(radar(active, lang));

  function scrollBy(dir) {
    if (!track) return;
    const card = track.querySelector('.rcard');
    const step = card ? card.offsetWidth + 20 : 360;
    track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }

  /* left/right arrows move through the board when focus is inside it */
  function onKey(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollBy(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollBy(-1);
    }
  }
</script>

<section class="board" id="tools" aria-labelledby="board-h">
  <div class="shell">
    <header class="b-head">
      <div>
        <span class="label b-kicker">{L.radarKicker}</span>
        <h2 class="b-title" id="board-h">{L.radarTitle}</h2>
      </div>

      <div class="b-controls">
        <div class="filters" role="group" aria-label={L.radarFilter}>
          {#each RADAR_FILTERS as f}
            <button
              class="filter label"
              class:on={active === f.id}
              aria-pressed={active === f.id}
              onclick={() => (active = f.id)}>{f[lang] || f.en}</button
            >
          {/each}
        </div>
        <div class="arrows">
          <button class="arrow" onclick={() => scrollBy(-1)} aria-label={L.radarLeft}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="arrow" onclick={() => scrollBy(1)} aria-label={L.radarRight}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    {#if items.length === 0}
      <p class="b-empty">
        {L.radarEmpty} <strong>{RADAR_FILTERS[1][lang] || RADAR_FILTERS[1].en}</strong>.
      </p>
    {:else}
      <!-- a scrollable region is focusable by design, so arrow keys work
           once the board has focus -->
      <div
        class="track"
        bind:this={track}
        onkeydown={onKey}
        tabindex="0"
        role="region"
        aria-label={L.radarRegion}
      >
        <ul class="rail">
          {#each items as story, i}
            <li class="rcard">
              <a href={storyUrl(story)}>
                <span class="r-num label">{formatNumber(i + 1, lang)}</span>
                <span class="r-kind label">{kindLabel(story.kind, lang)}</span>
                <h3 class="r-title">{story.title}</h3>
                <p class="r-meta label">
                  {story.author} · {formatNumber(story.readTime, lang)} {L.minRead}
                </p>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</section>

<style>
  .board {
    background: var(--electric);
    color: #fff;
    padding-block: clamp(2.75rem, 5.5vw, 5rem);
    margin-top: var(--stack-lg);
    overflow: hidden;
  }

  .b-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem 2rem;
    flex-wrap: wrap;
    padding-bottom: clamp(1.5rem, 2.5vw, 2.25rem);
  }
  .b-kicker {
    color: var(--ember);
    display: block;
    margin-bottom: 0.6rem;
  }
  .b-title {
    font-size: clamp(1.75rem, 3.6vw, 3rem);
    color: #fff;
  }

  .b-controls {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .filter {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    border: 1px solid rgba(255, 255, 255, 0.42);
    color: rgba(255, 255, 255, 0.85);
    padding: 0.5rem 0.95rem 0.45rem;
    transition: all 0.16s;
  }
  .filter:hover {
    border-color: #fff;
    color: #fff;
  }
  .filter.on {
    background: var(--ember);
    border-color: var(--ember);
    color: var(--navy);
  }
  .arrows {
    display: flex;
    gap: 0.4rem;
  }
  .arrow {
    display: grid;
    place-items: center;
    width: var(--tap);
    height: var(--tap);
    border: 1px solid rgba(255, 255, 255, 0.42);
    color: #fff;
    transition: all 0.16s;
  }
  .arrow:hover {
    background: #fff;
    color: var(--electric);
    border-color: #fff;
  }

  .track {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: var(--ember) transparent;
    padding-bottom: 1.25rem;
  }
  .track:focus-visible {
    outline: 2px solid var(--ember);
    outline-offset: 4px;
  }
  .track::-webkit-scrollbar {
    height: 3px;
  }
  .track::-webkit-scrollbar-thumb {
    background: var(--ember);
  }
  .rail {
    display: flex;
    gap: 1.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rcard {
    flex: 0 0 clamp(15rem, 25vw, 20rem);
    scroll-snap-align: start;
  }
  .rcard a {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    height: 100%;
    padding: 1.15rem 1.15rem 1.35rem;
    background: rgba(255, 255, 255, 0.07);
    border-top: 2px solid rgba(255, 255, 255, 0.35);
    transition: background 0.22s var(--ease), border-color 0.22s, transform 0.22s var(--ease);
  }
  .rcard a:hover,
  .rcard a:focus-visible {
    background: rgba(255, 255, 255, 0.14);
    border-top-color: var(--ember);
    transform: translateY(-3px);
  }
  .r-num {
    color: var(--ember);
  }
  .r-kind {
    color: rgba(255, 255, 255, 0.72);
  }
  .r-title {
    font-size: 1.1875rem;
    line-height: var(--lh-display-sm);
    color: #fff;
    margin-top: 0.1rem;
  }
  .r-meta {
    color: rgba(255, 255, 255, 0.6);
    margin-top: auto;
    padding-top: 0.75rem;
    letter-spacing: 0.08em;
  }

  .b-empty {
    font-family: var(--font-serif);
    font-size: var(--t-md);
    color: var(--peach);
    padding-block: 2rem 3rem;
  }
  .b-empty strong {
    color: #fff;
  }
</style>
