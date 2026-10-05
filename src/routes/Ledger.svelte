<script>
  /* A list of stories as a ledger, grouped by month: a photo in the picture
     column, then date, topic and headline, length. The picture column lines
     up with whatever sits above it (a writer's portrait), so one rule runs
     down the page: pictures to its left, words to its right. */
  import { sectionLabel, formatNumber } from '$lib/labels.js';
  import { photo, lastRead, MONTH, SHORT_DATE, STR } from '$lib/site/reel.js';
  import Mark from './Mark.svelte';
  import { storyUrl } from './grid.js';

  /* `topic`: on that topic's own list, so its name isn't repeated on every row */
  let { lang, stories, topic = null } = $props();
  const L = $derived(STR[lang]);
  let hero = $state(lastRead());

  const months = $derived.by(() => {
    const out = [];
    for (const s of stories) {
      const d = new Date(s.date);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (out.at(-1)?.key !== key) out.push({ key, label: MONTH[lang].format(d), items: [] });
      out.at(-1).items.push(s);
    }
    return out;
  });
</script>

{#each months as m (m.key)}
  <section class="month" aria-label={m.label}>
    <h2>{m.label}</h2>
    {#each m.items as s (s.slug)}
      {@const pic = photo(s)}
      <a class="row fill" href={storyUrl(s)} lang={s.lang} onclick={() => (hero = s.slug)}>
        <span class="pic" style:view-transition-name={hero === s.slug ? 'hero' : null}>{#if pic}<img src={pic.thumb.replace('w=200', 'w=480')} alt="" loading="lazy" />{/if}</span>
        <span class="date">{SHORT_DATE[s.lang].format(new Date(s.date))}</span>
        <span class="what">
          {#if s.section !== topic}<span class="topic"><Mark key={s.section} size={13} />{sectionLabel(s.section, s.lang)}</span>{/if}
          <span class="h">{s.title}</span>
        </span>
        <span class="len">{formatNumber(s.readTime, s.lang)} {STR[s.lang].min}</span>
      </a>
    {/each}
  </section>
{/each}
{#if !stories.length}<p class="none">{L.none}</p>{/if}

<style>
  .month h2 {
    margin: 0;
    padding: 0 var(--in) 0 calc(var(--pic) + var(--in));
    height: var(--label);
    border-top: var(--line) solid var(--rule);
    border-bottom: var(--line) solid var(--rule);
    background: linear-gradient(to right, transparent calc(var(--pic) - 1px), var(--rule) 0 var(--pic), transparent 0);
    font: 500 calc(0.6875rem * var(--k)) / var(--label) var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .row {
    display: grid;
    grid-template-columns: var(--pic) 6.5rem minmax(0, 1fr) 6rem;
    align-items: center;
    min-height: 5.5rem;
    color: var(--ink);
    text-decoration: none;
  }
  .row + .row {
    border-top: 1px solid var(--hair);
  }
  .pic {
    position: relative;
    align-self: stretch;
    border-right: var(--line) solid var(--rule);
    background: var(--i3);
  }
  .pic img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .date,
  .len {
    padding: 0 var(--in);
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .len {
    text-align: right;
  }
  .row:hover .date,
  .row:hover .len,
  .row:focus-visible .date,
  .row:focus-visible .len {
    color: inherit;
  }
  .what {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: var(--u) 0;
  }
  .topic {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: calc(0.875rem * var(--k));
    color: var(--mute);
  }
  .row:hover .topic,
  .row:focus-visible .topic {
    color: inherit;
  }
  .h {
    font-size: clamp(1.15rem, 0.95rem + 0.6vw, 1.55rem);
    font-weight: 600;
    font-stretch: 80%;
    line-height: 1.12;
    letter-spacing: -0.005em;
  }
  .row:lang(bn) .h {
    line-height: 1.35;
    letter-spacing: 0;
  }
  .none {
    margin: 0;
    padding: calc(1.5 * var(--in)) var(--in) calc(1.5 * var(--in)) calc(var(--pic) + var(--in));
    color: var(--mute);
  }

  @media (max-width: 759px) {
    .row {
      grid-template-columns: var(--pic) minmax(0, 1fr);
    }
    .date,
    .len {
      display: none;
    }
    .what {
      padding: var(--u) var(--in);
    }
    .h {
      font-size: 1.05rem;
    }
  }
</style>
