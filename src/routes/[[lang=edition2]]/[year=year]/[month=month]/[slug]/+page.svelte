<script>
  /* A story, inside the same frame as everything else: it scrolls down
     between the header row and the topics row, as a list does. The photo
     the reader picked grows into the top of it; below, a column of facts
     the picture column's width beside the text, one rule between them,
     and the next three stories in the same two columns at its foot. */
  import { base } from '$app/paths';
  import { kindLabel, sectionLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, setLastRead, two, SHORT_DATE, FULL_DATE, STR } from '$lib/site/reel.js';
  import Mark from '../../../../Mark.svelte';
  import AlsoCard from '../../../../AlsoCard.svelte';
  import GridPage from '../../../../GridPage.svelte';
  import { gridTopic, storyUrl } from '../../../../grid.js';
  import { untrack, tick } from 'svelte';
  import { glide } from '../../../../glide.js';
  import { ui } from '../../../../ui.svelte.js';
  import { memory, reached, resumeAt, progress } from '../../../../memory.svelte.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const L = $derived(STR[lang]);
  const s = $derived(data.story);
  const pic = $derived(photo(s));

  /* A special: a hand-built page for one story, src/specials/<address>.svelte.
     It takes the story's place at the story's own address, inside the same
     header and Close; the story's record in the CMS still gives it its
     headline, writer, topic and image everywhere else (reel, Latest, lists,
     search). A translation shares its original's address, so one special
     serves both editions; it's told which to show. */
  const specials = import.meta.glob('/src/specials/*.svelte', { eager: true });
  const special = $derived(specials[`/src/specials/${s.slug}.svelte`] ?? null);
  const Special = $derived(special?.default ?? null);
  /* full screen, the way back sits where the special says, by exporting
     `back` from its module script: 'top-left' (the default), 'top-right',
     'bottom-left', 'bottom-right', or false for none (src/specials/README.md) */
  $effect(() => {
    ui.back = special?.back ?? 'top-left';
  });
  const next = $derived(data.next.slice(0, 3));
  /* our own illustrations, cut from free Unsplash photos, are credited as
     such; any other photo carries its own credit */
  const credit = $derived(
    pic?.illustration
      ? lang === 'bn' ? 'অলংকরণ: সেকেন্ড অর্ডার / আনস্প্ল্যাশ' : 'Illustration: Second Order / Unsplash'
      : data.credit ? `${lang === 'bn' ? 'ছবি' : 'Photo'}: ${data.credit}` : lang === 'bn' ? 'ছবি: আনস্প্ল্যাশ (প্রতীকী)' : 'Photo: Unsplash (stand-in)'
  );

  /* Only one element may hold the `hero` name at a time: this page's photo,
     or the next story the reader just picked. Resets on every story. */
  let picked = $state(null);
  $effect(() => {
    void data.story.slug;
    picked = null;
    setLastRead(data.story.slug);
  });

  /* While a wide photo is on screen the facts make way for it, folding
     into the Latest line as they do deeper in, so nothing sits on it. */
  let article = $state();
  /* Folded away, the facts come back while the mouse rests in their empty
     column, and leave again once it moves out of it (mouse only) */
  let peek = $state(false);
  let facts = $state();
  function near(e) {
    if (e.pointerType !== 'mouse' || !facts) return;
    const left = facts.parentElement.getBoundingClientRect().left;
    const box = facts.getBoundingClientRect(); // (slid sideways when folded; its height holds)
    // their part of the column only: the story's map below them stays put
    peek = e.clientX >= left && e.clientX < left + facts.offsetWidth && e.clientY >= box.top && e.clientY < box.bottom;
  }
  // the facts' height, so the map can sit just below them
  let factsH = $state(0);
  $effect(() => {
    if (!facts) return;
    const watch = new ResizeObserver(() => (factsH = facts.offsetHeight));
    watch.observe(facts);
    return () => watch.disconnect();
  });

  /* The story's map: its sections, by their headings, in the column under
     the facts, staying there when the facts fold away. The section being
     read is marked and its stretch of the line fills as it's read; those
     read are filled; a click glides to one. On a phone, just a thin line
     across the top, filling as the story is read. */
  let reach = $state(0); // how far through the whole story
  let at = $state(-1); // the section being read (-1: before the first)
  let within = $state(0); // how far through that section
  $effect(() => {
    void data.story.slug;
    const el = article;
    if (!el) return;
    let raf = 0;
    const look = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      const eye = innerHeight * 0.4; // where the reader's eye is taken to be
      reach = r.bottom <= innerHeight ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      const tops = [...el.querySelectorAll('.body h2')].map((h) => h.getBoundingClientRect().top);
      let k = -1;
      tops.forEach((t, n) => t < eye && (k = n));
      const end = k + 1 < tops.length ? tops[k + 1] : r.bottom;
      at = r.bottom <= innerHeight ? tops.length : k;
      within = k < 0 ? 0 : Math.min(1, Math.max(0, (eye - tops[k]) / (end - tops[k])));
    };
    const soon = () => (raf ||= requestAnimationFrame(look));
    look();
    addEventListener('scroll', soon, { capture: true, passive: true });
    addEventListener('resize', soon);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', soon, { capture: true });
      removeEventListener('resize', soon);
    };
  });
  // anything to say about how the story was reported
  const howWe = $derived(!!(s.interviews || s.documents || s.reporting || s.sources?.length));
  let how = $state();
  function toHow(e) {
    if (!how) return;
    e.preventDefault();
    glide(how);
  }
  let changes = $state();
  function toChanges(e) {
    if (!changes) return;
    e.preventDefault();
    glide(changes);
  }
  function openNote(mark) {
    const note = article.querySelector(`#${mark.getAttribute('aria-controls')}`);
    const open = mark.getAttribute('aria-expanded') !== 'true';
    mark.setAttribute('aria-expanded', String(open));
    note?.classList.toggle('open', open);
  }

  /* A term from the glossary, explained in a small card under it: a tap or
     click opens it (and keeps it open), the mouse resting on it shows it
     for as long as it stays, Escape or a tap anywhere else closes it. */
  let col = $state();
  let gloss = $state(null); // { k, term, meaning, top, left, pinned, el }
  let hoverTimer = null;
  function show(el, pinned) {
    const k = Number(el.dataset.gl);
    const entry = data.glossary[k];
    if (!entry) return;
    gloss?.el.setAttribute('aria-expanded', 'false');
    const c = col.getBoundingClientRect();
    const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
    const width = Math.min(288, c.width);
    gloss = { k, ...entry, el, pinned, top: r.bottom - c.top + 6, left: Math.max(0, Math.min(r.left - c.left, c.width - width)) };
    el.setAttribute('aria-expanded', 'true');
  }
  function hide() {
    clearTimeout(hoverTimer);
    gloss?.el.setAttribute('aria-expanded', 'false');
    gloss = null;
  }
  function tapped(e) {
    const mark = e.target.closest?.('.nref');
    if (mark) return openNote(mark);
    const term = e.target.closest?.('.gl');
    if (!term) return;
    if (gloss?.el === term && gloss.pinned) hide();
    else show(term, true);
  }
  function keyed(e) {
    const term = e.target.closest?.('.gl');
    if (term && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (gloss?.el === term) hide();
      else show(term, true);
    }
  }
  function hover(e) {
    if (e.pointerType !== 'mouse') return;
    const term = e.target.closest?.('.gl');
    if (!term) return;
    clearTimeout(hoverTimer);
    if (gloss?.el !== term) hoverTimer = setTimeout(() => show(term, false), 180);
  }
  function keep() {
    clearTimeout(hoverTimer);
  }
  function unhover(e) {
    if (e.pointerType !== 'mouse' || gloss?.pinned) return;
    // still on the term or its card: stay
    if (e.relatedTarget?.closest?.('.gl, .gloss')) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(hide, 150);
  }
  function away(e) {
    if (gloss && !e.target.closest?.('.gl, .gloss')) hide();
  }
  $effect(() => {
    void data.story.slug;
    return hide;
  });
  function jump(n) {
    const h = article?.querySelectorAll('.body h2')[n];
    if (h) glide(h);
  }
  $effect(() => {
    void data.story.slug;
    const figures = article?.querySelectorAll('figure.wide');
    if (!figures?.length) return;
    const seen = new Set();
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
        ui.wide = seen.size > 0;
      },
      // the frame the story scrolls in, or the screen where the page itself scrolls (a phone)
      { root: getComputedStyle(article.closest('main.page')).position === 'fixed' ? article.closest('main.page') : null }
    );
    figures.forEach((f) => watch.observe(f));
    return () => {
      watch.disconnect();
      ui.wide = false;
    };
  });

  /* How far in the reader is, remembered in their browser: the furthest
     paragraph reached, and read once the story's end is on screen. A story
     they'd begun before offers, under its dek, to take them back there. */
  let resume = $state(null); // { i: paragraph, p: how far } or null
  $effect(() => {
    void data.story.slug;
    if (!memory.ready || !article) return;
    const story = data.story;
    const el = article; // the bound element is cleared before this effect's teardown
    untrack(() => {
      const i = resumeAt(story);
      resume = i === null ? null : { i, p: progress(story) };
    });
    const blocks = () => [...el.querySelectorAll('.body > *')];
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      const p = r.bottom <= innerHeight ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      const i = Math.max(0, blocks().findIndex((b) => b.getBoundingClientRect().bottom > 90));
      reached(story, p, i);
      if (resume && p > resume.p) resume = null;
    };
    let timer = null;
    const soon = () => {
      timer ??= setTimeout(() => {
        timer = null;
        measure();
      }, 400);
    };
    untrack(measure); // (it reads and writes the memory; this effect mustn't follow it)
    addEventListener('scroll', soon, { capture: true, passive: true });
    addEventListener('pagehide', measure);
    return () => {
      clearTimeout(timer);
      untrack(measure);
      removeEventListener('scroll', soon, { capture: true });
      removeEventListener('pagehide', measure);
    };
  });
  async function pickUp() {
    const to = article?.querySelectorAll('.body > *')[resume.i];
    resume = null;
    await tick(); // the button's gone, and the text has moved up into its place
    if (to) glide(to);
  }

  /* The header lies over the top of the story: over the photo its words
     take the photo's own text colour (ink or white, read from the picture
     like a card's), and once the photo has gone up past it, ink on paper. */
  let media = $state();
  $effect(() => {
    void data.story.slug;
    if (!media || !pic) return;
    const check = () => {
      const top = document.querySelector('.top');
      ui.tone = media.getBoundingClientRect().bottom > (top?.offsetHeight ?? 60) / 2 ? 'pic' : 'paper';
    };
    check();
    addEventListener('scroll', check, { capture: true, passive: true });
    addEventListener('resize', check);
    return () => {
      removeEventListener('scroll', check, { capture: true });
      removeEventListener('resize', check);
      ui.tone = null;
    };
  });
</script>

<svelte:window onpointerdown={away} onkeydown={(e) => e.key === 'Escape' && hide()} />

<svelte:head>
  <title>{s.title} — Second Order</title>
</svelte:head>

{#if Special && data.fullscreen}
  <Special story={s} {lang} />
{:else if Special}
<GridPage {lang} section={s.section} reading foot={false}>
  <Special story={s} {lang} />
</GridPage>
{:else}
<GridPage {lang} section={s.section} reading foot={false}>
<div class="story">
  <!-- a phone's map: a line across the top, filling as the story is read -->
  <div class="line" style:--p={reach} aria-hidden="true"></div>
  <figure class="hero">
    <div class="media" bind:this={media} style:view-transition-name={picked ? null : 'hero'}>
      {#if pic}<img src={pic.src} srcset={pic.srcset} sizes="(max-width: 759px) 100vw, 85vw" alt="" />{/if}
    </div>
    <!-- in the reading column, so credit, headline and dek start on one line -->
    <figcaption><span class="col">{credit}</span></figcaption>
  </figure>

  <div class="read" onpointermove={near} onpointerleave={() => (peek = false)}>
    <aside class="facts" class:peek bind:this={facts}>
      <!-- Three parts and no more: one dateline (the topic, linked, then
           type, date in full, reading time, and the latest change if there
           is one); the writer and where they reported from; and a pointer
           to how the story was reported, set out at its foot. On a phone the
           topic leads on a line of its own, then a dotted line. -->
      <p class="fact dateline">
        <a class="topic" href={gridTopic(s.section, lang)}><Mark key={s.section} />{sectionLabel(s.section, lang)}</a>
        {#if KINDS.includes(s.kind)}<span class="kind">{kindLabel(s.kind, lang)}</span>{/if}
        <span>{FULL_DATE[lang].format(new Date(s.date))}</span>
        <span>{L.minRead(formatNumber(s.readTime, lang))}</span>
        {#if s.updates?.length}
          <a class="changed" class:fix={s.updates[0].kind === 'Correction'} href="#changes" onclick={toChanges}>{L[s.updates[0].kind]} {FULL_DATE[lang].format(new Date(s.updates[0].date)).replace(/ /g, '\u00a0')}</a>
        {/if}
      </p>
      {#if data.writer}
        <a class="fact writer wide fill" href="{base}/author/{data.writer.slug}">
          <span class="face">{#if data.writer.photo}<img src={data.writer.photo} alt="" />{/if}</span>
          <span class="who"><b>{s.author}</b>{#if s.location}<small>{s.location}</small>{/if}</span>
        </a>
      {:else}
        <span class="fact wide"><span class="who"><b>{s.author}</b>{#if s.location}<small>{s.location}</small>{/if}</span></span>
      {/if}
      {#if howWe}
        <a class="fact how fill" href="#how" onclick={toHow}>{L.method} <span aria-hidden="true">↓</span></a>
      {/if}
      {#if data.translated}
        <a class="fact mono wide fill other" href={data.gridAlt[other]} hreflang={other} lang={other}>{L.readOther} →</a>
      {/if}
    </aside>

    {#if data.sections.length > 1}
      <nav class="map" class:away={ui.wide} aria-label={L.inStory} style:--fh="{factsH}px">
        <ol>
          {#each data.sections as h, n (n)}
            <li class:past={n < at} class:on={n === at} style:--w={n === at ? within : null}>
              <button type="button" class="fill" aria-current={n === at ? 'location' : undefined} onclick={() => jump(n)}>{@html h}</button>
            </li>
          {/each}
        </ol>
      </nav>
    {/if}

    <article class="text" {lang} bind:this={article}>
      <!-- one reading column, centred in the space beside the facts -->
      <!-- the column hears taps on source marks and on explained terms -->
      <div class="col" bind:this={col} onclick={tapped} onkeydown={keyed} onpointerover={hover} onpointerout={unhover} role="presentation">
        <h1>{s.title}</h1>
        {#if s.dek}<p class="dek">{@html data.dekHtml}</p>{/if}
        {#if resume}<button type="button" class="again fill" onclick={pickUp}>{L.pickUp} · {formatNumber(Math.round(resume.p * 100), lang)}% ↓</button>{/if}
        <!-- a tap on a source mark opens its note in place (on a wide
             screen the notes already stand in the margin) -->
        <!-- the story's text is what Search reads in full (Pagefind, at build) -->
        <div class="body" data-pagefind-body>
          {#each data.blocks as b, n (n)}
            {#if b.also}<AlsoCard story={b.also} {lang} />{:else}{@html b.html}{/if}
          {/each}
        </div>
        {#if gloss}
          <div class="gloss" role="dialog" aria-label={gloss.term} style:top="{gloss.top}px" style:left="{gloss.left}px" onpointerover={keep} onpointerout={unhover}>
            <b>{gloss.term}</b>
            <p>{gloss.meaning}</p>
          </div>
        {/if}
        {#if howWe}
          <!-- how the story was reported, in the writer's own counts, and
               where to see the evidence for yourself -->
          <section class="foot-box how-box" id="how" bind:this={how}>
            <h2>{L.method}</h2>
            {#if s.interviews || s.documents || s.reporting}
              <p class="counts">
                {#if s.interviews}<span>{L.interviews(formatNumber(s.interviews, lang), s.interviews)}</span>{/if}
                {#if s.documents}<span>{L.documents(formatNumber(s.documents, lang), s.documents)}</span>{/if}
                {#if s.reporting}<span>{s.reporting}</span>{/if}
              </p>
            {/if}
            {#if s.sources?.length}
              <p class="files">
                {#each s.sources as x (x.url)}
                  <a class="file fill" href={x.url} target="_blank" rel="noopener">{x.label}<span class="out" aria-hidden="true">↗</span></a>
                {/each}
              </p>
            {/if}
          </section>
        {/if}
        {#if s.updates?.length}
          <!-- every change since publishing, dated, newest first -->
          <section class="foot-box changes" id="changes" bind:this={changes}>
            <h2>{L.changes}</h2>
            <ol>
              {#each s.updates as u, n (n)}
                <li>
                  <span class="when">{FULL_DATE[lang].format(new Date(u.date))}</span>
                  <b class:fix={u.kind === 'Correction'}>{L.change[u.kind]}</b>
                  <span>{u.note}</span>
                </li>
              {/each}
            </ol>
          </section>
        {/if}
      </div>
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
          <!-- the reel's spine: date and length up a strip beside the photo -->
          <span class="cbody">
            <span class="cspine"><span>{SHORT_DATE[it.story.lang].format(new Date(it.story.date))} · {formatNumber(it.story.readTime, it.story.lang)} {STR[it.story.lang].min}</span></span>
            <span class="cmedia" style:view-transition-name={picked === it.story.slug ? 'hero' : null}>
              {#if p}<img src={p.src} srcset={p.srcset} sizes="(max-width: 759px) 6rem, 25vw" alt="" loading="lazy" />{/if}
            </span>
          </span>
          <span class="ct"><b>{two(it.n, lang)}</b>{it.story.title}</span>
        </a>
      {/each}
    </div>
  </section>
</div>
</GridPage>
{/if}

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
    /* the same box as the text beside the facts, so .col lands where it does there */
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.04em;
    color: var(--mute);
  }

  /* ---- facts | text, one rule between ---- */
  .read {
    display: grid;
    grid-template-columns: var(--pic) minmax(0, 1fr);
    border-bottom: var(--line) solid var(--rule);
  }
  /* Well into the story (past the Latest pane and topics row stepping
     aside) the facts slide away into the Latest pane's line like a drawer
     closing, their own rule riding along, and the pane's line then
     thickens as the trace of them. Back at the top the line thins and
     they slide back out of it. Their column keeps its place, so the text never
     moves. */
  @media (min-width: 760px) {
    /* a drawer: the facts keep their shape and slide left into the line,
       cut off where their column begins, so they vanish into it */
    .facts {
      clip-path: inset(0 0 0 0);
      transition:
        transform 0.5s cubic-bezier(0.45, 0, 0.2, 1) 0.1s,
        clip-path 0.5s cubic-bezier(0.45, 0, 0.2, 1) 0.1s;
    }
    .read::before {
      transition:
        transform 0.5s cubic-bezier(0.45, 0, 0.2, 1) 0.1s,
        opacity 0.15s ease 0.25s;
    }
    :global(.g.deep) .facts {
      transform: translateX(-100%);
      clip-path: inset(0 0 0 100%);
      pointer-events: none;
      transition:
        transform 0.5s cubic-bezier(0.45, 0, 0.2, 1),
        clip-path 0.5s cubic-bezier(0.45, 0, 0.2, 1);
    }
    /* the mouse in their column brings them back out */
    :global(.g.deep) .facts.peek {
      transform: none;
      clip-path: inset(0 0 0 0);
      pointer-events: auto;
    }
    :global(.g.deep) .read::before {
      transform: translateX(calc(-1 * var(--pic)));
      opacity: 0;
      transition:
        transform 0.5s cubic-bezier(0.45, 0, 0.2, 1),
        opacity 0.15s ease 0.5s;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .facts,
    .read::before {
      transition: none !important;
    }
  }
  .facts {
    align-self: start;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
  }
  /* no rule between facts and text: under the open photo it would start in
     mid-air; the facts are a list, held by their own hairlines */
  .read::before {
    content: none;
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
  /* the topic heads the dateline: its mark and name, a link to the rest */
  .dateline .topic {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
    font-family: var(--sans);
    font-size: calc(0.875rem * var(--k));
    font-weight: 600;
    letter-spacing: 0;
    text-transform: none;
    color: var(--ink);
    text-decoration: none;
  }
  .dateline .topic:hover {
    text-decoration: underline;
    text-decoration-color: var(--o);
    text-underline-offset: 0.2em;
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
    padding: calc(3 * var(--u)) var(--in) calc(7 * var(--u));
    min-width: 0;
  }
  /* the reading column, centred on the whole page rather than the space
     beside the facts, so it's already where it stays once they've gone */
  .col {
    display: block;
    max-width: 40rem;
    margin: 0 auto 0 max(0px, calc((100% - var(--pic) - 40rem) / 2));
  }
  h1 {
    margin: 0 0 1.5rem;
    font-size: clamp(2.4rem, 1rem + 3.6vw, 5rem);
    font-weight: 620;
    font-stretch: 75%;
    line-height: 0.95;
    letter-spacing: -0.012em;
    text-wrap: balance;
  }
  .dek {
    margin: 0 0 2.5rem;
    font-size: clamp(1.2rem, 1rem + 0.6vw, 1.5rem);
    line-height: 1.4;
  }
  /* ---- the glossary: a term explained where it's first met ---- */
  .col {
    position: relative;
  }
  .col :global(.gl) {
    text-decoration: underline dotted;
    text-decoration-color: var(--i);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 0.24em;
    cursor: help;
    border-radius: 2px;
    transition: background-color 0.15s;
  }
  .col :global(.gl:hover),
  .col :global(.gl[aria-expanded='true']) {
    background: var(--i3);
  }
  .col :global(.gl:focus-visible) {
    outline: 2px solid var(--i);
    outline-offset: 2px;
  }
  .gloss {
    position: absolute;
    z-index: 6;
    box-sizing: border-box;
    width: min(18rem, 100%);
    padding: 0.75rem 0.9rem 0.8rem;
    border: 1px solid var(--ink);
    border-top: 3px solid var(--i);
    background: var(--paper);
    font-family: var(--sans);
    color: var(--ink);
  }
  .gloss b {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.9375rem;
    font-weight: 640;
  }
  .gloss p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.45;
  }
  .gloss:lang(bn) p {
    line-height: 1.6;
  }

  /* ---- how we know: the method, the changes, the source notes ---- */
  /* the dateline: one block, the story type in lilac, the date, the
     reading time, and a quiet line for the latest change */
  .fact.dateline {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    margin: 0;
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dateline .changed {
    color: var(--mute);
    text-decoration: none;
  }
  .dateline .changed:hover {
    color: var(--ink);
  }
  .dateline .changed.fix {
    color: var(--o-text);
  }
  /* a pointer down to how the story was reported, set out at its foot */
  .fact.how {
    justify-content: space-between;
    gap: 0.5rem;
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.02em; /* a touch tighter, so it holds one line */
    text-transform: uppercase;
    white-space: nowrap;
  }
  /* the evidence, to open: each a small cell of its own, ink-filled when
     pointed at, like every button here */
  .files {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.9rem 0 0;
  }
  .file {
    display: inline-flex;
    align-items: baseline;
    gap: 0.8rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--ink);
    color: var(--ink);
    text-decoration: none;
    font: 500 calc(0.6875rem * var(--k)) / 1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .file .out {
    letter-spacing: 0;
  }
  .counts {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
  .counts span + span::before {
    content: '·';
    margin: 0 0.5em;
    color: var(--mute);
  }
  /* at the story's foot: how it was reported, and what's changed in it */
  .foot-box {
    margin: 3rem 0 0;
    padding-top: 1.25rem;
    border-top: 1px solid var(--hair);
  }
  .foot-box + .foot-box {
    margin-top: 2rem;
  }
  .foot-box h2 {
    margin: 0 0 0.9rem;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .changes ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .changes li {
    margin: 0 0 0.8rem;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
  .changes .when {
    display: block;
    font: 500 calc(0.6875rem * var(--k)) / 1.6 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .changes b {
    font-weight: 640;
    margin-right: 0.3em;
  }
  .changes b.fix {
    color: var(--o-text);
  }
  /* a source mark: a small number after the sentence it supports */
  .body :global(.nref) {
    margin: 0;
    padding: 0 0.1em 0 0.05em;
    border: 0;
    background: none;
    font: 600 0.62em / 1 var(--mono);
    color: var(--o-text);
    vertical-align: super;
    cursor: pointer;
  }
  /* its note: hidden until the mark is tapped, then opened in place */
  .body :global(.note) {
    display: none;
    font: 400 0.875rem / 1.45 var(--sans);
    color: var(--mute);
  }
  .body :global(.note b) {
    margin-right: 0.3em;
    font: 600 0.75rem / 1 var(--mono);
    color: var(--o-text);
  }
  .body :global(.note.open) {
    display: block;
    margin: 0.5rem 0 0.75rem;
    padding-left: 0.75rem;
    border-left: 2px solid var(--o);
  }
  /* wide enough, every note stands in the margin beside its sentence */
  @container (min-width: 1150px) {
    .body :global(.note),
    .body :global(.note.open) {
      display: block;
      float: right;
      clear: right;
      width: 13rem;
      margin: 0.35rem -15.5rem 0.8rem 0;
      padding: 0;
      border: 0;
      font-size: 0.8125rem;
    }
    .body :global(.nref) {
      cursor: default;
    }
  }

  /* ---- the story's map ---- */
  .map,
  .line {
    display: none;
  }
  @media (min-width: 760px) {
    /* in the facts' column, just below them, staying when they fold */
    .map {
      display: block;
      grid-column: 1;
      grid-row: 1;
      align-self: start;
      position: sticky;
      top: calc(var(--fh) + 3 * var(--u));
      margin-top: calc(var(--fh) + 3 * var(--u));
      padding: 0 var(--in);
      transition:
        opacity 0.3s,
        visibility 0.3s;
    }
    /* a wide photo runs across the column: the map steps aside, as the facts do */
    .map.away {
      opacity: 0;
      visibility: hidden;
    }
  }
  .map ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* each section a stretch of the line: read ones filled, the one being
     read filling as it's read, the rest still to come */
  .map li {
    position: relative;
    border-left: 2px solid var(--hair);
  }
  .map li::before {
    content: '';
    position: absolute;
    top: 0;
    left: -2px;
    width: 2px;
    height: calc(var(--w, 0) * 100%);
    background: var(--o);
  }
  .map li.past::before {
    height: 100%;
  }
  .map button {
    display: block;
    width: 100%;
    padding: 0.42rem 0 0.42rem 0.75rem;
    border: 0;
    background: none;
    text-align: left;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 520;
    line-height: 1.3;
    color: var(--mute);
    cursor: pointer;
  }
  .map .past button,
  .map .on button {
    color: var(--ink);
  }
  .map .on button {
    font-weight: 640;
  }
  /* pointed at or focused, the row fills with ink like every other: its
     words turn to paper (the colours above would otherwise hold) */
  .map li button:focus-visible {
    color: var(--paper);
  }
  @media (hover: hover) {
    .map li button:hover {
      color: var(--paper);
    }
  }
  .map:lang(bn) button {
    line-height: 1.5;
  }
  @media (max-width: 759px) {
    .line {
      display: block;
      position: fixed;
      z-index: 30;
      top: 0;
      left: 0;
      height: 3px;
      width: calc(var(--p) * 100%);
      background: var(--o);
    }
  }

  /* a story begun before: back to the paragraph the reader got to */
  .again {
    display: inline-flex;
    margin: -1rem 0 2.5rem;
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--ink);
    background: none;
    color: var(--ink);
    font: 500 calc(0.6875rem * var(--k)) / 1.2 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .body > :global(*) {
    scroll-margin-top: 5rem;
  }
  .body {
    font-family: var(--read);
    font-size: 1.125rem;
    line-height: 1.75;
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
    font-family: var(--sans);
    margin: 2em 0 0.5em;
    font-size: 1.125rem;
    font-weight: 620;
  }
  /* A wide photo: out of the text column to the page's full width. The
     column is centred on the page, so half the page either side of its
     middle is the page's edge. The caption sits under it in line with the
     text. */
  .body :global(figure.wide) {
    /* above the facts and their rule, even while they fold away */
    position: relative;
    z-index: 2;
    background: var(--paper);
    width: 100cqi;
    margin: 2.5em 0 2.5em calc(50% - 50cqi);
    border-top: var(--line) solid var(--rule);
    border-bottom: var(--line) solid var(--rule);
  }
  .body :global(figure.wide img) {
    display: block;
    width: 100%;
    max-height: 82vh;
    object-fit: cover;
    background: var(--i3);
  }
  .body :global(figure.wide figcaption) {
    padding: var(--u) max(var(--in), calc(50cqi - 20rem));
    border-top: 1px solid var(--hair);
    font: 500 calc(0.6875rem * var(--k)) / 1.5 var(--mono);
    letter-spacing: 0.04em;
    color: var(--mute);
  }
  /* A pull quote: the words large, the orange rule down its side, and who
     said it in small capitals under them. It keeps to the text column; the
     margin beside the text is for source notes alone. */
  .body :global(figure.pull) {
    clear: right;
    margin: 2.25em 0;
    padding: 0.2em 0 0.2em var(--in);
    border-left: 2px solid var(--o);
  }
  .body :global(figure.pull blockquote) {
    margin: 0;
    font-family: var(--sans);
    font-size: clamp(1.5rem, 1rem + 1.4vw, 2.1rem);
    font-weight: 620;
    font-stretch: 80%;
    line-height: 1.1;
  }
  .body :global(figure.pull blockquote p) {
    margin: 0;
  }
  .body :global(figure.pull figcaption) {
    margin-top: 0.9rem;
    font: 500 calc(0.6875rem * var(--k)) / 1.4 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .text:lang(bn) .body :global(figure.pull blockquote) {
    line-height: 1.35;
  }


  .body :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--o);
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.18em;
  }
  /* a card for another story is a link, but not a link in the text */
  .body :global(.also a) {
    text-decoration: none;
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
  .cbody {
    display: flex;
  }
  .cspine {
    flex: none;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    width: var(--spine);
    padding: 0 calc(var(--u) / 2) var(--u) 0;
    box-sizing: border-box;
    border-right: 1px solid var(--hair);
  }
  .cspine span {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font: 400 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--mute);
  }
  .cell:hover .cspine span,
  .cell:focus-visible .cspine span {
    color: inherit;
  }
  .cmedia {
    flex: 1;
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
    /* A phone: compact. The topic is left to the topics row below; format,
       date, length and place run as one dotted line, then the writer. */
    .facts {
      position: static;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: baseline;
      padding-top: var(--u);
      border-right: 0;
      /* a hairline, like the one above the writer: the facts end, softly */
      border-bottom: 1px solid var(--hair);
    }
    /* a story has no topics row below it: the topic leads here, on its own line */
    .dateline .topic {
      flex-basis: 100%;
    }
    /* the dateline as one dotted line; the latest change on a line of its
       own under it */
    .facts .fact.dateline {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0;
      flex-basis: 100%;
      padding: 0 var(--in) var(--u);
      border: 0;
    }
    .dateline > span + span::before {
      content: '·';
      margin: 0 0.6em;
    }
    .dateline .changed {
      flex-basis: 100%;
      margin-top: 0.35rem;
    }
    .facts .writer,
    .facts .other,
    .facts .how,
    .facts .fact:not(.mono, .dateline) {
      flex-basis: 100%;
      padding: var(--u) var(--in);
      border-top: 1px solid var(--hair);
    }
    .facts .face {
      width: 2rem;
    }
    .col {
      margin: 0 auto;
    }
    .text {
      grid-row: 2;
      grid-column: 1;
      padding: var(--in) var(--in) calc(4 * var(--u));
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
    .cspine {
      display: none;
    }
    .cbody {
      flex: none;
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
