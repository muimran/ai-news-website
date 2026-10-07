<script>
  /* A writer: their portrait in the picture column, beside it a label row,
     their name and bio, and a row of tools; then their stories as a
     ledger, the photos running on down the same column. */
  import { base } from '$app/paths';
  import { formatNumber } from '$lib/labels.js';
  import { matches, STR } from '$lib/site/reel.js';
  import GridPage from '../../../GridPage.svelte';
  import Ledger from '../../../Ledger.svelte';

  let { data } = $props();
  const L = STR.en;
  const w = $derived(data.author);
  const num = (n) => formatNumber(n, 'en');

  let q = $state('');
  const found = $derived(data.stories.filter((s) => matches(s, q)));
</script>

<svelte:head>
  <title>{w.name} — Second Order</title>
</svelte:head>

<GridPage lang="en">
  <section class="who">
    <span class="portrait">{#if w.photo}<img src={w.photo} alt={w.name} />{/if}</span>
    <div class="about">
      <p class="lab">{w.role || L.reporter} · {L.count(num(data.stories.length))}</p>
      <div class="name">
        <h1>{w.name}</h1>
        <div class="bio">{@html w.bio}</div>
      </div>
      <div class="tools">
        <a class="cell fill" href="{base}/authors">← {L.reporters}</a>
        {#each w.links as l (l.href)}
          <a class="cell fill" href={l.href} rel="me noopener">{l.label}</a>
        {/each}
        <label class="cell filter">
          <span class="sr">{L.searchBy}</span>
          <input type="search" bind:value={q} placeholder={L.searchBy} autocomplete="off" />
        </label>
        {#if q.trim()}<span class="cell shown" aria-live="polite">{L.shown(num(found.length), num(data.stories.length))}</span>{/if}
      </div>
    </div>
  </section>
  <Ledger lang="en" stories={found} />
</GridPage>

<style>
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .who {
    display: grid;
    grid-template-columns: var(--pic) minmax(0, 1fr);
  }
  /* black and white, so portraits taken anywhere still read as one set. At
     least 5:7, and as tall as the block beside it, so its foot sits on the
     same rule as the row of links and search */
  .portrait {
    position: relative;
    min-height: calc(var(--pic) * 7 / 5);
    border-right: var(--line) solid var(--rule);
    background: var(--i3);
  }
  .portrait img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1);
  }
  .about {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .lab {
    margin: 0;
    padding: 0 var(--in);
    height: var(--label);
    border-bottom: 1px solid var(--hair);
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--o-text);
  }
  .name {
    flex: 1;
    padding: var(--in) var(--in) calc(1.5 * var(--in));
  }
  h1 {
    margin: 0 0 1.25rem;
    font-size: clamp(2.6rem, 1rem + 4.5vw, 6rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.012em;
  }
  .bio {
    max-width: 38em;
    font-size: 1rem;
    line-height: 1.55;
  }
  .bio :global(p) {
    margin: 0;
  }
  .tools {
    display: flex;
    border-top: 1px solid var(--hair);
  }
  .cell {
    display: flex;
    align-items: center;
    padding: 0 var(--in);
    height: 3rem;
    border-right: 1px solid var(--hair);
    color: var(--ink);
    text-decoration: none;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .filter {
    flex: 1;
    min-width: 0;
    padding: 0;
  }
  .filter input {
    width: 100%;
    height: 100%;
    padding: 0 var(--in);
    border: 0;
    background: none;
    color: var(--ink);
    font: 500 calc(0.75rem * var(--k)) / 1 var(--mono);
    outline: none;
  }
  .filter input:focus {
    background: var(--o3);
  }
  .shown {
    border-right: 0;
    color: var(--mute);
  }

  @media (max-width: 759px) {
    .name {
      padding: var(--in) var(--in) var(--in);
    }
    h1 {
      font-size: 2.2rem;
    }
    .bio {
      font-size: 0.875rem;
    }
    .tools {
      flex-wrap: wrap;
    }
    .filter {
      flex-basis: 100%;
      border-top: 1px solid var(--hair);
      border-right: 0;
    }
  }
</style>
