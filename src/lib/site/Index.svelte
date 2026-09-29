<script>
  /* A topic's full list: the calm opposite of the reel, for finding rather
     than browsing. Newest first, grouped by month, with a filter. */
  import { formatNumber } from '$lib/labels.js';
  import Row from './Row.svelte';
  import { matches, MONTH, STR } from './reel.js';

  let { lang, stories, title, kicker, back, showTopic = false, placeholder = null, subtitle = null, intro = null } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  let q = $state('');
  const found = $derived(stories.filter((s) => matches(s, q)));

  const months = $derived.by(() => {
    const out = [];
    for (const s of found) {
      const d = new Date(s.date);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (out.at(-1)?.key !== key) out.push({ key, label: MONTH[lang].format(d), items: [] });
      out.at(-1).items.push(s);
    }
    return out;
  });
</script>

<main class="list">
  <header class="head">
    <p class="kick">{kicker} · {L.count(num(stories.length))}</p>
    <h1>{title}</h1>
    {#if subtitle}<p class="subtitle" lang="bn">{subtitle}</p>{/if}
    {#if intro}<div class="intro">{@html intro}</div>{/if}
    <div class="tools">
      <a class="back" href={back.href}>← {back.label}</a>
      <label class="filter">
        <span class="sr">{placeholder ?? L.searchIn}</span>
        <input type="search" bind:value={q} placeholder={placeholder ?? L.searchIn} autocomplete="off" />
      </label>
      {#if q.trim()}<span class="count" aria-live="polite">{L.shown(num(found.length), num(stories.length))}</span>{/if}
    </div>
  </header>

  {#each months as m (m.key)}
    <section aria-label={m.label}>
      <h2 class="month">{m.label}</h2>
      {#each m.items as s (s.slug)}
        <Row story={s} {showTopic} />
      {/each}
    </section>
  {/each}
  {#if !found.length}<p class="none">{L.none}</p>{/if}
</main>

<style>
  .list {
    padding: 6.5rem var(--pad) 6rem;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .head {
    margin-bottom: 2.5rem;
  }
  .kick {
    margin: 0 0 1rem;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-text);
  }
  h1 {
    max-width: 14em;
    margin: 0 0 2rem;
    font-size: clamp(2.6rem, 1rem + 5vw, 6.5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.012em;
    text-wrap: balance;
  }
  h1:lang(bn) {
    line-height: 1.2;
    letter-spacing: 0;
  }
  .subtitle {
    margin: -1.25rem 0 2rem;
    color: var(--mute);
    font-family: 'Noto Sans Bengali', sans-serif;
    font-size: clamp(1.1rem, 0.9rem + 0.8vw, 1.6rem);
    font-weight: 500;
  }
  .intro {
    max-width: 36rem;
    margin: -0.5rem 0 2rem;
    font-size: 1.05rem;
    line-height: 1.6;
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem 1.75rem;
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
  }
  .back {
    color: var(--mute);
    text-decoration: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .back:hover,
  .back:focus-visible {
    color: var(--ink);
    outline: none;
  }
  .filter {
    flex: 0 1 20rem;
  }
  input {
    width: 100%;
    padding: 0.45rem 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: none;
    color: var(--ink);
    font: inherit;
    outline: none;
  }
  input:focus {
    border-bottom-color: var(--ink);
  }
  input::placeholder {
    color: var(--mute);
  }
  .count {
    color: var(--accent-text);
  }

  /* Month headings hold under the top bar while their stories scroll past. */
  .month {
    position: sticky;
    top: 4rem;
    z-index: 1;
    margin: 0;
    padding: 1.5rem 0 0.6rem;
    border-bottom: 1px solid var(--ink);
    background: var(--bg);
    font: 500 calc(0.75rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .none {
    margin: 2rem 0;
    color: var(--mute);
  }
</style>
