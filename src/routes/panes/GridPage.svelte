<script>
  /* A page that scrolls down, for finding or reading rather than browsing.
     The table stays put as on a reel, header row above and topics row
     below; the page scrolls down inside the frame between them. On a story
     (`reading`), once the reader is past the photo the topics row lowers
     out of sight, and comes back at the top. */
  import { afterNavigate } from '$app/navigation';
  import BottomRow from './BottomRow.svelte';
  import { ui } from './ui.svelte.js';

  let { lang, section = null, reading = false, children } = $props();
  let el = $state();

  // a new page starts at its top, everything showing
  afterNavigate(() => {
    if (el) el.scrollTop = 0;
    ui.reading = false;
    ui.pin = false;
  });

  function scrolled() {
    if (!reading) return;
    const deep = el.scrollTop > 160;
    if (deep !== ui.reading) ui.reading = deep;
  }
</script>

<main class="page" bind:this={el} onscroll={scrolled}>{@render children()}</main>
<BottomRow {lang} {section} />

<style>
  .page {
    position: fixed;
    top: calc(var(--mv) + var(--top));
    left: calc(var(--m) + var(--side));
    right: var(--m);
    bottom: calc(var(--mv) + var(--bot));
    overflow-y: auto;
    overscroll-behavior: contain;
    box-sizing: border-box;
    border-right: var(--frame) solid var(--rule);
    scrollbar-width: thin;
    transition:
      left 0.4s cubic-bezier(0.3, 0.7, 0.1, 1),
      bottom 0.4s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  /* reading: the story takes the topics row's place */
  :global(.g.reading) .page {
    bottom: var(--mv);
  }
  @media (prefers-reduced-motion: reduce) {
    .page {
      transition: none;
    }
  }
</style>
