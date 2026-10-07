<script>
  /* The newsroom's own pages (About, the policies): read like a story, the
     text in the same centred reading column, closed back to wherever the
     reader came from. The menu is the one place that lists them all. */
  import { STR } from '$lib/site/reel.js';
  import GridPage from '../../../GridPage.svelte';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
</script>

<svelte:head>
  <title>{data.doc.title} — Second Order</title>
</svelte:head>

<GridPage {lang}>
  <div class="doc">
    <article class="text" {lang}>
      <div class="col">
        <h1>{data.doc.title}</h1>
        {#if data.doc.html}
          <div class="body">{@html data.doc.html}</div>
        {:else}
          <p class="soon">{L.soon}</p>
        {/if}
      </div>
    </article>
  </div>
</GridPage>

<style>
  .doc {
    min-height: 100%;
  }
  .text {
    padding: calc(3 * var(--u)) var(--in) calc(7 * var(--u));
    min-width: 0;
  }
  .col {
    max-width: 40rem;
    margin: 0 auto;
  }
  h1 {
    margin: 0 0 2rem;
    font-size: clamp(2.4rem, 1rem + 3.6vw, 5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.95;
    letter-spacing: -0.012em;
  }
  .text:lang(bn) h1 {
    line-height: 1.2;
    letter-spacing: 0;
  }
  .body {
    font-family: var(--read);
    font-size: 1.125rem;
    line-height: 1.75;
  }
  .text:lang(bn) .body {
    line-height: 1.85;
  }
  .body :global(p) {
    margin: 0 0 1.1em;
  }
  .body :global(h2),
  .body :global(h3) {
    font-family: var(--sans);
    margin: 2em 0 0.5em;
    font-size: 1.125rem;
    font-weight: 620;
  }
  .body :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--o);
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.18em;
  }
  .soon {
    color: var(--mute);
  }

  @media (max-width: 759px) {
    .text {
      padding: 1.5rem 1rem 3rem;
    }
    h1 {
      font-size: 2.3rem;
    }
  }
</style>
