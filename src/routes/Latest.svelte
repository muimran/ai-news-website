<script>
  /* The Latest pane: every story, newest first, as a ruled ledger with a
     scroll of its own, so it is never too long or too short for its space.
     The topic marks filter it. It folds to a thin strip, giving the main
     pane the width; the reader chooses how full the screen is. On a phone
     it opens as a panel from the topics row. */
  import { page } from '$app/state';
  import { sectionLabel, formatNumber } from '$lib/labels.js';
  import { SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from './Mark.svelte';
  import { storyUrl } from './grid.js';
  import { ui } from './ui.svelte.js';
  import { memory, saw, isRead, isNew } from './memory.svelte.js';

  /* `aside`: a page that, like a story, has the screen to itself */
  let { lang, stories, current = null, aside = false, shut = false } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  let only = $state(null); // a topic key, or every topic
  const shown = $derived(only ? stories.filter((s) => s.section === only) : stories);
  // the whole list has been shown once the pane is open
  $effect(() => {
    if (memory.ready && (!folded || ui.sheet)) saw(stories);
  });

  /* The site always opens with the pane open; folding lasts until reload. */
  function fold(v) {
    ui.folded = v;
  }

  /* On a story the pane starts folded, so reading has the width, without
     touching the reader's own choice elsewhere; opening it there keeps it
     open until they move to another page. */
  const story = $derived(current !== null || aside);
  const folded = $derived(ui.folded || ((story || shut || ui.reading) && !ui.pin));
  function unfold() {
    if (story || shut || ui.reading) ui.pin = true;
    else fold(false);
  }
  function close() {
    if (ui.sheet) ui.sheet = false;
    else if (story || shut || ui.reading) ui.pin = false;
    else fold(true);
  }
</script>

<aside class="latest" class:folded class:sheet={ui.sheet} class:onstory={story} aria-label={L.latest}>
  {#if folded && !ui.sheet}
    <button type="button" class="strip fill" onclick={unfold}>
      <span class="go" aria-hidden="true"></span>
      <span class="word">{L.latest}</span>
    </button>
  {:else}
    <div class="phead">
      <span>{L.latest} · {num(shown.length)}</span>
      <button type="button" class="fold fill" onclick={close} aria-label={L.close}><span class="x" aria-hidden="true"></span></button>
    </div>
    <div class="filters" role="group" aria-label={L.topics}>
      <button type="button" class="all fill" aria-pressed={!only} onclick={() => (only = null)}>{lang === 'bn' ? 'সব' : 'All'}</button>
      {#each page.data?.topics ?? [] as t (t.key)}
        <button
          type="button"
          class="tf fill"
          aria-pressed={only === t.key}
          title={sectionLabel(t.key, lang)}
          aria-label={sectionLabel(t.key, lang)}
          onclick={() => (only = only === t.key ? null : t.key)}><Mark key={t.key} /></button
        >
      {/each}
    </div>
    <ol class="list">
      {#each shown as s (s.slug)}
        <li>
          <a class="row fill" class:read={isRead(s)} href={storyUrl(s)} aria-current={current === s.slug ? 'page' : undefined} lang={s.lang}>
            <span class="d">{SHORT_DATE[s.lang].format(new Date(s.date))}{#if isNew(s)}<i class="new" title={L.fresh}><span class="sr">{L.fresh}</span></i>{/if}</span>
            <span class="h"><Mark key={s.section} size={11} />{s.title}</span>
          </a>
        </li>
      {/each}
    </ol>
  {/if}
</aside>

<style>
  .latest {
    position: fixed;
    z-index: 5;
    top: var(--top);
    bottom: var(--bot);
    left: var(--m);
    width: var(--side);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    transition:
      width 0.4s cubic-bezier(0.3, 0.7, 0.1, 1),
      top 0.5s cubic-bezier(0.45, 0, 0.2, 1),
      bottom 0.4s cubic-bezier(0.3, 0.7, 0.1, 1),
      border-right-width 0.2s ease;
    border-left: var(--frame) solid var(--rule);
    border-right: var(--line) solid var(--rule);
    background: var(--paper);
  }
  /* deep in a story the topics row lowers away and the page runs on to the
     screen's foot; the pane goes with it, so its rule never breaks off */
  :global(.g.reading) .latest,
  :global(.g:has(main.footless)) .latest,
  :global(.g:has(.panel)) .latest {
    bottom: var(--mv);
  }
  :global(.g.far) .latest {
    top: var(--mv);
  }
  /* a story's facts folded into this line: it thickens as their trace,
     once they've arrived, and thins again before they unfold */
  :global(.g.deep) .latest {
    border-right-width: 3px;
    transition:
      width 0.4s cubic-bezier(0.3, 0.7, 0.1, 1),
      top 0.5s cubic-bezier(0.45, 0, 0.2, 1),
      bottom 0.4s cubic-bezier(0.3, 0.7, 0.1, 1),
      border-right-width 0.3s ease 0.5s;
  }
  @media (prefers-reduced-motion: reduce) {
    .latest {
      transition: none;
    }
  }
  /* none on a story; on a phone it can still open from the menu */
  .onstory:not(.sheet) {
    display: none;
  }
  /* folded: one strip, its label turned to read up it, under an arrow
     pointing the way it opens; tinted faintly, like the phone's Latest
     button, to say it's a thing to press */
  .strip {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.4rem;
    padding: 0 0 var(--in);
    border: 0;
    background: none;
    color: var(--o-text);
    cursor: pointer;
    transition: background-color 0.15s;
  }
  .strip:hover {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }
  /* a chevron drawn as two strokes, so its weight can be set */
  .strip .go {
    width: 0.5rem;
    height: 0.5rem;
    /* centred on the cards' label row beside it */
    margin: calc((var(--label) - 0.5rem) / 2) 0.2rem 0 0;
    border: solid currentColor;
    border-width: 2.5px 2.5px 0 0;
    transform: rotate(45deg);
    transition: transform 0.2s;
  }
  .strip:hover .go {
    transform: translateX(3px) rotate(45deg);
  }
  .strip .word {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font: 700 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .phead {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--label);
    padding-left: var(--in);
    border-bottom: 1px solid var(--hair);
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--o-text);
  }
  .fold {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--label);
    height: 100%;
    border: 0;
    border-left: 1px solid var(--hair);
    background: none;
    color: var(--ink);
    cursor: pointer;
  }
  /* a cross drawn like the menu's: two lines, crossed at the middle */
  .x {
    position: relative;
    width: 0.875rem;
    height: 0.875rem;
  }
  .x::before,
  .x::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: calc(50% - 1px);
    height: 2px;
    background: currentColor;
    transform: rotate(45deg);
  }
  .x::after {
    transform: rotate(-45deg);
  }
  .filters {
    flex: none;
    display: flex;
    border-bottom: var(--line) solid var(--rule);
  }
  .filters button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--label);
    border: 0;
    border-right: 1px solid var(--hair);
    background: none;
    color: var(--ink);
    cursor: pointer;
  }
  .filters button:last-child {
    border-right: 0;
  }
  .all {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .filters button[aria-pressed='true'] {
    background: var(--o3);
    color: var(--o-text);
  }
  .list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    margin: 0;
    padding: 0;
    list-style: none;
    scrollbar-width: thin;
  }
  .list li + li {
    border-top: 1px solid var(--hair);
  }
  .row {
    display: grid;
    grid-template-columns: calc(4.5 * var(--u)) minmax(0, 1fr);
    gap: var(--u);
    align-items: baseline;
    padding: var(--u) var(--in);
    color: var(--ink);
    text-decoration: none;
  }
  .row[aria-current='page'] {
    background: var(--o3);
  }
  .d {
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    color: var(--o-text);
  }
  .row:hover .d,
  .row:focus-visible .d {
    color: inherit;
  }
  .h {
    font-size: calc(0.875rem * var(--k));
    font-weight: 580;
    font-stretch: 85%;
    line-height: 1.25;
  }
  /* the mark hangs in front, so a title's lines all start together */
  .h {
    padding-left: calc(11px + 0.4em);
    text-indent: calc(-11px - 0.4em);
  }
  .h :global(.mark) {
    display: inline-block;
    margin-right: 0.4em;
    vertical-align: -0.05em;
  }
  /* read: the headline steps back, so what's left to read stands out */
  .row.read .h {
    color: var(--mute);
    font-weight: 480;
  }
  .row.read:hover .h,
  .row.read:focus-visible .h {
    color: inherit;
  }
  /* new since the last visit: a dot in the margin before its date */
  .row {
    position: relative;
  }
  .new {
    position: absolute;
    left: calc(var(--in) / 2 - 3px);
    top: calc(var(--u) + 0.45em);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--o);
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .row:lang(bn) .h {
    line-height: 1.5;
  }
  /* Bangla writes the month in full; the widest (২৮ ফেব্রুয়ারি) is 68px
     (the dates are the same size on every screen, so a fixed width) */
  .row:lang(bn) {
    grid-template-columns: 4.5rem minmax(0, 1fr);
  }

  /* a phone: no room for a pane; it opens as a panel from the topics row */
  @media (max-width: 759px) {
    .latest {
      display: none;
      z-index: 20;
      left: 0;
      right: 0;
      width: auto;
      border: 0;
    }
    .latest.sheet {
      display: flex;
    }
    /* the cross that closes it is in the topics row, where it opened */
    .sheet .fold {
      display: none;
    }
    .row {
      grid-template-columns: 3.5rem minmax(0, 1fr);
    }
  }
</style>
