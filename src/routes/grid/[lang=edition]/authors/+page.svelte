<script>
  /* Everyone who writes for Second Order: a sheet of portrait cells sharing
     their rules, each with name, role and count beneath. */
  import { base } from '$app/paths';
  import { formatNumber } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';
  import GridPage from '../../GridPage.svelte';

  let { data } = $props();
  const L = STR.en;
  const num = (n) => formatNumber(n, 'en');
</script>

<svelte:head>
  <title>{L.reporters} — Second Order</title>
</svelte:head>

<GridPage lang="en">
  <header class="intro">
    <p class="lab">Second Order · {L.people(num(data.authors.length))}</p>
    <h1>{L.reporters}</h1>
  </header>
  <ol class="sheet">
    {#each data.authors as a (a.slug)}
      <li>
        <a class="person fill" href="{base}/grid/en/author/{a.slug}">
          <span class="portrait">{#if a.photo}<img src={a.photo} alt="" loading="lazy" />{/if}</span>
          <span class="nm">{a.name}</span>
          <span class="meta"><span>{a.role || L.reporter}</span><span>{L.count(num(a.count))}</span></span>
        </a>
      </li>
    {/each}
  </ol>
</GridPage>

<style>
  .intro {
    border-bottom: var(--line) solid var(--rule);
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
  h1 {
    margin: 0;
    padding: var(--in) var(--in) calc(1.5 * var(--in));
    font-size: clamp(2.6rem, 1rem + 4.5vw, 6rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.012em;
  }
  /* cells share their rules: each draws its right and bottom edge, and the
     last in a row leaves its right to the frame */
  .sheet {
    --cols: 5;
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .sheet li {
    border-right: var(--line) solid var(--rule);
    border-bottom: var(--line) solid var(--rule);
  }
  .sheet li:nth-child(5n) {
    border-right: 0;
  }
  .person {
    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--ink);
    text-decoration: none;
  }
  .portrait {
    position: relative;
    aspect-ratio: 5 / 7;
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
  .nm {
    padding: var(--u) var(--in) calc(var(--u) / 2);
    font-size: 1.25rem;
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1.1;
  }
  /* role, then count, one under the other */
  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0 var(--in) var(--in);
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .person:hover .meta,
  .person:focus-visible .meta {
    color: inherit;
  }

  @media (max-width: 1100px) {
    .sheet {
      --cols: 4;
    }
    .sheet li:nth-child(5n) {
      border-right: var(--line) solid var(--rule);
    }
    .sheet li:nth-child(4n) {
      border-right: 0;
    }
  }
  @media (max-width: 759px) {
    .sheet {
      --cols: 2;
    }
    .sheet li:nth-child(n) {
      border-right: var(--line) solid var(--rule);
    }
    .sheet li:nth-child(2n) {
      border-right: 0;
    }
    h1 {
      font-size: 2.6rem;
    }
  }
</style>
