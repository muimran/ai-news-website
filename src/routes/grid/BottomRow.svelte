<script>
  /* The table's foot, the same on every page: every topic in a cell of its
     own, the one you're in filled pale orange, and on a reel the counter in
     the last cell. Fixed, like the header row; only what's between them
     moves. */
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { sectionLabel } from '$lib/labels.js';
  import { two, STR } from '$lib/site/reel.js';
  import Mark from './Mark.svelte';
  import { gridTopic } from './grid.js';

  /* `fixed`: held at the screen's foot (reels, lists); off, it closes the
     frame round the end of a story instead */
  let { lang, section = null, n = null, total = null, fixed = true } = $props();
  const L = $derived(STR[lang]);
  let shelf = $state();

  // on a phone the row scrolls: bring the current topic into view
  onMount(() => {
    const cur = shelf?.querySelector('[aria-current]');
    if (cur && matchMedia('(max-width: 759px)').matches)
      shelf.scrollLeft = cur.offsetLeft - (shelf.clientWidth - cur.offsetWidth) / 2;
  });
</script>

<div class="bottom" class:fixed>
  <nav class="shelf" aria-label={L.topics} bind:this={shelf}>
    {#each page.data?.topics ?? [] as tp (tp.key)}
      <a
        class="tp fill"
        href={gridTopic(tp.key, lang)}
        aria-current={section === tp.key ? 'page' : undefined}
        draggable="false"><Mark key={tp.key} /><span>{sectionLabel(tp.key, lang)}</span></a
      >
    {/each}
  </nav>
  {#if total}<span class="count"><b>{two(n || 1, lang)}</b>&nbsp;/ {two(total, lang)}</span>{/if}
</div>

<style>
  .bottom {
    display: flex;
    box-sizing: border-box;
    height: var(--bot);
    border-top: var(--line) solid var(--rule);
    background: var(--paper);
  }
  .fixed {
    position: fixed;
    z-index: 10;
    left: var(--m);
    right: var(--m);
    bottom: var(--mv);
    border: var(--frame) solid var(--rule);
    border-top-width: var(--line);
    border-bottom: 0;
  }
  .shelf {
    flex: 1;
    display: flex;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .shelf::-webkit-scrollbar {
    display: none;
  }
  .tp {
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0 var(--u);
    border-right: 1px solid var(--hair);
    color: var(--ink);
    text-decoration: none;
    font-size: calc(1rem * var(--k));
    font-weight: 600;
    font-stretch: 85%;
    white-space: nowrap;
  }
  .tp:last-child {
    border-right: 0;
  }
  .tp[aria-current='page'] {
    background: var(--o3);
    color: var(--o-text);
  }
  /* a laptop's narrower table: the names a step down, so all six fit */
  @media (max-width: 1400px) {
    .tp {
      padding: 0 var(--u);
      font-size: calc(0.875rem * var(--k));
    }
  }
  .count {
    flex: none;
    display: flex;
    align-items: center;
    padding: 0 var(--in);
    border-left: 1px solid var(--hair);
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    color: var(--mute);
  }
  .count b {
    font-weight: 500;
    color: var(--o-text);
  }

  @media (max-width: 759px) {
    .count {
      order: -1;
      padding: 0 var(--u);
      border-left: 0;
      border-right: 1px solid var(--hair);
    }
    .tp {
      padding: 0 var(--u);
      font-size: calc(0.875rem * var(--k));
      font-weight: 500;
    }
    .tp[aria-current='page'] {
      font-weight: 600;
    }
  }
</style>
