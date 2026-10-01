<script>
  /* An index of stories, everything or one topic's: the count in the
     picture column (under the topic's mark, on a topic), beside it a label
     row, the title and a row of tools; then the ledger, newest first,
     filtered as you type. */
  import { formatNumber } from '$lib/labels.js';
  import { matches, STR } from '$lib/site/reel.js';
  import GridPage from './GridPage.svelte';
  import Ledger from './Ledger.svelte';
  import Mark from './Mark.svelte';

  let { lang, stories, title, kicker, back, section = null, placeholder } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  let q = $state('');
  const found = $derived(stories.filter((s) => matches(s, q)));
</script>

<GridPage {lang} {section}>
  <section class="head">
    <div class="tally">
      {#if section}<Mark key={section} size={40} />{/if}
      <b>{num(stories.length)}</b>
      <span>{lang === 'bn' ? 'প্রতিবেদন' : stories.length === 1 ? 'story' : 'stories'}</span>
    </div>
    <div class="about">
      <p class="lab">{kicker}<span class="count-inline">&nbsp;· {L.count(num(stories.length))}</span></p>
      <h1>{title}</h1>
      <div class="tools">
        <a class="cell fill" href={back.href}>← {back.label}</a>
        <label class="cell filter">
          <span class="sr">{placeholder}</span>
          <input type="search" bind:value={q} {placeholder} autocomplete="off" />
        </label>
        {#if q.trim()}<span class="cell shown" aria-live="polite">{L.shown(num(found.length), num(stories.length))}</span>{/if}
      </div>
    </div>
  </section>
  <Ledger {lang} stories={found} topic={section} />
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
  .head {
    display: grid;
    grid-template-columns: var(--pic) minmax(0, 1fr);
  }
  .tally {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: var(--in);
    border-right: var(--line) solid var(--rule);
    background: var(--o3);
  }
  .tally b {
    font-size: clamp(2.6rem, 1.6rem + 2.4vw, 4.5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.9;
    color: var(--o-text);
  }
  .tally span {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--o-text);
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
  h1 {
    margin: 0;
    padding: var(--in) var(--in) calc(1.5 * var(--in));
    font-size: clamp(2.6rem, 1rem + 4.5vw, 6rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.012em;
  }
  h1:lang(bn),
  :global(.g:lang(bn)) h1 {
    line-height: 1.2;
    letter-spacing: 0;
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

  .count-inline {
    display: none;
  }
  /* A phone: compact. No count column, the count rides in the label line;
     a smaller title; the way back and the search share one row. */
  @media (max-width: 759px) {
    .head {
      grid-template-columns: minmax(0, 1fr);
    }
    .tally {
      display: none;
    }
    .count-inline {
      display: inline;
    }
    h1 {
      padding: var(--u) var(--in) var(--in);
      font-size: 2rem;
    }
    .cell {
      height: 2.5rem;
    }
    .filter {
      flex: 1;
    }
  }
</style>
