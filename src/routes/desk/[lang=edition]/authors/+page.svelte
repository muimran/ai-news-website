<script>
  /* The reporters: a card to a person, their portrait in black and white
     so pictures taken anywhere read as one set, their name, role and how
     many stories. */
  import { formatNumber } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';
  import Frame from '../../Frame.svelte';
  import { deskAuthor, deskHome } from '../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);
  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  const ROOM = { en: 'The newsroom', bn: 'নিউজরুম' };
  const name = (a) => (lang === 'bn' && a.name_bn ? a.name_bn : a.name);
  const role = (a) => (lang === 'bn' && a.role_bn ? a.role_bn : a.role) || L.reporter;
</script>

<svelte:head>
  <title>{L.reporters} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <p class="mono kind">{ROOM[lang]}</p>
    <h1 class="hl">{L.reporters}</h1>
    <p class="mono count">{L.people(num(data.authors.length))}</p>
    <a class="mono back" href={deskHome(lang)}>← {FRONT[lang]}</a>
  {/snippet}
  <ol class="sheet">
    {#each data.authors as a (a.slug)}
      <li>
        <a class="person" href={deskAuthor(a.slug, lang)}>
          <span class="portrait">{#if a.photo}<img src={a.photo} alt="" loading="lazy" />{/if}</span>
          <span class="nm">{name(a)}</span>
          <span class="mono meta"><span>{role(a)}</span><span>{num(a.count)}</span></span>
        </a>
      </li>
    {/each}
  </ol>
</Frame>

<style>
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
  .kind {
    color: var(--mute);
  }
  .hl {
    font-family: var(--serif);
    font-size: calc(clamp(1.9rem, 2.4vw, 2.4rem) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 72;
    letter-spacing: var(--hls);
    line-height: var(--hlh);
  }
  .count {
    padding-top: 0.9rem;
    border-top: 1px solid var(--ink);
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
  .sheet {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11.5rem, 1fr));
    gap: var(--gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .person {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    text-decoration: none;
    outline: none;
    transition:
      transform 0.16s ease-out,
      box-shadow 0.16s ease-out;
  }
  @media (hover: hover) {
    .person:hover,
    .person:focus-visible {
      transform: translate(-3px, -3px);
      box-shadow: 4px 4px 0 var(--ink);
    }
  }
  .portrait {
    display: block;
    aspect-ratio: 5 / 6;
    overflow: hidden;
    border-bottom: 1px solid var(--ink);
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
  .nm {
    padding: 0.8rem 0.9rem 0.4rem;
    font-family: var(--serif);
    font-size: calc(1.25rem * var(--hk));
    font-weight: calc(var(--hw) - 40);
    font-variation-settings: 'opsz' 30;
    letter-spacing: calc(var(--hls) / 2);
    line-height: calc(var(--hlh) + 0.1);
  }
  .meta {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: auto;
    padding: 0 0.9rem 0.8rem;
    color: var(--mute);
  }
  @media (max-width: 759px) {
    .sheet {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }
  }
</style>
