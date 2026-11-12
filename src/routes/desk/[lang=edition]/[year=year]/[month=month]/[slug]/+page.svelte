<script>
  /* A story, in Desk's look.

     Down the side, held there: the story's facts (topic, kind, date,
     length, the latest change), its writer, the way to how it was
     reported and to its other language, and its map: the sections by
     their headings, the read ones filled, the one being read marked.

     Beside it, one sheet of paper. Its head is in the picture's own
     colour, as the story's card is everywhere else: headline, summary,
     the picture standing in the corner. Under it the text in a reading
     column, with a margin to its right where the source notes stand
     beside their sentences and the pull quotes and story cards reach
     into. Narrower, the notes open in place with a tap. Then how it was
     reported, what's changed since, and three stories to read next.

     Everything the site's own story page does is here: source notes, the
     glossary's explained terms, story cards in the text, pull quotes,
     wide photos, the method and changes boxes, and (where this browser
     remembers its reader) the way back to where they stopped. A special,
     a hand-built page for one story, is shown as it is, under the bar. */
  import { onMount, untrack, tick } from 'svelte';
  import { kindLabel, sectionLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, SHORT_DATE, FULL_DATE, STR } from '$lib/site/reel.js';
  import Frame from '../../../../Frame.svelte';
  import { deskTopic, deskAuthor, deskStory, deskSupport } from '../../../../urls.js';
  import { GIVE } from '../../../../support.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);
  const s = $derived(data.story);
  const pic = $derived(photo(s));
  const topicNo = $derived(data.topics.findIndex((t) => t.key === s.section) + 1);

  const W = {
    en: { video: 'Video', next: 'Read next', also: 'Also from Second Order', watch: (n) => `${n} min watch` },
    bn: { video: 'ভিডিও', next: 'এরপর পড়ুন', also: 'সেকেন্ড অর্ডারে আরও', watch: (n) => `${n} মিনিটের ভিডিও` }
  };
  const kind = (x) => (KINDS.includes(x.kind) ? kindLabel(x.kind, x.lang) : x.video ? W[x.lang].video : null);
  const length = $derived(s.video ? W[lang].watch(num(s.duration || s.readTime)) : L.minRead(num(s.readTime)));
  const credit = $derived(
    pic?.illustration
      ? lang === 'bn' ? 'অলংকরণ: সেকেন্ড অর্ডার / আনস্প্ল্যাশ' : 'Illustration: Second Order / Unsplash'
      : data.credit ? `${lang === 'bn' ? 'ছবি' : 'Photo'}: ${data.credit}` : null
  );
  const howWe = $derived(!!(s.interviews || s.documents || s.reporting || s.sources?.length));

  /* a special: src/specials/<slug>.svelte takes the story's place */
  const specials = import.meta.glob('/src/specials/*.svelte', { eager: true });
  const Special = $derived(specials[`/src/specials/${s.slug}.svelte`]?.default ?? null);

  /* What this browser remembers of its reader is the site's own module,
     if it's there (it isn't in every build yet): without it the story
     simply doesn't offer the way back. */
  const mem = Object.values(import.meta.glob('/src/routes/memory.svelte.js', { eager: true }))[0] ?? null;

  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* bring something up to just under the bar */
  function glide(el) {
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 84, behavior: calm() ? 'auto' : 'smooth' });
  }

  /* The map: how far through the story, which section is being read and
     how far through it. */
  let article = $state();
  let reach = $state(0);
  let at = $state(-1);
  let within = $state(0);
  $effect(() => {
    void data.story.slug;
    const el = article;
    if (!el) return;
    const look = () => {
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      const eye = innerHeight * 0.4;
      reach = r.bottom <= innerHeight ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      const tops = [...el.querySelectorAll('.body h2')].map((h) => h.getBoundingClientRect().top);
      let k = -1;
      tops.forEach((t, n) => t < eye && (k = n));
      const end = k + 1 < tops.length ? tops[k + 1] : r.bottom;
      at = r.bottom <= innerHeight ? tops.length : k;
      within = k < 0 ? 0 : Math.min(1, Math.max(0, (eye - tops[k]) / (end - tops[k])));
    };
    look();
    addEventListener('scroll', look, { passive: true });
    addEventListener('resize', look);
    return () => {
      removeEventListener('scroll', look);
      removeEventListener('resize', look);
    };
  });
  const jump = (n) => {
    const h = article?.querySelectorAll('.body h2')[n];
    if (h) glide(h);
  };
  const to = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    glide(el);
  };

  /* a source mark: a tap opens its note in place (wide, the notes already
     stand in the margin) */
  function openNote(mark) {
    const note = article.querySelector(`#${mark.getAttribute('aria-controls')}`);
    const open = mark.getAttribute('aria-expanded') !== 'true';
    mark.setAttribute('aria-expanded', String(open));
    note?.classList.toggle('open', open);
  }

  /* A term from the glossary, explained in a small card under it: a tap or
     click opens it and keeps it open, the mouse resting on it shows it for
     as long as it stays, Escape or a tap anywhere else closes it. */
  let col = $state();
  let gloss = $state(null);
  let hoverTimer = null;
  function show(el, pinned) {
    const entry = data.glossary?.[Number(el.dataset.gl)];
    if (!entry) return;
    gloss?.el.setAttribute('aria-expanded', 'false');
    const c = col.getBoundingClientRect();
    const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
    const width = Math.min(288, c.width);
    gloss = { ...entry, el, pinned, top: r.bottom - c.top + 6, left: Math.max(0, Math.min(r.left - c.left, c.width - width)) };
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
  function unhover(e) {
    if (e.pointerType !== 'mouse' || gloss?.pinned) return;
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

  /* How far in the reader is, remembered in their browser: a story they'd
     begun offers, under its summary, to take them back there. */
  let resume = $state(null);
  onMount(() => mem?.wake());
  $effect(() => {
    void data.story.slug;
    if (!mem || !mem.memory.ready || !article) return;
    const story = data.story;
    const el = article;
    untrack(() => {
      const i = mem.resumeAt(story);
      resume = i === null ? null : { i, p: mem.progress(story) };
    });
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      const p = r.bottom <= innerHeight ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      const i = Math.max(0, [...el.querySelectorAll('.body > *')].findIndex((b) => b.getBoundingClientRect().bottom > 90));
      mem.reached(story, p, i);
      if (resume && p > resume.p) resume = null;
    };
    let timer = null;
    const soon = () => {
      timer ??= setTimeout(() => {
        timer = null;
        measure();
      }, 400);
    };
    untrack(measure);
    addEventListener('scroll', soon, { passive: true });
    addEventListener('pagehide', measure);
    return () => {
      clearTimeout(timer);
      untrack(measure);
      removeEventListener('scroll', soon);
      removeEventListener('pagehide', measure);
    };
  });
  async function pickUp() {
    const el = article?.querySelectorAll('.body > *')[resume.i];
    resume = null;
    await tick();
    if (el) glide(el);
  }
</script>

<svelte:window onpointerdown={away} onkeydown={(e) => e.key === 'Escape' && hide()} />

<svelte:head>
  <title>{s.title} — Second Order</title>
</svelte:head>

{#snippet card(x, label)}
  {@const p = photo(x)}
  <a class="also" href={deskStory(x)} lang={x.lang}>
    <span class="sq" style:--bg={x.tone?.bg}>{#if p}<img src={p.small} alt="" loading="lazy" />{/if}</span>
    <span class="at">
      <span class="mono">{label}</span>
      <span class="ah">{x.title}</span>
      <span class="mono dim">{[kind(x), SHORT_DATE[x.lang].format(new Date(x.date)), `${formatNumber(x.readTime, x.lang)} ${STR[x.lang].min}`].filter(Boolean).join(' · ')}</span>
    </span>
  </a>
{/snippet}

{#snippet who()}
{#if data.writer}
  <a class="writer" href={deskAuthor(data.writer.slug, lang)}>
    <span class="face">{#if data.writer.photo}<img src={data.writer.photo} alt="" />{/if}</span>
    <span class="who"><b>{s.author}</b><span class="mono dim">{[data.writer.role, s.location].filter(Boolean).join(' · ')}</span></span>
  </a>
{:else if s.author}
  <p class="writer"><span class="who"><b>{s.author}</b>{#if s.location}<span class="mono dim">{s.location}</span>{/if}</span></p>
{/if}
{/snippet}

{#snippet ways(cls)}
{#if howWe || data.translated}
  <p class="ways {cls}">
    {#if howWe}<a class="mono chip" href="#how" onclick={(e) => to(e, 'how')}>{L.method} ↓</a>{/if}
    {#if data.translated}<a class="mono chip" href={data.alt[other]} hreflang={other} lang={other}>{L.readOther} →</a>{/if}
  </p>
{/if}
{/snippet}

{#if Special}
  <Special story={s} {lang} />
{:else}
  <!-- a phone's map: a line under the bar, filling as the story is read -->
  <div class="line" style:--p={reach} aria-hidden="true"></div>
  <Frame>
    {#snippet side()}
      <a class="mono topic" href={deskTopic(s.section, lang)}>{#if topicNo}<b>{formatNumber(topicNo, lang).padStart(2, lang === 'bn' ? '০' : '0')}</b>{/if}{sectionLabel(s.section, lang)}</a>
      <dl class="mono facts">
        {#if kind(s)}<div><dt>{lang === 'bn' ? 'ধরন' : 'Type'}</dt><dd class="hot">{kind(s)}</dd></div>{/if}
        <div><dt>{lang === 'bn' ? 'প্রকাশ' : 'Filed'}</dt><dd>{FULL_DATE[lang].format(new Date(s.date))}</dd></div>
        <div><dt>{lang === 'bn' ? 'সময়' : 'Length'}</dt><dd>{length}</dd></div>
        {#if s.updates?.length}
          <div>
            <dt>{L[s.updates[0].kind]}</dt>
            <dd><a href="#changes" onclick={(e) => to(e, 'changes')}>{FULL_DATE[lang].format(new Date(s.updates[0].date))} ↓</a></dd>
          </div>
        {/if}
      </dl>
      {@render who()}
      {@render ways('')}
      {#if data.sections.length > 1}
        <nav class="map" aria-label={L.inStory}>
          <p class="mono dim">{L.inStory}</p>
          <ol>
            {#each data.sections as h, n (n)}
              <li class:past={n < at} class:on={n === at} style:--w={n === at ? within : null}>
                <button type="button" aria-current={n === at ? 'location' : undefined} onclick={() => jump(n)}><i aria-hidden="true"></i><span>{@html h}</span></button>
              </li>
            {/each}
          </ol>
        </nav>
      {/if}
    {/snippet}

    <article class="sheet" {lang} bind:this={article}>
      <!-- the head: the story's card, as large as the page -->
      <header class="head" style:--bg={s.tone?.bg} style:--fg={s.tone?.fg}>
        {#if pic}<img class="art" src={pic.src} srcset={pic.srcset} sizes="(max-width: 759px) 100vw, 45vw" alt="" />{/if}
        <div class="htxt">
          <p class="mono tag"><i class="dot" aria-hidden="true"></i>{[sectionLabel(s.section, lang), kind(s)].filter(Boolean).join(' / ')}</p>
          <h1>{s.title}</h1>
          {#if s.dek}<p class="dek">{@html data.dekHtml}</p>{/if}
          <p class="mono by">{[s.author, FULL_DATE[lang].format(new Date(s.date)), length].filter(Boolean).join(' · ')}</p>
        </div>
      </header>
      {#if credit}<p class="mono credit">{credit}</p>{/if}
      <!-- narrower, the side column goes: its ways in sit under the head -->
      {@render ways('narrow')}

      <!-- the column hears taps on source marks and on explained terms -->
      <div class="col" bind:this={col} onclick={tapped} onkeydown={keyed} onpointerover={hover} onpointerout={unhover} role="presentation">
        {#if resume}<button type="button" class="mono again" onclick={pickUp}>{L.pickUp} · {num(Math.round(resume.p * 100))}% ↓</button>{/if}
        <!-- the story's text is what Search reads in full (Pagefind, at build) -->
        <div class="body" data-pagefind-body>
          {#each data.blocks as b, n (n)}
            {#if b.also}<div class="aside">{@render card(b.also, W[lang].also)}</div>{:else}{@html b.html}{/if}
          {/each}
        </div>
        <!-- narrower: who wrote it, once it has been read -->
        <div class="narrow byend">{@render who()}</div>
        <!-- right after the story: the moment a reader knows what it was worth -->
        <p class="ask"><span>{GIVE[lang].end}</span><a class="mono" href={deskSupport(lang)}>{GIVE[lang].endCta} →</a></p>
        {#if gloss}
          <div class="gloss" role="dialog" aria-label={gloss.term} style:top="{gloss.top}px" style:left="{gloss.left}px" onpointerover={() => clearTimeout(hoverTimer)} onpointerout={unhover}>
            <b>{gloss.term}</b>
            <p>{gloss.meaning}</p>
          </div>
        {/if}

        {#if howWe}
          <section class="box" id="how">
            <h2 class="mono">{L.method}</h2>
            {#if s.interviews || s.documents || s.reporting}
              <p class="counts">
                {#if s.interviews}<span>{L.interviews(num(s.interviews), s.interviews)}</span>{/if}
                {#if s.documents}<span>{L.documents(num(s.documents), s.documents)}</span>{/if}
                {#if s.reporting}<span>{s.reporting}</span>{/if}
              </p>
            {/if}
            {#if s.sources?.length}
              <p class="files">
                {#each s.sources as x (x.url)}<a class="mono chip" href={x.url} target="_blank" rel="noopener">{x.label} ↗</a>{/each}
              </p>
            {/if}
          </section>
        {/if}
        {#if s.updates?.length}
          <section class="box" id="changes">
            <h2 class="mono">{L.changes}</h2>
            <ol class="log">
              {#each s.updates as u, n (n)}
                <li>
                  <span class="mono dim">{FULL_DATE[lang].format(new Date(u.date))}</span>
                  <span><b class="mono" class:fix={u.kind === 'Correction'}>{L.change[u.kind]}</b> {u.note}</span>
                </li>
              {/each}
            </ol>
          </section>
        {/if}
      </div>
    </article>

    {#if data.next.length}
      <section class="next" aria-labelledby="next-h">
        <h2 class="mono" id="next-h">{W[lang].next}</h2>
        <div class="strip">
          {#each data.next as x (x.slug)}{@render card(x, sectionLabel(x.section, x.lang))}{/each}
        </div>
      </section>
    {/if}
  </Frame>
{/if}

<style>
  a {
    color: inherit;
    text-decoration: none;
  }
  p {
    margin: 0;
  }
  .mono {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  .dim {
    color: var(--mute);
  }

  /* ---- a phone's reading line ---- */
  .line {
    display: none;
    position: sticky;
    top: var(--bar);
    z-index: 4;
    height: 3px;
    margin-bottom: -3px;
    background: linear-gradient(var(--accent), var(--accent)) no-repeat;
    background-size: calc(var(--p) * 100%) 100%;
  }

  /* ---- the side: the story's facts ---- */
  .topic {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    outline: none;
  }
  .topic b {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.5rem;
    background: var(--ink);
    color: var(--card);
    letter-spacing: 0;
  }
  .topic:hover,
  .topic:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }
  .facts {
    margin: 0;
    border-top: 1px solid var(--ink);
  }
  .facts div {
    display: grid;
    grid-template-columns: 4.75rem minmax(0, 1fr);
    gap: 0.75rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--hair);
  }
  .facts dt {
    color: var(--mute);
  }
  .facts dd {
    margin: 0;
  }
  .facts .hot {
    color: var(--accent);
  }
  .facts a:hover,
  .facts a:focus-visible {
    text-decoration: underline;
    text-underline-offset: 0.25em;
    outline: none;
  }
  .writer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    outline: none;
  }
  .face {
    flex: none;
    width: 3rem;
    height: 3rem;
    overflow: hidden;
    border: 1px solid var(--ink);
    background: var(--hair);
  }
  .face img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 20%;
    filter: grayscale(1) contrast(1.05);
  }
  .who {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    line-height: 1.2;
  }
  .who b {
    font-weight: 600;
  }
  a.writer:hover b,
  a.writer:focus-visible b {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .ways,
  .files {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .chip {
    padding: 0.45rem 0.65rem 0.4rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    outline: none;
  }
  .chip:hover,
  .chip:focus-visible {
    background: var(--ink);
    color: var(--card);
  }

  /* the map: a square to a section; read, it fills; being read, it's the
     accent, and a line under its name fills as the section is read */
  .map {
    padding-top: 0.9rem;
    border-top: 1px solid var(--ink);
  }
  .map ol {
    margin: 0.5rem 0 0;
    padding: 0;
    list-style: none;
  }
  .map button {
    position: relative;
    display: grid;
    grid-template-columns: 0.5rem minmax(0, 1fr);
    align-items: baseline;
    gap: 0.7rem;
    width: 100%;
    margin: 0;
    padding: 0.45rem 0;
    border: 0;
    background: none;
    color: var(--mute);
    font: 500 0.875rem / 1.25 var(--sans);
    text-align: start;
    cursor: pointer;
    outline: none;
  }
  .map i {
    width: 0.5rem;
    height: 0.5rem;
    box-sizing: border-box;
    border: 1px solid var(--mute);
  }
  .map .past button,
  .map .on button,
  .map button:hover,
  .map button:focus-visible {
    color: var(--ink);
  }
  .map .past i {
    border-color: var(--ink);
    background: var(--ink);
  }
  .map .on i {
    border-color: var(--accent);
    background: var(--accent);
  }
  .map .on button::after {
    content: '';
    position: absolute;
    left: 1.2rem;
    right: 0;
    bottom: 0;
    height: 1px;
    background: linear-gradient(var(--accent), var(--accent)) no-repeat var(--hair);
    background-size: calc(var(--w, 0) * 100%) 100%;
  }

  /* ---- the sheet ---- */
  .sheet {
    --read: 40rem; /* the reading column */
    --margin: 17rem; /* and the margin beside it, for notes */
    box-sizing: border-box;
    border: 1px solid var(--ink);
    background: var(--card);
  }
  /* its head, in the picture's colour */
  .head {
    position: relative;
    min-height: 27rem;
    overflow: hidden;
    border-bottom: 1px solid var(--ink);
    background: var(--bg, var(--card));
    color: var(--fg, var(--ink));
  }
  .htxt {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
    max-width: 62%;
    padding: clamp(1.25rem, 2.6vw, 2.5rem) clamp(1.25rem, 3vw, 3rem) clamp(1.5rem, 3vw, 3rem);
  }
  .tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dot {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    background: currentColor;
  }
  h1 {
    margin: 0;
    font-family: var(--serif);
    font-size: calc(clamp(2.2rem, 4vw, 4rem) * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 96;
    letter-spacing: calc(var(--hls) * 1.2);
    line-height: var(--hlh);
    text-wrap: balance;
  }
  .dek {
    max-width: 26em;
    font-size: clamp(1.1rem, 1.4vw, 1.3rem);
    line-height: 1.4;
    text-wrap: pretty;
  }
  .dek:lang(bn) {
    line-height: 1.6;
  }
  .by {
    opacity: 0.75;
  }
  .art {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 58%;
    height: auto;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 36%), linear-gradient(to right, transparent, #000 30%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to bottom, transparent, #000 36%), linear-gradient(to right, transparent, #000 30%);
    mask-composite: intersect;
  }
  .credit {
    padding: 0.6rem clamp(1.25rem, 3vw, 3rem) 0;
    color: var(--mute);
  }

  /* ---- the text ---- */
  .col {
    position: relative;
    box-sizing: content-box;
    max-width: var(--read);
    padding: clamp(1.75rem, 3vw, 3rem) clamp(1.25rem, 3vw, 3rem) clamp(2rem, 4vw, 3.5rem);
  }
  /* the ask at the end of a story: a ruled line, the reason and the way */
  .ask {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1.25rem;
    max-width: var(--read);
    margin: 2.25rem 0 0;
    padding: 1.1rem 0;
    border-top: 1px solid var(--ink);
    border-bottom: 1px solid var(--ink);
    font-family: var(--serif);
    font-size: 1.125rem;
    line-height: 1.35;
  }
  .ask a {
    display: inline-flex;
    align-items: center;
    height: 2.25rem;
    padding: 0 0.9rem;
    border: 1px solid var(--ink);
    background: var(--ink);
    color: var(--card);
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .ask a:hover,
  .ask a:focus-visible {
    background: var(--card);
    color: var(--ink);
    outline: none;
  }
  .again {
    margin: 0 0 1.5rem;
    padding: 0.55rem 0.75rem 0.5rem;
    border: 1px solid var(--accent);
    background: none;
    color: var(--accent);
    cursor: pointer;
  }
  .again:hover,
  .again:focus-visible {
    background: var(--accent);
    color: #fff;
    outline: none;
  }
  .body {
    font-family: var(--serif);
    font-size: 1.1875rem;
    font-variation-settings: 'opsz' 14;
    line-height: 1.62;
  }
  .body:lang(bn) {
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.85;
  }
  .body :global(p) {
    margin: 0 0 1.15em;
  }
  .body :global(h2) {
    margin: 2.2em 0 0.7em;
    padding-top: 0.9em;
    border-top: 1px solid var(--ink);
    font-size: calc(1.7rem * var(--hk));
    font-weight: var(--hw);
    font-variation-settings: 'opsz' 48;
    letter-spacing: calc(var(--hls) / 1.5);
    line-height: calc(var(--hlh) + 0.1);
    text-wrap: balance;
  }
  /* the first heading opens the text: no rule over it */
  .body > :global(h2:first-child) {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
  .body :global(a.also) {
    text-decoration: none;
  }
  .body :global(h3) {
    margin: 1.8em 0 0.5em;
    font-size: calc(1.3rem * var(--hk));
    font-weight: var(--hw);
    line-height: calc(var(--hlh) + 0.15);
  }
  .body :global(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 0.18em;
  }
  .body :global(ul),
  .body :global(ol) {
    margin: 0 0 1.15em;
    padding-left: 1.3em;
  }
  .body :global(li) {
    margin-bottom: 0.4em;
  }
  .body :global(blockquote) {
    margin: 1.5em 0;
    padding-left: 1.1em;
    border-left: 3px solid var(--accent);
  }

  /* a source mark, and its note: in the margin beside its sentence */
  .body :global(.nref) {
    display: inline-grid;
    place-items: center;
    min-width: 1.15rem;
    height: 1.15rem;
    margin: 0 0.15em 0 0.2em;
    padding: 0 0.2rem;
    border: 0;
    background: var(--accent);
    color: #fff;
    font: 500 0.6875rem / 1 var(--mono);
    vertical-align: 0.35em;
    cursor: pointer;
  }
  .body :global(.note) {
    float: right;
    clear: right;
    width: calc(var(--margin) - 3rem);
    margin: 0.2rem calc(-1 * var(--margin)) 0.9rem 0;
    padding-top: 0.5rem;
    border-top: 1px solid var(--ink);
    color: var(--mute);
    font: 400 0.8125rem / 1.45 var(--sans);
    font-variation-settings: normal;
  }
  .body :global(.note b) {
    margin-right: 0.3em;
    color: var(--accent);
    font: 500 0.6875rem / 1 var(--mono);
  }
  .body :global(.note a) {
    text-decoration-thickness: 1px;
  }

  /* a term the glossary explains */
  .body :global(.gl),
  .dek :global(.gl) {
    text-decoration: underline dotted;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    cursor: help;
    outline: none;
  }
  .body :global(.gl:hover),
  .body :global(.gl:focus-visible),
  .body :global(.gl[aria-expanded='true']) {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .gloss {
    position: absolute;
    z-index: 3;
    box-sizing: border-box;
    width: min(18rem, 100%);
    padding: 0.8rem 0.9rem;
    border: 1px solid var(--ink);
    background: var(--card);
    box-shadow: 4px 4px 0 var(--ink);
    font-size: 0.9375rem;
    line-height: 1.45;
  }
  .gloss b {
    display: block;
    margin-bottom: 0.3rem;
    font: 500 var(--ms) / 1.2 var(--mono);
    letter-spacing: var(--mt);
    text-transform: uppercase;
    color: var(--accent);
  }

  /* a wide photo, and a pull quote, reach into the margin */
  .body :global(figure) {
    margin: 2em 0;
  }
  .body :global(figure.wide) {
    clear: both;
    margin-right: calc(-1 * var(--margin));
  }
  .body :global(figure.wide img) {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--ink);
  }
  .body :global(figure figcaption) {
    margin-top: 0.6rem;
    color: var(--mute);
    font: 500 var(--ms) / 1.4 var(--mono);
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  .body :global(figure.pull) {
    clear: right;
    margin: 2.2em calc(-0.5 * var(--margin)) 2.2em 0;
    padding: 0.2rem 0 0.2rem 1.4rem;
    border-left: 4px solid var(--accent);
  }
  .body :global(figure.pull blockquote) {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: calc(clamp(1.6rem, 2.4vw, 2.2rem) * var(--hk));
    font-style: italic;
    font-variation-settings: 'opsz' 60;
    letter-spacing: var(--hls);
    line-height: 1.2;
    text-wrap: balance;
  }
  .body :global(figure.pull blockquote p) {
    margin: 0;
  }

  /* another story, in the text: a small card standing in the margin */
  .aside {
    float: right;
    clear: right;
    width: calc(var(--margin) + 4rem);
    margin: 0.4rem calc(-1 * var(--margin)) 1.2rem 1.75rem;
  }
  .also {
    display: grid;
    grid-template-columns: 4.25rem minmax(0, 1fr);
    align-items: start;
    gap: 0.9rem;
    box-sizing: border-box;
    padding: 0.8rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    font-family: var(--sans);
    outline: none;
    transition:
      transform 0.16s ease-out,
      box-shadow 0.16s ease-out;
  }
  @media (hover: hover) {
    .also:hover,
    .also:focus-visible {
      transform: translate(-3px, -3px);
      box-shadow: 4px 4px 0 var(--ink);
    }
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
  .at {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }
  .at .mono:first-child {
    color: var(--accent);
  }
  .ah {
    font-family: var(--serif);
    font-size: calc(1.1rem * var(--hk));
    font-weight: calc(var(--hw) - 60);
    font-variation-settings: 'opsz' 30;
    letter-spacing: calc(var(--hls) / 2);
    line-height: calc(var(--hlh) + 0.14);
  }
  .also[lang='bn'] .ah {
    font-family: 'Noto Serif Bengali', var(--serif);
    line-height: 1.4;
    letter-spacing: 0;
  }

  /* ---- how it was reported; what's changed ---- */
  .box {
    clear: both;
    margin-top: 2.5rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--ink);
    scroll-margin-top: calc(var(--bar) + 1.5rem);
  }
  .box h2 {
    margin: 0 0 0.9rem;
    color: var(--mute);
  }
  .counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 2rem;
    margin-bottom: 1rem;
    font-family: var(--serif);
    font-size: calc(1.5rem * var(--hk));
    font-weight: calc(var(--hw) - 60);
    font-variation-settings: 'opsz' 40;
    line-height: 1.2;
  }
  .log {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .log li {
    display: grid;
    grid-template-columns: 9.5rem minmax(0, 1fr);
    gap: 1rem;
    padding: 0.7rem 0;
    border-top: 1px solid var(--hair);
    line-height: 1.45;
  }
  .log b {
    margin-right: 0.4em;
  }
  .log .fix {
    color: var(--accent);
  }

  /* ---- three more ---- */
  .next h2 {
    margin: 0 0 0.8rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--ink);
  }
  .strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--gap);
  }

  /* ---- no room for a margin: notes open in place, cards sit in the column ---- */
  @media (max-width: 1379px) {
    .body :global(.note) {
      display: none;
      float: none;
      width: auto;
      margin: 0.6rem 0;
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--ink);
      background: var(--ground);
    }
    .body :global(.note.open) {
      display: block;
    }
    .body :global(figure.wide),
    .body :global(figure.pull) {
      margin-right: 0;
    }
    .aside {
      float: none;
      width: auto;
      margin: 1.6rem 0;
    }
  }
  @media (min-width: 1380px) {
    .body :global(.nref) {
      cursor: default;
    }
  }
  /* narrower: the story first. The side column steps out (the head
     already names the topic, the kind, the writer, the date and the
     length); its ways in sit under the head and the writer comes after
     the text. */
  .narrow {
    display: none;
  }
  @media (max-width: 1099px) {
    :global(.frame > .side:has(.facts)) {
      display: none;
    }
    .narrow {
      display: flex;
    }
    .ways.narrow {
      margin: 0;
      padding: 1rem var(--pad, 1rem) 0;
    }
    .byend {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--ink);
    }
  }
  @media (max-width: 1099px) {
    .map {
      display: none;
    }
    .line {
      display: block;
    }
  }
  @media (max-width: 759px) {
    .head {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .htxt {
      max-width: none;
      gap: 0.9rem;
      padding-bottom: 0;
    }
    h1 {
      font-size: calc(clamp(2rem, 9vw, 2.6rem) * var(--hk));
    }
    .art {
      position: static;
      order: 2;
      display: block;
      width: 100%;
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 40%);
      mask-image: linear-gradient(to bottom, transparent, #000 40%);
    }
    .body {
      font-size: 1.125rem;
    }
    .log li {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.3rem;
    }
    .strip {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
