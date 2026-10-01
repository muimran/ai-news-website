<script>
  /* A story, inside the same frame as everything else: it scrolls down
     between the header row and the topics row, as a list does. The photo
     the reader picked grows into the top of it; below, a column of facts
     the picture column's width beside the text, one rule between them,
     and the next three stories in the same two columns at its foot. */
  import { base } from '$app/paths';
  import { kindLabel, sectionLabel, formatNumber, FORMATS } from '$lib/labels.js';
  import { photo, setLastRead, two, DAY_DATE, STR } from '$lib/site/reel.js';
  import Mark from '../../Mark.svelte';
  import GridPage from '../../GridPage.svelte';
  import { gridTopic, storyUrl } from '../../grid.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const L = $derived(STR[lang]);
  const s = $derived(data.story);
  const pic = $derived(photo(s));
  const next = $derived(data.next.slice(0, 3));
  const credit = $derived(
    data.credit ? `${lang === 'bn' ? 'ছবি' : 'Photo'}: ${data.credit}` : lang === 'bn' ? 'ছবি: আনস্প্ল্যাশ (প্রতীকী)' : 'Photo: Unsplash (stand-in)'
  );

  /* Only one element may hold the `hero` name at a time: this page's photo,
     or the next story the reader just picked. Resets on every story. */
  let picked = $state(null);
  $effect(() => {
    void data.story.slug;
    picked = null;
    setLastRead(data.story.slug);
  });
</script>

<svelte:head>
  <title>{s.title} — Ground Truth</title>
  <meta name="description" content={s.dek} />
</svelte:head>

<GridPage {lang} section={s.section}>
<div class="story">
  <figure class="hero">
    <div class="media" style:view-transition-name={picked ? null : 'hero'}>
      {#if pic}<img src={pic.src} srcset={pic.srcset} sizes="(max-width: 759px) 100vw, 85vw" alt="" />{/if}
    </div>
    <figcaption>{credit}</figcaption>
  </figure>

  <div class="read">
    <aside class="facts">
      <a class="fact topic fill" href={gridTopic(s.section, lang)}><Mark key={s.section} />{sectionLabel(s.section, lang)}</a>
      {#if FORMATS[s.kind]}<span class="fact mono kind">{kindLabel(s.kind, lang)}</span>{/if}
      <span class="fact mono">{DAY_DATE[lang].format(new Date(s.date))}</span>
      <span class="fact mono">{formatNumber(s.readTime, lang)} {L.min}</span>
      {#if data.writer}
        <a class="fact writer fill" href="{base}/grid/en/author/{data.writer.slug}">
          <span class="face">{#if data.writer.photo}<img src={data.writer.photo} alt="" />{/if}</span>
          <span class="who"><b>{s.author}</b>{#if data.writer.role}<small>{data.writer.role}</small>{/if}</span>
        </a>
      {:else}
        <span class="fact"><b>{s.author}</b></span>
      {/if}
      {#if s.location}<span class="fact mono">{s.location}</span>{/if}
      {#if data.translated}
        <a class="fact mono fill other" href={data.gridAlt[other]} hreflang={other} lang={other}>{L.readOther} →</a>
      {/if}
    </aside>

    <article class="text" {lang}>
      <h1>{s.title}</h1>
      {#if s.dek}<p class="dek">{s.dek}</p>{/if}
      <div class="body">{@html data.html}</div>
    </article>
  </div>

  <!-- the same two columns carry on: the label where the facts were, the
       next three beside it, then the topics as the page's foot -->
  <section class="next" aria-labelledby="next-h">
    <p class="lab" id="next-h">{L.next} →</p>
    <div class="strip">
      {#each next as it (it.story.slug)}
        {@const p = photo(it.story)}
        <a class="cell fill" href={storyUrl(it.story)} onclick={() => (picked = it.story.slug)}>
          <span class="cmedia" style:view-transition-name={picked === it.story.slug ? 'hero' : null}>
            {#if p}<img src={p.src} srcset={p.srcset} sizes="(max-width: 759px) 6rem, 25vw" alt="" loading="lazy" />{/if}
          </span>
          <span class="ct"><b>{two(it.n, lang)}</b>{it.story.title}</span>
        </a>
      {/each}
    </div>
  </section>
</div>
</GridPage>

<style>

  /* ---- the photo, the full width of the open page ---- */
  .hero {
    margin: 0;
  }
  .media {
    position: relative;
    height: min(62vh, 44vw);
    background: var(--i3);
  }
  .media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  figcaption {
    height: var(--label);
    padding: 0 var(--in) 0 calc(var(--pic) + var(--in));
    border-bottom: var(--line) solid var(--rule);
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.04em;
    color: var(--mute);
    background: linear-gradient(to right, transparent calc(var(--pic) - 1px), var(--rule) 0 var(--pic), transparent 0);
  }

  /* ---- facts | text, one rule between ---- */
  .read {
    display: grid;
    grid-template-columns: var(--pic) minmax(0, 1fr);
    border-bottom: var(--line) solid var(--rule);
  }
  .facts {
    align-self: start;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
  }
  /* the rule runs the text's full height, whatever the facts' */
  .read::before {
    content: '';
    grid-column: 1;
    grid-row: 1;
    justify-self: end;
    width: var(--line);
    background: var(--rule);
  }
  .facts {
    grid-column: 1;
    grid-row: 1;
  }
  .text {
    grid-column: 2;
    grid-row: 1;
  }
  .fact {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: var(--u) var(--in);
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    text-decoration: none;
    font-size: calc(0.875rem * var(--k));
  }
  .fact.mono {
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .topic {
    font-weight: 600;
  }
  .kind {
    color: var(--i);
  }
  .other {
    color: var(--o-text);
  }
  .writer {
    align-items: flex-start;
    gap: 0.8rem;
  }
  .face {
    flex: none;
    width: 2.75rem;
    aspect-ratio: 5 / 7;
    overflow: hidden;
    background: var(--i3);
  }
  .face img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1);
  }
  .who {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .who b {
    font-size: 1rem;
    font-weight: 600;
    font-stretch: 85%;
  }
  .who small {
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .writer:hover small,
  .writer:focus-visible small {
    color: inherit;
  }

  .text {
    padding: 2.25rem clamp(1.25rem, 4vw, 4rem) 5rem clamp(1.5rem, 3vw, 3rem);
    min-width: 0;
  }
  h1 {
    max-width: 16em;
    margin: 0 0 1.5rem;
    font-size: clamp(2.4rem, 1rem + 3.6vw, 5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.95;
    letter-spacing: -0.012em;
    text-wrap: balance;
  }
  .dek {
    max-width: 32em;
    margin: 0 0 2.5rem;
    font-size: clamp(1.2rem, 1rem + 0.6vw, 1.5rem);
    line-height: 1.4;
  }
  .body {
    max-width: 38rem;
    font-size: 1.125rem;
    line-height: 1.65;
  }
  .text:lang(bn) h1 {
    line-height: 1.2;
    letter-spacing: 0;
  }
  .text:lang(bn) .body {
    line-height: 1.85;
  }
  .body :global(p) {
    margin: 0 0 1.1em;
  }
  .body :global(h2),
  .body :global(h3) {
    margin: 2em 0 0.5em;
    font-size: 1.125rem;
    font-weight: 620;
  }
  /* a wide photo, in this design held to the text's width */
  .body :global(figure.wide) {
    margin: 2em 0;
  }
  .body :global(figure.wide img) {
    display: block;
    width: 100%;
  }
  .body :global(figure.wide figcaption) {
    margin-top: 0.6em;
    font: 400 calc(0.6875rem * var(--k)) / 1.4 var(--mono);
    color: var(--mute);
  }
  .body :global(blockquote) {
    margin: 2em 0;
    padding: 0.2em 0 0.2em var(--in);
    border-left: var(--frame) solid var(--o);
    font-size: clamp(1.5rem, 1rem + 1.4vw, 2.1rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1.1;
  }
  .body :global(blockquote p) {
    margin: 0;
  }
  .body :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--o);
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.18em;
  }

  /* ---- what's next: the story's two columns, carried on ---- */
  .next {
    display: grid;
    grid-template-columns: var(--pic) minmax(0, 1fr);
  }
  .lab {
    margin: 0;
    padding: var(--in);
    border-right: var(--line) solid var(--rule);
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .cell {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--hair);
    color: var(--ink);
    text-decoration: none;
  }
  .cell:last-child {
    border-right: 0;
  }
  .cmedia {
    position: relative;
    aspect-ratio: 16 / 9;
    background: var(--i3);
  }
  .cmedia img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ct {
    padding: var(--u) var(--in) var(--u);
    font-size: 1.05rem;
    font-weight: 600;
    font-stretch: 80%;
    line-height: 1.15;
  }
  .ct b {
    margin-right: 0.5rem;
    font-weight: 640;
    font-stretch: 75%;
    color: var(--o-text);
  }
  .cell:hover .ct b,
  .cell:focus-visible .ct b {
    color: inherit;
  }

  @media (max-width: 759px) {
    .media {
      height: 62vw;
    }
    figcaption {
      padding-left: var(--in);
      background: none;
    }
    .read {
      grid-template-columns: minmax(0, 1fr);
    }
    .read::before {
      display: none;
    }
    .facts {
      position: static;
      flex-direction: row;
      flex-wrap: wrap;
      border-right: 0;
      border-bottom: var(--line) solid var(--rule);
    }
    .text {
      grid-row: 2;
      grid-column: 1;
      padding: var(--in) var(--in) calc(4 * var(--u));
    }
    .fact {
      padding: var(--u) var(--in);
      border-right: 1px solid var(--hair);
    }
    .writer {
      flex-basis: 100%;
      border-right: 0;
    }
    h1 {
      font-size: 2.3rem;
    }
    .body {
      font-size: 1.0625rem;
    }
    /* a phone: the label above, then the three as ledger rows */
    .next {
      grid-template-columns: minmax(0, 1fr);
    }
    .lab {
      padding: var(--u) var(--in);
      border-right: 0;
      border-bottom: 1px solid var(--hair);
    }
    .strip {
      grid-template-columns: minmax(0, 1fr);
    }
    .cell {
      flex-direction: row;
      border-right: 0;
    }
    .cell + .cell {
      border-top: 1px solid var(--hair);
    }
    .cmedia {
      flex: none;
      width: 6rem;
      aspect-ratio: auto;
      min-height: 4.5rem;
      border-right: var(--line) solid var(--rule);
    }
    .ct {
      align-self: center;
      padding: var(--u) var(--in);
      font-size: 1rem;
    }
  }
</style>
