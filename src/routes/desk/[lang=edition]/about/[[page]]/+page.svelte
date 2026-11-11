<script>
  /* The newsroom's own pages (About, the policies): the list of them down
     the side, the one being read marked; beside it the page, as a sheet of
     paper with a reading column. */
  import { STR } from '$lib/site/reel.js';
  import Frame from '../../../Frame.svelte';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const ROOM = { en: 'The newsroom', bn: 'নিউজরুম' };
</script>

<svelte:head>
  <title>{data.doc.title} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <p class="mono kind">{ROOM[lang]}</p>
    <nav class="pages">
      {#each data.pages as p (p.slug)}
        <a href={p.href} aria-current={p.slug === data.doc.slug ? 'page' : undefined}><i aria-hidden="true"></i>{p.title}</a>
      {/each}
    </nav>
    <p class="blurb">{L.blurb}</p>
  {/snippet}
  <article class="sheet" {lang}>
    <h1 class="hl">{data.doc.title}</h1>
    {#if data.doc.html}
      <div class="body">{@html data.doc.html}</div>
    {:else}
      <p class="soon">{L.soon}</p>
    {/if}
  </article>
</Frame>

<style>
  .mono {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  p {
    margin: 0;
  }
  .kind {
    color: var(--mute);
  }
  .pages {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--ink);
  }
  .pages a {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.2;
    text-decoration: none;
    outline: none;
  }
  .pages i {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    border: 1px solid var(--ink);
  }
  .pages a[aria-current] i {
    border-color: var(--accent);
    background: var(--accent);
  }
  .pages a:hover,
  .pages a:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .blurb {
    color: var(--mute);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* the page: a sheet of paper, the text in a reading column */
  .sheet {
    box-sizing: border-box;
    padding: clamp(1.5rem, 4vw, 3.5rem) clamp(1.25rem, 5vw, 4.5rem) clamp(2rem, 5vw, 4rem);
    border: 1px solid var(--ink);
    background: var(--card);
  }
  .hl {
    max-width: 16em;
    margin: 0 0 1.5rem;
    font-family: var(--serif);
    font-size: calc(clamp(2.2rem, 4vw, 3.6rem) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 72;
    letter-spacing: var(--hls);
    line-height: var(--hlh);
    text-wrap: balance;
  }
  .body,
  .soon {
    max-width: 38rem;
    font-size: 1.125rem;
    line-height: 1.6;
  }
  .soon {
    color: var(--mute);
  }
  .body:lang(bn) {
    line-height: 1.8;
  }
  .body :global(p) {
    margin: 0 0 1.1em;
  }
  .body :global(h2),
  .body :global(h3) {
    margin: 2em 0 0.6em;
    font-family: var(--serif);
    font-size: calc(1.6rem * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 40;
    letter-spacing: calc(var(--hls) / 2);
    line-height: calc(var(--hlh) + 0.1);
  }
  .body :global(h3) {
    font-size: calc(1.3rem * var(--hk));
  }
  .body :global(a) {
    color: inherit;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 0.18em;
  }
  .body :global(ul),
  .body :global(ol) {
    margin: 0 0 1.1em;
    padding-left: 1.3em;
  }
  .body :global(li) {
    margin-bottom: 0.4em;
  }
  .body :global(blockquote) {
    margin: 1.5em 0;
    padding-left: 1.1em;
    border-left: 3px solid var(--accent);
  }
  .body :global(hr) {
    margin: 2em 0;
    border: 0;
    border-top: 1px solid var(--ink);
  }
</style>
