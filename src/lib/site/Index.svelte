<script>
  /* A topic's full list: the calm opposite of the reel, for finding rather
     than browsing. Newest first, grouped by month, with a filter. A writer's
     list (`portrait`) also has a frame for their photo, empty until there is
     one, and their other profiles (`links`) under the bio. */
  import { formatNumber } from '$lib/labels.js';
  import Row from './Row.svelte';
  import { matches, MONTH, STR } from './reel.js';

  let { lang, stories, title, kicker, back, showTopic = false, placeholder = null, intro = null, portrait = false, photo = null, links = [] } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  /* 24-unit glyphs for a writer's profiles. Facebook's is Simple Icons'
     (CC0); LinkedIn asked to be left out of that set, so its "in" is drawn
     here: a rounded square with the letters cut out. */
  const ICONS = {
    facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
    linkedin:
      'M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm2 3.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 1 0 0-3.2ZM5.5 10v8h3v-8Zm5 0v8h3v-3.9c0-1.1.6-1.8 1.6-1.8s1.4.7 1.4 1.8V18h3v-4.2c0-2.6-1.1-4-3.4-4-1.3 0-2.3.6-2.8 1.4V10Z'
  };

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
  <header class="head" class:portrait>
    {#if portrait}
      <span class="photo" aria-hidden={!photo}>{#if photo}<img src={photo} alt={title} />{/if}</span>
    {/if}
    <p class="kick">{kicker} · {L.count(num(stories.length))}</p>
    <h1>{title}</h1>
    {#if intro}<div class="intro">{@html intro}</div>{/if}
    {#if links.length}
      <ul class="links" aria-label="Elsewhere">
        {#each links as l (l.href)}
          <li>
            <a href={l.href} rel="me noopener" aria-label={l.label} title={l.label}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[l.key]} fill-rule="evenodd" /></svg>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
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
  /* Just before the name on wide screens, so face and name read as one, like
     a press card; above it on phones. Photos go black and white so a set
     taken anywhere still reads as one. */
  .portrait {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 2.5rem;
  }
  .portrait > :not(.photo) {
    grid-column: 2;
  }
  .photo {
    grid-column: 1;
    grid-row: 1 / span 4;
    align-self: start;
    width: clamp(8rem, 14vw, 13rem);
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
  @media (max-width: 759px) {
    .portrait {
      display: block;
    }
    .photo {
      display: block;
      width: 7rem;
      margin-bottom: 1.5rem;
    }
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
  .intro {
    max-width: 36rem;
    margin: -0.5rem 0 2rem;
    font-size: 1rem;
    line-height: 1.6;
  }
  .links {
    display: flex;
    gap: 1rem;
    margin: -0.75rem 0 2rem;
    padding: 0;
    list-style: none;
  }
  .links a {
    display: block;
    color: var(--ink);
    transition: color 0.15s;
  }
  .links svg {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    fill: currentColor;
  }
  .links a:hover,
  .links a:focus-visible {
    color: var(--accent-text);
    outline: none;
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem 1.75rem;
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
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
    font: 500 calc(0.6875rem * var(--k))/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .none {
    margin: 2rem 0;
    color: var(--mute);
  }
</style>
