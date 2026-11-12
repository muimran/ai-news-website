<script>
  /* Where every Donate button leads. The ways to give (card, bKash, bank
     transfer) go here when the accounts exist; until then, a line saying
     they're coming. One page, so changing how people give never means
     changing the buttons. */
  import Frame from '../../Frame.svelte';
  import { GIVE } from '../../support.js';
  import { deskHome } from '../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const G = $derived(GIVE[lang]);
</script>

<svelte:head>
  <title>{G.title} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <p class="mono kind">{G.button}</p>
    <a class="mono back" href={deskHome(lang)}>← {G.back}</a>
  {/snippet}
  <article class="sheet" {lang}>
    <h1 class="hl">{G.title}</h1>
    <p class="why">{G.why}</p>
    <p class="mono soon">{G.soon}</p>
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
  .kind,
  .back {
    color: var(--mute);
  }
  .back:hover,
  .back:focus-visible {
    color: var(--ink);
    outline: none;
  }
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
  .why {
    max-width: 38rem;
    font-size: 1.125rem;
    line-height: 1.6;
  }
  .why:lang(bn) {
    line-height: 1.8;
  }
  .soon {
    display: inline-flex;
    align-items: center;
    height: 2rem;
    margin-top: 2rem;
    padding: 0 0.75rem;
    border: 1px dashed var(--ink);
    color: var(--mute);
  }
</style>
