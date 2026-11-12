<script>
  /* A writer: down the side their portrait, name, role and bio, where to
     find them, and a field to filter their stories; beside it the stories,
     from both desks, by month. */
  import { formatNumber } from '$lib/labels.js';
  import { matches, STR } from '$lib/site/reel.js';
  import Frame from '../../../Frame.svelte';
  import Stories from '../../../Stories.svelte';
  import Pager from '../../../Pager.svelte';
  import { deskAuthors } from '../../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);
  const w = $derived(data.author);
  const name = $derived(lang === 'bn' && w.name_bn ? w.name_bn : w.name);
  const role = $derived((lang === 'bn' && w.role_bn ? w.role_bn : w.role) || L.reporter);
  let q = $state('');
  const shown = $derived(data.stories.filter((s) => matches(s, q)).length);
</script>

<svelte:head>
  <title>{name} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <span class="portrait">{#if w.photo}<img src={w.photo} alt={name} />{/if}</span>
    <p class="mono kind">{role}</p>
    <h1 class="hl">{name}</h1>
    <div class="bio" lang="en">{@html w.bio}</div>
    {#if w.links.length}
      <p class="links">
        {#each w.links as l (l.href)}<a class="mono chip" href={l.href} rel="me noopener">{l.label} ↗</a>{/each}
      </p>
    {/if}
    <p class="mono count" aria-live="polite">{q.trim() ? L.shown(num(shown), num(data.total)) : L.count(num(data.total))}</p>
    <label class="filter">
      <span class="sr">{L.searchBy}</span>
      <input type="search" bind:value={q} placeholder={L.searchBy} autocomplete="off" />
    </label>
    <a class="mono back" href={deskAuthors(lang)}>← {L.reporters}</a>
  {/snippet}
  {#key w.slug}<Stories {lang} stories={data.stories} {q} lead={false} />{/key}
  <Pager {lang} page={data.page} pages={data.pages} href={data.href} />
</Frame>

<style>
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .mono {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  p,
  h1 {
    margin: 0;
  }
  /* black and white, like every portrait here */
  .portrait {
    display: block;
    width: 100%;
    max-width: 15rem;
    aspect-ratio: 5 / 6;
    overflow: hidden;
    border: 1px solid var(--ink);
    background: var(--hair);
  }
  .portrait img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 20%;
    filter: grayscale(1) contrast(1.05);
  }
  .kind {
    color: var(--mute);
  }
  .hl {
    font-family: var(--serif);
    font-size: calc(var(--title) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 72;
    letter-spacing: var(--hls);
    line-height: var(--hlh);
    text-wrap: balance;
  }
  .bio {
    font-size: 0.9375rem;
    line-height: 1.5;
  }
  .bio :global(p) {
    margin: 0 0 0.6em;
  }
  .bio :global(p:last-child) {
    margin-bottom: 0;
  }
  .bio :global(a) {
    color: inherit;
    text-underline-offset: 0.18em;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .chip {
    padding: 0.45rem 0.65rem 0.4rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .chip:hover,
  .chip:focus-visible {
    background: var(--ink);
    color: var(--card);
  }
  .count {
    padding-top: 0.9rem;
    border-top: 1px solid var(--ink);
  }
  .filter input {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 0.6rem 0.7rem;
    border: 1px solid var(--ink);
    border-radius: 0;
    background: var(--card);
    color: var(--ink);
    font: 500 0.9375rem / 1.2 var(--sans);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }
  .filter input::placeholder {
    color: var(--mute);
  }
  .filter input:focus {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
  .back {
    color: var(--mute);
    text-decoration: none;
  }
  .back:hover,
  .back:focus-visible {
    color: var(--ink);
    outline: none;
  }
  @media (max-width: 1099px) {
    .portrait {
      max-width: 9rem;
    }
  }
</style>
