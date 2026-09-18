<script>
  import { search, allTags, storyUrl, sectionLabel, formatNumber } from '../content.js';
  import { t } from '../i18n.js';

  let { open = false, onclose, lang = 'en' } = $props();

  const L = $derived(t(lang));
  const tagPool = $derived(allTags(lang));

  let query = $state('');
  let active = $state([]);
  let input = $state(null);
  let thinking = $state(false);

  const results = $derived(search(query, { tags: active, lang }));

  function toggleTag(tag) {
    active = active.includes(tag) ? active.filter((t) => t !== tag) : [...active, tag];
  }

  function reset() {
    query = '';
    active = [];
  }

  /* brief settle state so fast typing doesn't flash "nothing found" */
  let timer;
  $effect(() => {
    query;
    active;
    thinking = true;
    clearTimeout(timer);
    timer = setTimeout(() => (thinking = false), 140);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => input?.focus());
    } else {
      document.body.style.overflow = '';
    }
  });
</script>

<svelte:window on:keydown={(e) => open && e.key === 'Escape' && onclose?.()} />

{#if open}
  <div class="scrim" role="dialog" aria-modal="true" aria-label={L.searchStories}>
    <div class="panel">
      <div class="shell">
        <div class="row">
          <label for="q" class="label lbl">{L.search}</label>
          <input
            id="q"
            bind:this={input}
            bind:value={query}
            type="search"
            placeholder={L.searchPlaceholder}
            autocomplete="off"
          />
          <button class="close" onclick={() => onclose?.()} aria-label={L.closeMenu}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="tags" role="group" aria-label={L.filterByTopic}>
          {#each tagPool as tag}
            <button
              class="tag label"
              class:on={active.includes(tag)}
              aria-pressed={active.includes(tag)}
              onclick={() => toggleTag(tag)}>{tag}</button
            >
          {/each}
          {#if active.length || query}
            <button class="tag label clear" onclick={reset}>{L.clearAll}</button>
          {/if}
        </div>

        <div class="meta label">
          {#if thinking}
            {L.searching}
          {:else}
            {formatNumber(results.length, lang)}
            {results.length === 1 ? L.resultsOne : L.resultsMany}
          {/if}
        </div>

        <div class="results">
          {#if !thinking && results.length === 0}
            <div class="empty">
              <p class="empty-h">{L.emptyHead}</p>
              <p class="empty-b">{L.emptyBody}</p>
              <button class="label reset-btn" onclick={reset}>{L.resetSearch}</button>
            </div>
          {:else}
            {#each results.slice(0, 24) as story}
              <a class="hit" href={storyUrl(story)} onclick={() => onclose?.()}>
                <span class="hit-sec label">{sectionLabel(story.section, lang)}</span>
                <span class="hit-title">{story.title}</span>
                <span class="hit-meta label"
                  >{story.author} · {formatNumber(story.readTime, lang)} {L.minRead}</span
                >
              </a>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: color-mix(in srgb, var(--navy) 72%, transparent);
    backdrop-filter: blur(2px);
    animation: fade 0.2s var(--ease);
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  .panel {
    background: var(--paper);
    border-bottom: 3px solid var(--electric);
    max-height: 92vh;
    overflow-y: auto;
    padding-block: clamp(1.25rem, 3vw, 2.25rem) 2.5rem;
    animation: drop 0.3s var(--ease);
  }
  @keyframes drop {
    from {
      transform: translateY(-2%);
      opacity: 0;
    }
  }

  .row {
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 0.75rem;
  }
  .lbl {
    color: var(--ember);
  }
  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: none;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 700;
    font-stretch: 106%;
    font-size: clamp(1.375rem, 4vw, 2.5rem);
    letter-spacing: -0.026em;
    outline: none;
  }
  input::placeholder {
    color: var(--mist);
  }
  input::-webkit-search-cancel-button {
    display: none;
  }
  .close {
    color: var(--ink);
    flex-shrink: 0;
  }
  .close:hover {
    color: var(--electric);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1.1rem;
  }
  .tag {
    border: 1px solid var(--rule-strong);
    color: var(--slate);
    padding: 0.42rem 0.7rem 0.38rem;
    transition: all 0.16s;
  }
  .tag:hover {
    border-color: var(--ink);
    color: var(--ink);
  }
  .tag.on {
    background: var(--electric);
    border-color: var(--electric);
    color: #fff;
  }
  .tag.clear {
    border-style: dashed;
    color: var(--ember);
    border-color: var(--ember);
  }

  .meta {
    margin-top: 1.25rem;
    color: var(--mist);
  }

  .results {
    margin-top: 0.5rem;
  }
  .hit {
    display: grid;
    grid-template-columns: 11rem 1fr auto;
    gap: 1.25rem;
    align-items: baseline;
    padding-block: 0.85rem;
    border-top: 1px solid var(--rule);
  }
  .hit:hover {
    background: var(--paper-2);
  }
  .hit-sec {
    color: var(--electric);
  }
  .hit-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-stretch: 104%;
    font-size: var(--t-md);
    line-height: var(--lh-display-sm);
    letter-spacing: var(--track-display);
  }
  .hit:hover .hit-title {
    color: var(--electric);
  }
  .hit-meta {
    color: var(--mist);
    white-space: nowrap;
  }
  @media (max-width: 760px) {
    .hit {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }
  }

  .empty {
    padding: 3rem 0 2rem;
    max-width: 44ch;
  }
  .empty-h {
    font-family: var(--font-display);
    font-weight: 800;
    font-stretch: 106%;
    font-size: var(--t-lg);
    letter-spacing: -0.02em;
  }
  .empty-b {
    font-family: var(--font-serif);
    color: var(--slate);
    margin-top: 0.6rem;
    line-height: 1.5;
  }
  .reset-btn {
    margin-top: 1.25rem;
    background: var(--ink);
    color: var(--paper);
    padding: 0.65rem 1.1rem 0.6rem;
  }
  .reset-btn:hover {
    background: var(--electric);
  }
</style>
