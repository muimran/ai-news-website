<script>
  /* The newsroom's own pages (About, the policies): built like a story. The
     picture column lists them all, the one open marked; beside it the text
     in the same centred reading column. */
  import { page } from '$app/state';
  import { STR } from '$lib/site/reel.js';
  import GridPage from '../../../GridPage.svelte';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
</script>

<svelte:head>
  <title>{data.doc.title} — Ground Truth</title>
</svelte:head>

<GridPage {lang}>
  <div class="doc">
    <nav class="pages" aria-label="Ground Truth">
      <p class="lab">Ground Truth</p>
      {#each page.data?.pages ?? [] as p (p.slug)}
        <a class="pg fill" href={p.href} aria-current={p.slug === data.doc.slug ? 'page' : undefined}>{p.title}</a>
      {/each}
    </nav>
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
    display: grid;
    grid-template-columns: var(--pic) minmax(0, 1fr);
    min-height: 100%;
  }
  .pages {
    display: flex;
    flex-direction: column;
    border-right: var(--line) solid var(--rule);
  }
  .lab {
    margin: 0;
    height: var(--label);
    padding: 0 var(--in);
    border-bottom: var(--line) solid var(--rule);
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--o-text);
  }
  .pg {
    padding: var(--u) var(--in);
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    text-decoration: none;
    font-size: calc(0.875rem * var(--k));
    font-weight: 580;
  }
  .pg[aria-current='page'] {
    background: var(--o3);
    color: var(--o-text);
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
    .doc {
      grid-template-columns: minmax(0, 1fr);
    }
    /* a phone: the pages as one row that swipes, like the topics row */
    .pages {
      flex-direction: row;
      overflow-x: auto;
      scrollbar-width: none;
      border-right: 0;
      border-bottom: var(--line) solid var(--rule);
    }
    .pages::-webkit-scrollbar {
      display: none;
    }
    .lab {
      display: none;
    }
    .pg {
      flex: none;
      border-bottom: 0;
      border-right: 1px solid var(--hair);
      white-space: nowrap;
    }
    .text {
      padding: 1.5rem 1rem 3rem;
    }
    h1 {
      font-size: 2.3rem;
    }
  }
</style>
