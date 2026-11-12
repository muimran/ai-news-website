<script>
  /* The archive: every story in the edition, newest first, by month.

     Down the side, its history, drawn from the stories themselves: a small
     grid to each month there are stories in, a square to a day, darker the
     more were published that day; and how many stories each topic and each
     format has, as bars. All three are also ways in: pressing a day, a
     topic or a format shows only those stories (pressing it again, or
     Clear, shows them all). They work with the field above them. */
  import { sectionLabel, formatNumber } from '$lib/labels.js';
  import { matches, STR } from '$lib/site/reel.js';
  import Frame from '../../Frame.svelte';
  import Side from '../../Side.svelte';
  import Stories from '../../Stories.svelte';
  import { DESK_FORMATS, isIt, formatName } from '../../formats.js';
  import { deskHome, deskAll, deskAllMonth } from '../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);
  const W = {
    en: { front: 'Front page', archive: 'Archive', days: 'By day', topics: 'By topic', formats: 'By format', clear: 'Clear', on: (n, d) => `${d}: ${n} ${n === 1 ? 'story' : 'stories'}`, none: (d) => `${d}: no stories` },
    bn: { front: 'প্রথম পাতা', archive: 'আর্কাইভ', days: 'দিন অনুযায়ী', topics: 'বিষয় অনুযায়ী', formats: 'ধরন অনুযায়ী', clear: 'মুছুন', on: (n, d) => `${d}: ${formatNumber(n, 'bn')}টি প্রতিবেদন`, none: (d) => `${d}: কোনো প্রতিবেদন নেই` }
  };
  const loc = $derived(lang === 'bn' ? 'bn-BD-u-nu-beng' : 'en-GB');
  const MONTH = $derived(new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric', timeZone: 'UTC' }));
  const DAY = $derived(new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', timeZone: 'UTC' }));

  const dayOf = (s) => new Date(s.date).toISOString().slice(0, 10);

  /* what's chosen: a day, a topic, a format (any of them, together) */
  let q = $state('');
  let only = $state({ day: null, topic: null, format: null });
  const any = $derived(!!(only.day || only.topic || only.format));
  const pick = (key, value) => (only = { ...only, [key]: only[key] === value ? null : value });
  const clear = () => (only = { day: null, topic: null, format: null });

  const chosen = $derived(
    data.stories.filter(
      (s) => (!only.day || dayOf(s) === only.day) && (!only.topic || s.section === only.topic) && (!only.format || isIt(s, only.format))
    )
  );
  const shown = $derived(q.trim() || any ? chosen.filter((s) => matches(s, q)).length : data.total);
  // the months either side of this one
  const at = $derived(data.months.indexOf(data.ym));
  const newer = $derived(at > 0 ? data.months[at - 1] : null);
  const older = $derived(at < data.months.length - 1 ? data.months[at + 1] : null);
  /* the other years there are stories in, each to its newest month */
  const years = $derived([...new Set(data.months.map((ym) => ym.slice(0, 4)))].filter((y) => y !== data.ym.slice(0, 4)).map((y) => ({ y, ym: data.months.find((m) => m.startsWith(y)) })));
  const monthHref = (ym) => (ym === data.months[0] ? deskAll(lang) : deskAllMonth(lang, ym));

  /* the months there are stories in, oldest first, each as weeks of days */
  const perDay = $derived(new Map(Object.entries(data.days)));
  const months = $derived.by(() => {
    // this page's year only; the other years are links (below)
    const keys = [...new Set([...perDay.keys()].map((d) => d.slice(0, 7)))].filter((ym) => ym.startsWith(data.ym.slice(0, 4))).sort();
    return keys.map((ym) => {
      const [y, mo] = ym.split('-').map(Number);
      const first = new Date(Date.UTC(y, mo - 1, 1));
      const length = new Date(Date.UTC(y, mo, 0)).getUTCDate();
      // the week begins on Sunday; blanks before the 1st
      const cells = Array(first.getUTCDay()).fill(null);
      for (let d = 1; d <= length; d++) {
        const key = `${ym}-${String(d).padStart(2, '0')}`;
        cells.push({ key, n: perDay.get(key) ?? 0, label: DAY.format(new Date(Date.UTC(y, mo - 1, d))) });
      }
      return { ym, name: MONTH.format(first), cells, here: ym === data.ym };
    });
  });

  /* how many each topic and each format has, most first */
  const count = (list) => {
    const max = Math.max(1, ...list.map((x) => x.n));
    return list.filter((x) => x.n).map((x) => ({ ...x, w: x.n / max }));
  };
  const topics = $derived(count(data.topics.map((t) => ({ key: t.key, label: sectionLabel(t.key, lang), n: data.stories.filter((s) => s.section === t.key).length }))));
  const formats = $derived(count(DESK_FORMATS.map((f) => ({ key: f.key, label: formatName(f.key, lang), n: data.stories.filter((s) => isIt(s, f.key)).length }))));
</script>

<svelte:head>
  <title>{L.all} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <Side {lang} label={W[lang].archive} title={L.all} total={data.total} {shown} bind:q back={{ href: deskHome(lang), text: W[lang].front }} />

    <section class="hist days">
      <h2 class="mono">{W[lang].days}{#if any}<button type="button" class="mono clear" onclick={clear}>{W[lang].clear} ×</button>{/if}</h2>
      <div class="cals">
        {#each months as m (m.ym)}
          <div class="cal" class:here={m.here}>
            <!-- this page's month is the one that filters; another is a way to its page -->
            {#if m.here}<p class="mono">{m.name}</p>{:else}<a class="mono to" href={monthHref(m.ym)}>{m.name} →</a>{/if}
            <div class="grid">
              {#each m.cells as c, i (i)}
                {#if !c}
                  <span></span>
                {:else if c.n && !m.here}
                  <span class="d n{Math.min(c.n, 3)}" title={W[lang].on(c.n, c.label)}></span>
                {:else if c.n}
                  <button type="button" class="d n{Math.min(c.n, 3)}" aria-pressed={only.day === c.key} title={W[lang].on(c.n, c.label)} aria-label={W[lang].on(c.n, c.label)} onclick={() => pick('day', c.key)}
                  ></button>
                {:else}
                  <span class="d" title={W[lang].none(c.label)}></span>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
      {#if years.length}
        <p class="mono years">{#each years as x (x.y)}<a class="to" href={monthHref(x.ym)}>{num(Number(x.y)).replace(/[,،]/g, '')} →</a>{/each}</p>
      {/if}
    </section>

    {#snippet bars(title, list, key)}
      <section class="hist">
        <h2 class="mono">{title}</h2>
        {#each list as x (x.key)}
          <button type="button" class="bar" aria-pressed={only[key] === x.key} style:--w={x.w} onclick={() => pick(key, x.key)}>
            <span class="nm">{x.label}</span><span class="mono n">{num(x.n)}</span>
          </button>
        {/each}
      </section>
    {/snippet}
    {@render bars(W[lang].topics, topics, 'topic')}
    {@render bars(W[lang].formats, formats, 'format')}
  {/snippet}
  <Stories {lang} stories={chosen} {q} lead={false} />
  {#if newer || older}
    <nav class="months mono" aria-label={W[lang].archive}>
      {#if newer}<a href={monthHref(newer)} rel="prev">← {MONTH.format(new Date(newer + '-01T00:00:00Z'))}</a>{:else}<span></span>{/if}
      {#if older}<a href={monthHref(older)} rel="next">{MONTH.format(new Date(older + '-01T00:00:00Z'))} →</a>{/if}
    </nav>
  {/if}
</Frame>

<style>
  .mono {
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  p,
  h2 {
    margin: 0;
  }
  /* the month nav under the ledger, and other months in the history */
  .months {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 0;
    border-top: 1px solid var(--ink);
  }
  .months a {
    display: inline-flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    border: 1px solid var(--ink);
    background: var(--card);
    text-decoration: none;
  }
  .months a:hover,
  .months a:focus-visible {
    background: var(--ink);
    color: var(--card);
    outline: none;
  }
  .years {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    margin-top: 0.75rem;
  }
  .to {
    color: var(--mute);
    text-decoration: none;
  }
  .to:hover,
  .to:focus-visible {
    color: var(--ink);
    text-decoration: underline;
    outline: none;
  }
  .hist {
    padding-top: 0.9rem;
    border-top: 1px solid var(--ink);
  }
  .hist h2 {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.7rem;
    color: var(--mute);
  }
  .clear {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent);
    cursor: pointer;
  }

  /* ---- a month: seven squares to a week ---- */
  .cals {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
  }
  .cal p {
    margin-bottom: 0.45rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(7, 0.875rem);
    gap: 3px;
  }
  .d {
    box-sizing: border-box;
    display: block;
    width: 0.875rem;
    height: 0.875rem;
    margin: 0;
    padding: 0;
    border: 1px solid var(--hair);
    background: none;
  }
  /* a day with stories: darker the more it has */
  button.d {
    border-color: var(--ink);
    cursor: pointer;
    outline: none;
  }
  .n1 {
    background: color-mix(in srgb, var(--ink) 30%, transparent);
  }
  .n2 {
    background: color-mix(in srgb, var(--ink) 62%, transparent);
  }
  .n3 {
    background: var(--ink);
  }
  button.d:hover,
  button.d:focus-visible,
  button.d[aria-pressed='true'] {
    border-color: var(--accent);
    background: var(--accent);
  }

  /* ---- a count as a bar: the name over it, the number at its end ---- */
  .bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    width: 100%;
    margin: 0;
    padding: 0.4rem 0 0.55rem;
    border: 0;
    background: none;
    color: var(--ink);
    font: 500 0.875rem / 1.2 var(--sans);
    text-align: start;
    cursor: pointer;
    outline: none;
  }
  .bar::before,
  .bar::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
  }
  .bar::before {
    right: 0;
    background: var(--hair);
  }
  .bar::after {
    width: calc(var(--w) * 100%);
    background: var(--ink);
  }
  .bar .n {
    color: var(--mute);
  }
  .bar:hover .nm,
  .bar:focus-visible .nm {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .bar[aria-pressed='true']::after {
    background: var(--accent);
  }
  .bar[aria-pressed='true'] .n {
    color: var(--accent);
  }

  /* narrower, the side sits on top: the bars two to a row, to stay short */
  @media (max-width: 1099px) {
    .hist:not(.days) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 1.25rem;
    }
    .hist:not(.days) h2 {
      grid-column: 1 / -1;
    }
  }
</style>
