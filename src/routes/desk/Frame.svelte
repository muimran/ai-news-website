<script>
  /* A Desk page that isn't the front: what the page is down the left (its
     name, its count, its tools), held there while its contents scroll
     beside it, the way the front's index is. Narrower, it sits on top. */
  let { side, children } = $props();
</script>

<div class="frame">
  <aside class="side">{@render side()}</aside>
  <main class="main">{@render children()}</main>
</div>

<style>
  .frame {
    display: grid;
    grid-template-columns: 17rem minmax(0, 1fr);
    align-items: start;
  }
  .side {
    position: sticky;
    top: var(--bar);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: calc(100dvh - var(--bar));
    overflow-y: auto;
    scrollbar-width: none;
    padding: 1.5rem 0 1.5rem var(--pad);
  }
  .main {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 74rem;
    min-height: calc(100dvh - var(--bar) - 8rem);
    padding: 1.5rem var(--pad) 0 1.75rem;
  }
  @media (max-width: 1099px) {
    .frame {
      grid-template-columns: minmax(0, 1fr);
    }
    .side {
      position: static;
      max-height: none;
      padding: 1.25rem var(--pad) 0;
    }
    .main {
      max-width: none;
      min-height: 0;
      padding: 1.25rem var(--pad) 0;
    }
  }
</style>
