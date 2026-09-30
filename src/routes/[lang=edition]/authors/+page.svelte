<script>
  /* Everyone who writes for Ground Truth, both desks: photo (an empty frame
     until there is one), name, role, how many stories. */
  import { base } from '$app/paths';
  import { formatNumber } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';

  let { data } = $props();
  const lang = 'en';
  const L = STR.en;
  const num = (n) => formatNumber(n, lang);
</script>

<svelte:head>
  <title>{L.reporters} — Ground Truth</title>
</svelte:head>

<main class="people">
  <p class="kick">Ground Truth · {L.people(num(data.authors.length))}</p>
  <h1>{L.reporters}</h1>
  <a class="back" href="{base}/{lang}">← {L.latest}</a>
  <ol>
    {#each data.authors as a (a.slug)}
      <li>
        <a href="{base}/en/author/{a.slug}">
          <span class="photo">{#if a.photo}<img src={a.photo} alt="" loading="lazy" />{/if}</span>
          <span class="nm">{a.name}</span>
          <span class="role">{a.role}</span>
          <span class="ct">{L.count(num(a.count))}</span>
        </a>
      </li>
    {/each}
  </ol>
</main>

<style>
  .people {
    padding: 6.5rem var(--pad) 6rem;
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
    font-size: clamp(2.6rem, 1rem + 5vw, 6.5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.012em;
  }
  h1:lang(bn) {
    line-height: 1.2;
    letter-spacing: 0;
  }
  .back {
    color: var(--mute);
    text-decoration: none;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .back:hover,
  .back:focus-visible {
    color: var(--ink);
    outline: none;
  }
  ol {
    margin: 2.5rem 0 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--ink);
  }
  li {
    border-bottom: 1px solid var(--line);
  }
  li a {
    display: grid;
    grid-template-columns: 2.75rem minmax(0, 1fr) minmax(0, 1fr) auto;
    align-items: center;
    gap: 1.5rem;
    padding: 0.9rem 0;
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .photo {
    width: 2.75rem;
    aspect-ratio: 5 / 7;
    overflow: hidden;
    border: 1px solid var(--line);
  }
  .photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1);
  }
  .nm {
    font-size: clamp(1.3rem, 0.9rem + 1.3vw, 2.2rem);
    font-weight: 620;
    font-stretch: 78%;
    line-height: 1.05;
    transition: color 0.15s;
  }
  .role {
    color: var(--mute);
    font-size: calc(0.875rem * var(--k));
  }
  .ct {
    color: var(--mute);
    font: 400 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  li a:hover .nm,
  li a:focus-visible .nm {
    color: var(--accent-text);
  }

  @media (max-width: 759px) {
    li a {
      grid-template-columns: 2.5rem minmax(0, 1fr) auto;
      gap: 0.3rem 1rem;
    }
    .photo {
      grid-row: 1 / span 2;
      width: 2.5rem;
    }
    .role {
      grid-column: 2;
      grid-row: 2;
    }
  }
</style>
