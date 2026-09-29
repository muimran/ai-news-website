<script>
  import { STR } from '$lib/site/reel.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
</script>

<svelte:head>
  <title>{data.page.title} — Ground Truth</title>
</svelte:head>

<main class="doc">
  <p class="kick">Ground Truth</p>
  <h1>{data.page.title}</h1>
  {#if data.page.html}
    <div class="body">{@html data.page.html}</div>
  {:else}
    <p class="soon">{L.soon}</p>
  {/if}

  <nav class="others" aria-label="Ground Truth">
    {#each data.pages as p (p.slug)}
      <a href={p.href} aria-current={p.slug === data.page.slug ? 'page' : undefined}>{p.title}</a>
    {/each}
  </nav>
</main>

<style>
  .doc {
    max-width: 40rem;
    margin: 0 auto;
    padding: 7rem var(--pad) 6rem;
  }
  .kick {
    margin: 0 0 1rem;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-text);
  }
  h1 {
    margin: 0 0 2rem;
    font-size: clamp(2.6rem, 1rem + 5vw, 5.5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.012em;
  }
  h1:lang(bn) {
    line-height: 1.2;
    letter-spacing: 0;
  }
  .body,
  .soon {
    font-size: 1.125rem;
    line-height: 1.65;
  }
  .body:lang(bn) {
    line-height: 1.85;
  }
  .body :global(p) {
    margin: 0 0 1.1em;
  }
  .body :global(p:first-child) {
    font-size: clamp(1.3rem, 1rem + 0.8vw, 1.6rem);
    font-weight: 500;
    line-height: 1.35;
  }
  .body :global(h2) {
    margin: 2em 0 0.5em;
    font-size: 1.125rem;
    font-weight: 620;
  }
  .body :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.18em;
  }
  .soon {
    color: var(--mute);
  }
  .others {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.5rem;
    margin-top: 4rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .others a {
    color: var(--mute);
    text-decoration: none;
  }
  .others a:hover,
  .others a:focus-visible,
  .others a[aria-current='page'] {
    color: var(--ink);
    outline: none;
  }
</style>
