<script>
  /* The editorial trial, read down. Not the sideways pages stacked: one
     table of four equal columns runs the whole page, top to bottom, and
     every cell spans whole columns, so every rule meets the rule above it
     and the one below. The front is the edition's date over its three top
     stories: the lead across two columns, the two seconds beside it. Each
     topic opens on a slim ink band across the table, then its stories, the
     lead across two columns, left and right in turn. One picture to a
     topic, the lead's; the rest are words. Heights are the content's, not
     the screen's.

     Narrower, the four columns become two halves, on the same rules; on a
     phone, one column, the seconds set as rows with the picture beside them.
     The steps follow the table's own width, so opening the Latest pane
     narrows it the same way. */
  import { sectionLabel, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from '../../Mark.svelte';
  import BottomRow from '../../BottomRow.svelte';
  import { gridIndex, storyUrl } from '../../grid.js';

  let { lang, ed } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  const EDITION = {
    en: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD-u-nu-beng', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  };

  /* Where a topic's stories sit on the four columns, under its band (h):
     the lead (a) across two and both rows, the rest beside it, two rows of
     them; a topic with the lead on the right next. Fewer stories, wider
     cells, never an empty one; with one story beside it, the lead takes
     three columns (its picture two), so that story isn't left stretched. */
  const AREAS = ['a', 'b', 'c', 'd', 'e'];
  function quarters(count, right) {
    let rows;
    if (count >= 5) rows = ['a a b c', 'a a d e'];
    else if (count === 4) rows = ['a a b c', 'a a d d'];
    else if (count === 3) rows = ['a a b b', 'a a c c'];
    else if (count === 2) rows = ['a a a b'];
    else rows = ['a a a a'];
    if (right) rows = rows.map((r) => r.split(' ').reverse().join(' '));
    return ['h h h h', ...rows].map((r) => `"${r}"`).join(' ');
  }
  /* on two halves: the lead across both, the rest two to a row */
  function halves(count) {
    const rows = ['h h', 'a a'];
    if (count >= 5) rows.push('b c', 'd e');
    else if (count === 4) rows.push('b c', 'd d');
    else if (count === 3) rows.push('b c');
    else if (count === 2) rows.push('b b');
    return rows.map((r) => `"${r}"`).join(' ');
  }

  /* the story's type leads its byline, where there's one */
  function byline(s) {
    const kind = KINDS.includes(s.kind) ? kindLabel(s.kind, lang) : null;
    return [kind, s.author, SHORT_DATE[lang].format(new Date(s.date)), `${num(s.readTime)} ${L.min}`]
      .map((text, i) => ({ text, kind: i === 0 }))
      .filter((p) => p.text);
  }
</script>

<svelte:head>
  <title>Second Order — {L.tagline}</title>
</svelte:head>

{#snippet story(s, role, area, opts = {})}
  {@const pic = role === 'word' ? null : photo(s)}
  <a
    class="st {role}"
    class:toned={pic}
    class:fill={!pic}
    class:onfront={opts.front}
    style:--ga={area}
    style:--card={pic ? s.tone?.bg : null}
    style:--on={pic ? s.tone?.fg : null}
    href={storyUrl(s)}
  >
    <span class="top">
      <!-- the front mixes topics, so its stories say whose they are -->
      {#if opts.front}<span class="kick"><Mark key={s.section} size={14} /><span class="sl">{sectionLabel(s.section, lang)}</span></span>{/if}
      <span class="hl" class:serif={s.kind === 'Analysis'}>{s.title}</span>
    </span>
    <span class="more">
      {#if s.dek}<span class="dek">{s.dek}</span>{/if}
      <!-- a byline breaks only after a dot, never inside "18 min" -->
      <span class="by"
        >{#each byline(s) as part, i (i)}{i ? ' · ' : ''}<span class="nw" class:kind={part.kind}>{part.text}</span>{/each}</span
      >
      {#if opts.facts && (s.interviews || s.documents || s.reporting)}
        <span class="facts"
          >{L.method}: {[s.interviews && L.interviews(num(s.interviews), s.interviews), s.documents && L.documents(num(s.documents), s.documents), s.reporting]
            .filter(Boolean)
            .join(' · ')}</span
        >
      {/if}
    </span>
    {#if opts.quote}
      <span class="quote"><span class="qt">“{opts.quote.text}”</span><span class="who">{opts.quote.who}</span></span>
    {/if}
    {#if pic}
      <span class="art"><img src={pic.src} srcset={pic.srcset} sizes={role === 'lead' ? '(max-width: 759px) 100vw, 30vw' : '(max-width: 759px) 40vw, 25vw'} alt="" loading={opts.front ? 'eager' : 'lazy'} /></span>
    {/if}
  </a>
{/snippet}

<main class="vt">
  <h1 class="sr">Second Order — {L.tagline}</h1>
  <div class="table">
    <!-- the front: the edition's date, its three top stories -->
    <section class="band front" aria-label={FRONT[lang]}>
      <p class="folio"><time datetime={new Date(ed.date).toISOString().slice(0, 10)}>{EDITION[lang].format(new Date(ed.date))}</time></p>
      {@render story(ed.lead, 'lead', 'lead', { front: true, quote: ed.quote, facts: true })}
      {#each ed.seconds as s, i (s.slug)}
        {@render story(s, 'pic', i === 0 ? 'sa' : 'sb', { front: true })}
      {/each}
    </section>

    <!-- each topic, opening on its band -->
    {#each ed.pages as p, k (p.key)}
      <section
        class="band sec"
        aria-label={sectionLabel(p.key, lang)}
        style:--areas={quarters(p.stories.length, k % 2 === 1)}
        style:--areas-h={halves(p.stories.length)}
      >
        <header class="flag">
          <span class="ft"><Mark key={p.key} size={24} /><h2 class="name">{sectionLabel(p.key, lang)}</h2></span>
          <a class="all fill" href={gridIndex(lang, p.key)}>{L.count(num(p.total))} →</a>
        </header>
        {#each p.stories as s, i (s.slug)}
          {@render story(s, i === 0 ? 'lead' : 'word', AREAS[i])}
        {/each}
      </section>
    {/each}

    <a class="band door fill" href={gridIndex(lang)}>
      <span class="big">{L.all} →</span>
      <span class="dk">{L.count(num(ed.total))}</span>
    </a>
  </div>
</main>

<BottomRow {lang} />

<style>
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* the page scrolls as itself, between the header row and the topics row */
  .vt {
    container: vt / inline-size;
    box-sizing: border-box;
    margin: 0 var(--m) 0 calc(var(--m) + var(--side));
    padding: var(--top) 0 var(--bot);
    transition: margin-left 0.4s cubic-bezier(0.3, 0.7, 0.1, 1);
  }

  /* ---- the table: four columns, the same four in every band, parted by
     one rule (the gaps between cells, over the band's own ink). Its words
     sit a wider step in from the rules than the site's own, and each topic
     opens after a pause of open paper ---- */
  .table {
    --pad: calc(3 * var(--u));
    --pause: calc(4 * var(--u));
  }
  .band {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--line);
    border-bottom: var(--line) solid var(--rule);
    background: var(--rule);
  }
  .front {
    grid-template-areas: 'f f f f' 'lead lead sa sb';
    grid-template-rows: var(--label) auto;
  }
  .sec {
    grid-template-areas: var(--areas);
    margin-top: var(--pause);
  }

  /* the edition's date, across the table */
  .folio {
    grid-area: f;
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0 var(--pad);
    background: var(--paper);
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* ---- a topic's band: its mark and name, the way to all of it at the
     table's far edge, where the stories' words end ---- */
  .flag {
    grid-area: h;
    display: flex;
    align-items: stretch;
    min-width: 0;
    background: var(--ink);
    color: var(--paper);
  }
  .ft {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
    padding: calc(1.5 * var(--u)) var(--pad);
  }
  .ft :global(.mark) {
    flex: none;
  }
  .name {
    min-width: 0;
    margin: 0;
    font-size: clamp(1.5rem, 2.2cqi, 2rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 1;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .name:lang(bn),
  :global(.g:lang(bn)) .name {
    line-height: 1.2;
  }
  .all {
    flex: none;
    display: flex;
    align-items: center;
    padding: 0 var(--pad);
    color: var(--paper);
    text-decoration: none;
    font-size: calc(0.875rem * var(--k));
    font-weight: 540;
    line-height: 1;
    white-space: nowrap;
  }
  .flag .all::before {
    background: var(--paper);
  }
  .flag .all:hover,
  .flag .all:focus-visible {
    color: var(--ink);
  }

  /* ---- a story ---- */
  .st {
    grid-area: var(--ga);
    container-type: inline-size;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
    outline: none;
  }
  .st.toned {
    background: var(--card, var(--i3));
    color: var(--on, var(--ink));
  }
  /* every headline the same way down from its cell's top, so a row's
     headlines start level; on the front, the topic's line above them */
  .top {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: var(--u);
    padding: var(--pad) var(--pad) 0;
  }
  .onfront .top {
    padding-top: var(--u);
  }
  .more {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: calc(1.5 * var(--u));
    padding: calc(2 * var(--u)) var(--pad) var(--pad);
  }
  .kick {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    height: var(--label);
    font-size: calc(0.875rem * var(--k));
    font-weight: 540;
    white-space: nowrap;
  }
  .sl {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hl {
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  /* an Analysis speaks in the reading face, as a paper sets opinion */
  .hl.serif {
    font-family: var(--read);
    font-weight: 400;
    font-stretch: 100%;
    line-height: 1.06;
    letter-spacing: -0.015em;
  }
  .hl:lang(bn),
  :global(.g:lang(bn)) .hl {
    line-height: 1.28;
  }
  .dek {
    max-width: 36em;
    font-family: var(--read);
    font-size: 1rem;
    line-height: 1.5;
    text-wrap: pretty;
  }
  .by,
  .facts {
    font: 500 calc(0.6875rem * var(--k)) / 1.35 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .nw {
    white-space: nowrap;
  }
  .kind {
    color: var(--i);
  }
  .toned .kind {
    color: inherit;
    opacity: 0.75;
  }
  .facts {
    padding-top: var(--u);
    border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  }
  .art {
    position: relative;
    display: block;
    overflow: hidden;
  }
  .art img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 100%;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%);
    mask-image: linear-gradient(to bottom, transparent, #000 30%);
    transition: transform 0.8s cubic-bezier(0.3, 0.7, 0.1, 1);
  }
  @media (hover: hover) {
    .toned:hover .art img {
      transform: scale(1.03);
    }
    .toned:hover .hl {
      text-decoration: underline;
      text-decoration-thickness: 0.06em;
      text-underline-offset: 0.12em;
    }
    .fill:hover .kind {
      color: var(--i2);
    }
  }

  /* The lead across two columns, on those same two columns: its words in
     the first, exactly a column wide like every other story's, its picture
     in the second, under a headline that runs across both. */
  /* (no container of its own: a container can't take its parent's
     columns, so its sizes below go by the table's width instead) */
  .lead {
    container-type: normal;
  }
  .lead.toned {
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }
  .lead .top {
    grid-column: 1 / -1;
  }
  .lead .more {
    grid-column: 1;
    grid-row: 2;
  }
  .lead .quote {
    grid-column: 1;
    grid-row: 4;
  }
  .lead .art {
    grid-column: 2 / -1;
    grid-row: 2 / 5;
    min-height: calc(26 * var(--u));
  }
  .lead .art img {
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%), linear-gradient(to right, transparent, #000 20%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to bottom, transparent, #000 30%), linear-gradient(to right, transparent, #000 20%);
    mask-composite: intersect;
  }
  .lead .hl {
    font-size: clamp(2rem, 3.7cqi, 5rem);
  }
  .lead .dek {
    font-size: 1.125rem;
  }
  .front .lead .hl {
    font-size: clamp(2.2rem, 4.5cqi, 6.4rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 0.94;
  }
  .quote {
    display: flex;
    flex-direction: column;
    gap: var(--u);
    margin: 0 var(--pad) var(--pad);
    padding-top: calc(2 * var(--u));
    border-top: var(--line) solid currentColor;
  }
  .qt {
    font: italic 400 clamp(1.3rem, 2.3cqi, 2rem) / 1.18 var(--read);
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .who {
    font: 500 calc(0.6875rem * var(--k)) / 1.35 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* a second on the front: the picture at least its own 3:2, taking what
     the lead's height leaves under the words, down to the cell's foot */
  .pic .hl {
    font-size: clamp(1.3rem, 7.6cqi, 2.1rem);
  }
  .pic .art {
    flex: 1 0 auto;
    aspect-ratio: 3 / 2;
  }
  /* words alone: the headline bigger, the byline at the cell's foot */
  .word .hl {
    font-size: clamp(1.4rem, 9cqi, 2.4rem);
  }
  .word .more {
    flex: 1 0 auto;
  }
  .word .by {
    margin-top: auto;
  }

  /* ---- the way to every story, one line ---- */
  .door {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--pad);
    padding: var(--pad);
    border-bottom: 0;
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
  }
  .big {
    font-size: clamp(1.5rem, 2.2cqi, 2rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  .dk {
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ---- two halves: the lead across both, on both; the rest two to a row ---- */
  @container vt (max-width: 939px) {
    .band {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .front {
      grid-template-areas: 'f f' 'lead lead' 'sa sb';
      grid-template-rows: var(--label) auto auto;
    }
    .sec {
      grid-template-areas: var(--areas-h);
    }
    .lead .hl {
      font-size: clamp(1.9rem, 7cqi, 3.4rem);
    }
    .front .lead .hl {
      font-size: clamp(2.1rem, 8.4cqi, 4rem);
    }
    .lead .dek {
      font-size: 1.0625rem;
    }
    .qt {
      font-size: clamp(1.25rem, 3.6cqi, 1.6rem);
    }
  }

  /* ---- a phone: one column. The lead's picture under its headline, so the
     first screen has both; the seconds as rows, the picture beside the
     words; words alone as they are ---- */
  @container vt (max-width: 519px) {
    /* on a phone the words keep the site's own step in, under the header's */
    .table {
      --pad: var(--in);
      --pause: calc(3 * var(--u));
    }
    .band {
      grid-template-columns: minmax(0, 1fr);
    }
    .front,
    .sec {
      grid-template-areas: none;
      grid-template-rows: none;
    }
    .front > .folio {
      height: var(--label);
    }
    .st,
    .flag,
    .folio {
      grid-area: auto;
    }
    .lead.toned {
      display: flex;
      flex-direction: column;
    }
    .lead .art {
      order: 1;
      min-height: 0;
      aspect-ratio: 2 / 1;
    }
    .lead .more {
      order: 2;
      padding-top: var(--u);
    }
    .lead .quote {
      order: 3;
    }
    .lead .art img {
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 85%, transparent);
      mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 85%, transparent);
    }
    .lead .hl {
      font-size: clamp(1.9rem, 10cqi, 2.6rem);
    }
    .front .lead .hl {
      font-size: clamp(2.2rem, 11.5cqi, 3.2rem);
    }
    .qt {
      font-size: 1.45rem;
    }
    /* a second: its words, the picture beside them to the cell's edge */
    .pic.toned {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 38%;
      grid-template-rows: auto 1fr;
    }
    .pic .top {
      grid-column: 1;
      grid-row: 1;
      padding-right: var(--u);
    }
    .pic .more {
      grid-column: 1;
      grid-row: 2;
      padding-right: var(--u);
    }
    .pic .art {
      grid-column: 2;
      grid-row: 1 / 3;
      margin: 0;
      aspect-ratio: auto;
      min-height: calc(20 * var(--u));
    }
    .pic .art img {
      object-position: 60% 100%;
      -webkit-mask-image: linear-gradient(to right, transparent, #000 30%);
      mask-image: linear-gradient(to right, transparent, #000 30%);
    }
    .pic .hl {
      font-size: 1.45rem;
    }
    .pic .dek {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .word .hl {
      font-size: 1.5rem;
    }
  }
</style>
