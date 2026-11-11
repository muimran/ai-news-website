<script>
  /* Desk's one panel: the menu, with search as its first line. It drops
     from under the bar as a sheet of paper. Empty, it is the menu: the
     topics, the formats, the newsroom's own pages. Typing turns it into
     results.

     The search is the site's own, unchanged: every story read headline to
     last line, fetched the first time the panel opens, with MiniSearch
     (loaded only then too). Whole words, word beginnings, small typos
     forgiven, best matches first; the writers and topics a search names;
     chips to narrow by topic or kind; the matched words marked; "did you
     mean" and the latest stories when nothing matches; the last few
     searches remembered in this browser. Only its look is Desk's. */
  import { tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { base } from '$app/paths';
  import { sectionLabel, formatLabel, formatNumber, kindLabel } from '$lib/labels.js';
  import { STR, SHORT_DATE, snippet, marked, photo, closeTo, two } from '$lib/site/reel.js';
  import { storyUrl } from '../grid.js';
  import { deskTopic, deskFormat, deskAuthor, deskAuthors } from './urls.js';

  /* open: null, 'menu', or 'search' (the field takes the cursor at once) */
  let { lang, topics, formats, pages, open = $bindable(null) } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);
  const topicNo = (key) => two(topics.findIndex((t) => t.key === key) + 1, lang);

  let q = $state('');
  let input = $state();
  let indexes = $state({});
  const index = $derived(indexes[lang]);
  const results = $derived.by(() => {
    if (!index || !q.trim()) return { list: [], some: false };
    let hits = index.search(q);
    const some = !hits.length && q.trim().split(/\s+/).length > 1;
    if (some) hits = index.search(q, { combineWith: 'OR' });
    // a writer's name and a dateline aren't in the row, so a match in either
    // puts it at the start of the quote
    const via = (r, field) => Object.values(r.match).some((fields) => fields.includes(field));
    return {
      list: hits.map((r) => ({ ...index.byId.get(r.id), terms: r.terms, byWriter: via(r, 'author'), byPlace: via(r, 'location') })),
      some
    };
  });
  const found = $derived(results.list);

  /* the writers and topics a search names: every word searched starts a
     word of the name (words of two letters or fewer don't count) */
  const named = (label) => {
    const want = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const have = label.toLowerCase().split(/[\s&,]+/).filter(Boolean);
    return want.length > 0 && want.every((w) => have.some((h) => h.startsWith(w)));
  };
  const people = $derived(index && q.trim() ? index.writers.filter((w) => named(`${w.name} ${w.name_bn ?? ''}`)).slice(0, 3) : []);
  const places = $derived(q.trim() ? topics.filter((t) => named(`${sectionLabel(t.key, lang)} ${t.key}`)) : []);

  /* nothing found: the nearest spelling, then the topics, then the newest */
  const nothing = $derived(!!index && !!q.trim() && !found.length && !people.length && !places.length);
  const meant = $derived.by(() => {
    if (!nothing) return null;
    const want = q.trim().toLowerCase();
    return (
      index
        .suggest(q)
        .map((x) => x.suggestion)
        .find((x) => x !== want && closeTo(want, x)) ?? null
    );
  });

  /* the last few searches followed through, in this browser only (the
     same few the main site keeps) */
  let recent = $state([]);
  $effect.pre(() => {
    try {
      recent = JSON.parse(localStorage.getItem('nt-recent') || '[]');
    } catch {
      /* no storage: none remembered */
    }
  });
  function remember() {
    const term = q.trim();
    if (!term) return;
    recent = [term, ...recent.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    try {
      localStorage.setItem('nt-recent', JSON.stringify(recent));
    } catch {
      /* it lasts the visit */
    }
  }
  function forget() {
    recent = [];
    try {
      localStorage.removeItem('nt-recent');
    } catch {
      /* nothing to remove */
    }
  }

  /* chips narrow a search to one topic or one kind; a new search clears them */
  let only = $state({ section: null, kind: null });
  $effect(() => {
    q;
    only = { section: null, kind: null };
  });
  const tally = (key) => {
    const m = new Map();
    for (const s of found) if (s[key]) m.set(s[key], (m.get(s[key]) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const bySection = $derived(tally('section'));
  const byKind = $derived(tally('kind'));
  const shown = $derived(found.filter((s) => (!only.section || s.section === only.section) && (!only.kind || s.kind === only.kind)));

  $effect(() => {
    if (!open) return void (q = '');
    // asked for search, or a wide screen with a mouse: type straight away
    if (open === 'search' || matchMedia('(hover: hover) and (min-width: 760px)').matches) tick().then(() => input?.focus());
    if (indexes[lang]) return;
    const l = lang;
    Promise.all([fetch(`${base}/search/${l}.json`).then((r) => r.json()), import('minisearch')]).then(
      ([{ stories: rows, writers }, { default: MiniSearch }]) => {
        const ms = new MiniSearch({
          idField: 'id',
          fields: ['title', 'dek', 'author', 'location', 'text'],
          searchOptions: {
            boost: { title: 4, dek: 2, author: 2, location: 1.5 },
            prefix: (term) => term.length >= 3,
            fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
            combineWith: 'AND'
          }
        });
        const docs = rows.map((r) => ({ ...r, id: `${r.ym}/${r.slug}` }));
        ms.addAll(docs);
        indexes = {
          ...indexes,
          [l]: {
            search: (text, opts) => ms.search(text, opts),
            suggest: (text) => ms.autoSuggest(text, { fuzzy: 2, prefix: false, combineWith: 'AND' }),
            byId: new Map(docs.map((r) => [r.id, r])),
            newest: docs.slice(0, 3),
            writers
          }
        };
      }
    );
  });

  /* Esc shuts it; / or ⌘K opens it on search from anywhere */
  function keys(e) {
    if (e.key === 'Escape' && open) open = null;
    else if ((e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      open = 'search';
      tick().then(() => input?.focus());
    }
  }
  function blind() {
    return {
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280,
      easing: cubicOut,
      css: (t) => `clip-path: inset(0 0 ${(1 - t) * 100}% 0)`
    };
  }
</script>

<svelte:window onkeydown={keys} />

{#snippet words(text, terms)}{#each marked(text, terms) as p, i (i)}{#if p.hit}<mark>{p.t}</mark>{:else}{p.t}{/if}{/each}{/snippet}

{#snippet result(s, live)}
  {@const pic = photo(s)}
  <a class="res" href={storyUrl(s)} onclick={live ? remember : undefined}>
    <span class="sq" style:--bg={s.tone?.bg}>{#if pic}<img src={pic.small} alt="" loading="lazy" />{/if}</span>
    <span class="mono when">{SHORT_DATE[lang].format(new Date(s.date))}</span>
    <span class="what">
      <span class="hl">{#if live}{@render words(s.title, s.terms)}{:else}{s.title}{/if}</span>
      <span class="snip"
        >{#if live}{@render words((s.byWriter ? `${s.author} · ` : '') + (s.byPlace && s.location ? `${s.location} · ` : '') + snippet(s, s.terms), s.terms)}{:else}{s.dek}{/if}</span
      >
      <span class="mono where">{sectionLabel(s.section, lang)}</span>
    </span>
  </a>
{/snippet}

{#if open}
  <button type="button" class="veil" aria-label={L.close} onclick={() => (open = null)}></button>
  <div class="panel" id="desk-menu" transition:blind>
    <div class="find" role="search">
      <label>
        <span class="sr">{L.searchAll}</span>
        <input bind:this={input} bind:value={q} type="search" placeholder={L.searchAll} autocomplete="off" onkeydown={(e) => e.key === 'Enter' && remember()} />
      </label>
      {#if !q.trim() && recent.length}
        <div class="recent">
          <span class="mono lbl">{L.recent}</span>
          {#each recent as term (term)}
            <button type="button" class="mono chip" onclick={() => ((q = term), input?.focus())}>{term}</button>
          {/each}
          <button type="button" class="mono forget" onclick={forget}>{L.clear}</button>
        </div>
      {/if}
    </div>

    {#if q.trim()}
      <div class="found">
        <p class="mono status" aria-live="polite">
          {#if !index}{L.loading}{:else if found.length}{L.count(num(found.length))}{:else if !people.length && !places.length}{L.none}{/if}
        </p>
        {#if index && results.some && found.length}<p class="note">{L.some}</p>{/if}

        {#if nothing}
          {#if meant}<p class="meant">{L.meant} <button type="button" onclick={() => (q = meant)}>{meant}</button>?</p>{/if}
          <p class="mono lbl">{L.tryTopic}</p>
          <div class="chips">
            {#each topics as t (t.key)}<a class="mono chip" href={deskTopic(t.key, lang)}>{sectionLabel(t.key, lang)}</a>{/each}
          </div>
          <p class="mono lbl">{L.newest}</p>
          {#each index.newest as s (s.id)}{@render result(s, false)}{/each}
        {/if}

        {#each people as w (w.slug)}
          <a class="res named" href={deskAuthor(w.slug, lang)} onclick={remember}>
            <span class="sq">{#if w.photo}<img src={w.photo} alt="" loading="lazy" />{/if}</span>
            <span class="mono when">{L.writer}</span>
            <span class="what">
              <span class="hl">{lang === 'bn' && w.name_bn ? w.name_bn : w.name}</span>
              <span class="snip">{lang === 'bn' && w.role_bn ? w.role_bn : w.role}</span>
              <span class="mono where">{L.count(num(w.count))}</span>
            </span>
          </a>
        {/each}
        {#each places as t (t.key)}
          <a class="res named" href={deskTopic(t.key, lang)} onclick={remember}>
            <span class="sq no mono">{topicNo(t.key)}</span>
            <span class="mono when">{L.topic}</span>
            <span class="what">
              <span class="hl">{sectionLabel(t.key, lang)}</span>
              <span class="mono where">{L.count(num(t.count))}</span>
            </span>
          </a>
        {/each}

        {#if found.length > 1 && (bySection.length > 1 || byKind.length > 1)}
          <div class="chips" role="group" aria-label={L.topics}>
            <button type="button" class="mono chip" aria-pressed={!only.section && !only.kind} onclick={() => (only = { section: null, kind: null })}
              >{L.any} <small>{num(found.length)}</small></button
            >
            {#if bySection.length > 1}
              {#each bySection as [key, n] (key)}
                <button type="button" class="mono chip" aria-pressed={only.section === key} onclick={() => (only = { ...only, section: only.section === key ? null : key })}
                  >{sectionLabel(key, lang)} <small>{num(n)}</small></button
                >
              {/each}
            {/if}
            {#if byKind.length > 1}
              {#each byKind as [key, n] (key)}
                <button type="button" class="mono chip kind" aria-pressed={only.kind === key} onclick={() => (only = { ...only, kind: only.kind === key ? null : key })}
                  >{kindLabel(key, lang)} <small>{num(n)}</small></button
                >
              {/each}
            {/if}
          </div>
        {/if}
        {#each shown.slice(0, 50) as s (s.id)}{@render result(s, true)}{/each}
      </div>
    {:else}
      <div class="menu">
        <nav class="col" aria-label={L.topics}>
          <p class="mono lbl">{L.topics}</p>
          {#each topics as t, i (t.key)}
            <a class="row big" href={deskTopic(t.key, lang)}>
              <b class="mono">{two(i + 1, lang)}</b>
              <span class="nm">{sectionLabel(t.key, lang)}</span>
              <span class="mono ct">{L.count(num(t.count))}</span>
            </a>
          {/each}
        </nav>
        <nav class="col" aria-label={L.formats}>
          {#if formats.length}
            <p class="mono lbl">{L.formats}</p>
            {#each formats as f (f.key)}
              <a class="row" href={deskFormat(f.key, lang)}><span class="nm">{formatLabel(f.key, lang)}</span><span class="mono ct">{num(f.count)}</span></a>
            {/each}
          {/if}
        </nav>
        <nav class="col" aria-label={lang === 'bn' ? 'নিউজরুম' : 'The newsroom'}>
          <p class="mono lbl">{lang === 'bn' ? 'নিউজরুম' : 'The newsroom'}</p>
          <a class="row" href={deskAuthors(lang)}><span class="nm">{L.reporters}</span></a>
          {#each pages as p (p.slug)}
            <a class="row" href={p.href}><span class="nm">{p.title}</span></a>
          {/each}
          <p class="blurb">{L.blurb}</p>
        </nav>
      </div>
    {/if}
  </div>
{/if}

<style>
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  .mono {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }

  /* the page behind goes back; a press there shuts the panel */
  .veil {
    position: fixed;
    inset: var(--bar) 0 0 0;
    z-index: 3;
    margin: 0;
    padding: 0;
    border: 0;
    background: color-mix(in srgb, var(--ground) 78%, transparent);
    cursor: default;
  }
  /* a sheet of paper under the bar */
  .panel {
    position: fixed;
    top: var(--bar);
    right: 0;
    left: 0;
    z-index: 4;
    box-sizing: border-box;
    max-height: calc(100dvh - var(--bar));
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1.25rem var(--pad) 2.25rem;
    border-bottom: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
  }

  /* ---- the search line: as large as a headline ---- */
  .find input {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 0.35rem 0 0.6rem;
    border: 0;
    border-bottom: 2px solid var(--ink);
    border-radius: 0;
    background: none;
    color: var(--ink);
    font-family: var(--serif);
    font-size: calc(clamp(1.6rem, 3vw, 2.6rem) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 72;
    letter-spacing: var(--hls);
    line-height: 1.2;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }
  .find input::placeholder {
    color: var(--mute);
    opacity: 0.7;
  }
  .find input:focus {
    border-bottom-color: var(--accent);
  }
  .recent,
  .chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }
  .recent {
    margin-top: 0.9rem;
  }
  .lbl {
    margin: 0;
    color: var(--mute);
  }
  .recent .lbl {
    margin-right: 0.5rem;
  }
  .chip {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0;
    padding: 0.45rem 0.65rem 0.4rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    white-space: nowrap;
    cursor: pointer;
  }
  .chip small {
    font-size: inherit;
    color: var(--mute);
  }
  .chip:hover,
  .chip:focus-visible {
    background: var(--hair);
    outline: none;
  }
  .chip[aria-pressed='true'] {
    background: var(--ink);
    color: var(--card);
  }
  .chip[aria-pressed='true'] small {
    color: inherit;
    opacity: 0.6;
  }
  /* a kind, not a topic: a broken rule round it */
  .chip.kind {
    border-style: dashed;
  }
  .forget {
    margin: 0 0 0 0.4rem;
    padding: 0.45rem 0;
    border: 0;
    background: none;
    color: var(--mute);
    cursor: pointer;
  }
  .forget:hover,
  .forget:focus-visible {
    color: var(--ink);
    outline: none;
  }

  /* ---- the menu: the topics large, the formats and the newsroom beside ---- */
  .menu {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: 0 clamp(1.5rem, 4vw, 4rem);
    margin-top: 1.75rem;
  }
  .col .lbl {
    padding-bottom: 0.7rem;
    border-bottom: 1px solid var(--ink);
  }
  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid var(--hair);
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.25;
    outline: none;
  }
  .row .ct {
    flex: none;
    color: var(--mute);
  }
  .row:hover .nm,
  .row:focus-visible .nm {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }
  .big {
    display: grid;
    grid-template-columns: 1.75rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.9rem;
    padding: 0.75rem 0;
  }
  .big b {
    display: grid;
    place-items: center;
    height: 1.5rem;
    border: 1px solid var(--ink);
    letter-spacing: 0;
  }
  .big:hover b,
  .big:focus-visible b {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }
  .big .nm {
    font-family: var(--serif);
    font-size: calc(clamp(1.35rem, 2vw, 1.85rem) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 72;
    letter-spacing: var(--hls);
    line-height: calc(var(--hlh) + 0.08);
  }
  .blurb {
    max-width: 24em;
    margin: 1.4rem 0 0;
    color: var(--mute);
    font-size: 0.9375rem;
    line-height: 1.45;
  }

  /* ---- results ---- */
  .found {
    max-width: 62rem;
    margin-top: 1.1rem;
  }
  .status {
    margin: 0 0 0.9rem;
    color: var(--mute);
  }
  .note,
  .meant {
    margin: 0 0 1rem;
    font-size: 1rem;
    line-height: 1.4;
  }
  .meant button {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent);
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 0.18em;
    cursor: pointer;
  }
  .found .lbl {
    margin: 1.2rem 0 0.6rem;
  }
  .found .chips {
    margin: 0.4rem 0 0.9rem;
  }
  .res {
    display: grid;
    grid-template-columns: 4.25rem 5.25rem minmax(0, 1fr);
    align-items: start;
    gap: 1.1rem;
    padding: 0.9rem 0;
    border-top: 1px solid var(--hair);
    outline: none;
  }
  .sq {
    display: block;
    overflow: hidden;
    aspect-ratio: 1;
    border: 1px solid var(--ink);
    background: var(--bg, var(--hair));
  }
  .sq img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 100%;
  }
  .named .sq img {
    object-position: 50% 20%;
  }
  .sq.no {
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--card);
    font-size: 1rem;
    letter-spacing: 0;
  }
  .when {
    padding-top: 0.3rem;
    color: var(--mute);
    white-space: nowrap;
  }
  .what {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }
  .hl {
    font-family: var(--serif);
    font-size: calc(clamp(1.15rem, 1.5vw, 1.4rem) * var(--hk));
    font-weight: calc(var(--hw) - 60);
    font-variation-settings: 'opsz' 30;
    letter-spacing: calc(var(--hls) / 2);
    line-height: calc(var(--hlh) + 0.12);
    text-wrap: balance;
  }
  .res:hover .hl,
  .res:focus-visible .hl {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.16em;
  }
  .snip {
    color: var(--mute);
    font-size: 0.9375rem;
    line-height: 1.45;
  }
  .where {
    color: var(--mute);
  }
  /* the words searched, where they stand */
  mark {
    background: color-mix(in srgb, var(--accent) 26%, var(--card));
    color: var(--ink);
  }

  /* ---- a phone: one column; the date goes in with the words ---- */
  @media (max-width: 759px) {
    .panel {
      padding-top: 0.9rem;
    }
    .menu {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 1.75rem;
      margin-top: 1.4rem;
    }
    .res {
      grid-template-columns: 3.5rem minmax(0, 1fr);
      gap: 0.9rem;
    }
    .when {
      grid-column: 2;
      padding-top: 0;
    }
    .what {
      grid-column: 2;
      margin-top: -0.5rem;
    }
    .sq {
      grid-row: 1 / 3;
    }
  }
</style>
