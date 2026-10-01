<script>
  /* A page of lists, for finding rather than browsing. The table stays put
     as on a reel, header row above and topics row below; the page scrolls
     down inside the frame between them. */
  import BottomRow from './BottomRow.svelte';

  let { lang, section = null, children } = $props();
</script>

<main class="page">{@render children()}</main>
<BottomRow {lang} {section} />

<style>
  .page {
    position: fixed;
    top: calc(var(--mv) + var(--top));
    left: var(--m);
    right: var(--m);
    bottom: calc(var(--mv) + var(--bot));
    overflow-y: auto;
    overscroll-behavior: contain;
    box-sizing: border-box;
    border-left: var(--frame) solid var(--rule);
    border-right: var(--frame) solid var(--rule);
    scrollbar-width: thin;
  }
</style>
