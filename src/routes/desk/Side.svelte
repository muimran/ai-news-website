<script>
  /* What a list page says about itself in its side column: what kind of
     page (and its number, for a topic), its name, how many stories, a
     field to filter them, and the way back. */
  import { formatNumber } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';

  let { lang, label, no = null, title, total, shown = total, q = $bindable(''), back = null, children = null } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);
</script>

<p class="mono kind">{#if no}<b>{no}</b>{/if}{label}</p>
<h1 class="hl">{title}</h1>
{#if children}{@render children()}{/if}
<p class="mono count" aria-live="polite">{shown !== total ? L.shown(num(shown), num(total)) : L.count(num(total))}</p>
<label class="filter">
  <span class="sr">{L.searchBy}</span>
  <input type="search" bind:value={q} placeholder={L.searchBy} autocomplete="off" />
</label>
{#if back}<a class="mono back" href={back.href}>← {back.text}</a>{/if}

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
  p {
    margin: 0;
  }
  .kind {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--mute);
  }
  .kind b {
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.5rem;
    background: var(--ink);
    color: var(--card);
    letter-spacing: 0;
  }
  .hl {
    margin: 0;
    font-family: var(--serif);
    font-size: calc(var(--title) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 72;
    letter-spacing: var(--hls);
    line-height: var(--hlh);
    text-wrap: balance;
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
</style>
