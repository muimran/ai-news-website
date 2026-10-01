<script>
  /* A page that scrolls down, for finding or reading rather than browsing.
     The table stays put as on a reel, header row above and topics row
     below; the page scrolls down inside the frame between them. On a story
     (`reading`), once the reader is past the photo the topics row lowers
     out of sight, and comes back at the top. */
  import { afterNavigate } from '$app/navigation';
  import BottomRow from './BottomRow.svelte';
  import { ui } from './ui.svelte.js';

  /* `foot`: the topics row; a story goes without it and runs to the foot */
  let { lang, section = null, reading = false, foot = true, children } = $props();
  let el = $state();

  // a new page starts at its top, everything showing
  afterNavigate(() => {
    if (el) el.scrollTop = 0;
    ui.reading = false;
    ui.deep = false;
    ui.up = false;
    last = 0;
    ui.pin = false;
  });

  let last = 0;
  function scrolled() {
    if (!reading) return;
    // which way: any real move up brings the header back, down sends it off
    const d = el.scrollTop - last;
    if (Math.abs(d) > 6) {
      ui.up = d < 0;
      last = el.scrollTop;
    }
    const deep = el.scrollTop > 160;
    if (deep !== ui.reading) ui.reading = deep;
    // where the header leaves and the facts fold, together
    const deeper = el.scrollTop > 340;
    if (deeper !== ui.deep) ui.deep = deeper;
  }
</script>

<main class="page" class:footless={!foot} bind:this={el} onscroll={scrolled}>{@render children()}</main>
{#if foot}<BottomRow {lang} {section} />{/if}

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
    /* its width, for anything inside that runs edge to edge (a story's wide photos) */
    container-type: inline-size;
    transition:
      left 0.4s cubic-bezier(0.3, 0.7, 0.1, 1),
      top 0.5s cubic-bezier(0.45, 0, 0.2, 1),
      bottom 0.4s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  /* reading: the story takes the topics row's place and the header's; the
     header, when it comes back, lies over the top of it */
  :global(.g.reading) .page,
  .footless {
    bottom: var(--mv);
  }
  :global(.g.far) .page {
    top: var(--mv);
  }
  @media (prefers-reduced-motion: reduce) {
    .page {
      transition: none;
    }
  }
</style>
