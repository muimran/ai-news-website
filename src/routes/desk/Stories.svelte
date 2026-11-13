<script>
  /* A list of stories in Desk's look, for a topic, a format, a writer or
     the whole archive. The newest stands first as a card in its picture's
     colour; the rest are a ledger on a tray of paper, by month: a square
     of the picture, the day, the headline and summary, the facts.

     `q` filters them where they stand (the field is the page's own, in its
     side column): the card steps aside and every match is a row. */
  import { sectionLabel, kindLabel, formatNumber, KINDS } from '$lib/labels.js';
  import { photo, matches, SHORT_DATE, STR } from '$lib/site/reel.js';
  import { deskStory } from './urls.js';

  let { lang, stories, q = '', lead = true, topic = true } = $props();
  const L = $derived(STR[lang]);
  const num = (n) => formatNumber(n, lang);

  const VIDEO = { en: 'Video', bn: 'ভিডিও' };
  const MONTH = {
    en: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD-u-nu-beng', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  };
  const mins = (s) => `${num(s.video ? s.duration || s.readTime : s.readTime)} ${L.min}`;
  const kind = (s) => (KINDS.includes(s.kind) ? kindLabel(s.kind, s.lang) : s.video ? VIDEO[s.lang] : null);
  const day = (s) => SHORT_DATE[lang].format(new Date(s.date));

  const found = $derived(q.trim() ? stories.filter((s) => matches(s, q)) : stories);
  const first = $derived(lead && !q.trim() && stories.length > 1 ? stories[0] : null);
  /* the ledger, by the month a story is dated */
  const months = $derived.by(() => {
    const out = [];
    for (const s of first ? found.slice(1) : found) {
      const name = MONTH[lang].format(new Date(s.date));
      if (out.at(-1)?.name !== name) out.push({ name, rows: [] });
      out.at(-1).rows.push(s);
    }
    return out;
  });
</script>

{#if first}
  {@const p = photo(first)}
  <a class="first" href={deskStory(first)} style:--bg={first.tone?.bg} style:--fg={first.tone?.fg} lang={first.lang}>
    {#if p}<img class="art" src={p.thumb} srcset={p.srcset} sizes="(max-width: 759px) 100vw, 40vw" alt="" />{/if}
    <span class="txt">
      <span class="mono tag"><i class="dot" aria-hidden="true"></i>{[topic && sectionLabel(first.section, first.lang), kind(first)].filter(Boolean).join(' / ') || mins(first)}</span>
      <span class="hl">{first.title}</span>
      {#if first.dek}<span class="dek">{first.dek}</span>{/if}
      <span class="mono by">{[first.author, day(first), mins(first)].filter(Boolean).join(' · ')}</span>
    </span>
  </a>
{/if}

{#if months.length}
  <div class="tray">
    {#each months as m (m.name)}
      <section>
        <h2 class="mono month"><span>{m.name}</span><span>{num(m.rows.length)}</span></h2>
        {#each m.rows as s (`${s.lang}/${s.ym}/${s.slug}`)}
          {@const p = photo(s)}
          <a class="row" href={deskStory(s)} lang={s.lang}>
            <span class="sq" style:--bg={s.tone?.bg}>{#if p}<img src={p.small} alt="" loading="lazy" />{/if}</span>
            <span class="mono when">{day(s)}</span>
            <span class="what">
              <span class="hl">{s.title}</span>
              {#if s.dek}<span class="dek">{s.dek}</span>{/if}
              <span class="mono facts"
                >{[topic && sectionLabel(s.section, s.lang), kind(s), s.author, mins(s)].filter(Boolean).join(' · ')}{#if s.video}<i class="tri" aria-hidden="true"></i>{/if}{#if s.lang !== lang}<b>{s.lang === 'bn' ? 'বাংলা' : 'English'}</b>{/if}</span
              >
            </span>
          </a>
        {/each}
      </section>
    {/each}
  </div>
{:else if q.trim()}
  <p class="none">{L.none}</p>
{/if}

<style>
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
  .hl {
    font-family: var(--serif);
    font-weight: var(--hw);
    line-height: var(--hlh);
    letter-spacing: var(--hls);
    font-variation-settings: 'opsz' 72;
    text-wrap: balance;
  }
  /* a story in the other language keeps its own letters' measure */
  [lang='bn'] .hl,
  .first[lang='bn'] .hl {
    font-family: 'Noto Serif Bengali', var(--serif);
    line-height: 1.34;
    letter-spacing: 0;
  }
  .dek {
    line-height: 1.45;
    text-wrap: pretty;
  }
  .dek:lang(bn) {
    line-height: 1.6;
  }

  /* ---- the newest: a card in its picture's colour ---- */
  .first {
    position: relative;
    box-sizing: border-box;
    display: block;
    min-height: 22rem;
    overflow: hidden;
    border: 1px solid var(--ink);
    background: var(--bg, var(--card));
    color: var(--fg, var(--ink));
    outline: none;
    transition:
      transform 0.16s ease-out,
      box-shadow 0.16s ease-out;
  }
  @media (hover: hover) {
    .first:hover,
    .first:focus-visible {
      transform: translate(-3px, -3px);
      box-shadow: 4px 4px 0 var(--ink);
    }
  }
  .txt {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 58%;
    padding: 1.4rem 1.5rem 1.6rem;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dot {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    background: currentColor;
  }
  .first .hl {
    font-size: calc(clamp(1.9rem, 3vw, 3rem) * var(--hk));
  }
  .first .dek {
    max-width: 24em;
    font-size: 1.0625rem;
  }
  .by {
    opacity: 0.72;
  }
  .art {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 56%;
    height: auto;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 36%), linear-gradient(to right, transparent, #000 30%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to bottom, transparent, #000 36%), linear-gradient(to right, transparent, #000 30%);
    mask-composite: intersect;
  }

  /* ---- the rest: a ledger on a tray, by month ---- */
  .tray {
    padding: 0 1.25rem 0.5rem;
    border: 1px solid var(--ink);
    background: var(--card);
  }
  .month {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin: 0;
    padding: 1rem 0 0.8rem;
    border-bottom: 1px solid var(--ink);
  }
  section + section .month {
    margin-top: 1rem;
  }
  .month span:last-child {
    color: var(--mute);
  }
  .row {
    display: grid;
    grid-template-columns: 7.5rem 7rem minmax(0, 1fr);
    align-items: start;
    gap: 1.1rem;
    padding: 0.95rem 0;
    border-bottom: 1px solid var(--hair);
    outline: none;
  }
  section:last-child .row:last-child {
    border-bottom: 0;
  }
  /* the picture: always 4:3, as on the front page */
  .sq {
    display: block;
    aspect-ratio: 4 / 3;
    overflow: hidden;
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
  .row .hl {
    font-size: calc(clamp(1.2rem, 1.55vw, 1.45rem) * var(--hk));
    font-weight: calc(var(--hw) - 60);
    line-height: calc(var(--hlh) + 0.1);
    letter-spacing: calc(var(--hls) / 2);
    font-variation-settings: 'opsz' 30;
  }
  .row:hover .hl,
  .row:focus-visible .hl {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.16em;
  }
  .row .dek {
    max-width: 44em;
    color: var(--mute);
    font-size: 0.9375rem;
  }
  .facts {
    color: var(--mute);
  }
  .facts b {
    margin-left: 0.8em;
    padding: 0.1em 0.45em;
    border: 1px solid currentColor;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
  }
  .tri {
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 0.6em;
    border: 0.34em solid transparent;
    border-right: 0;
    border-left: 0.58em solid var(--accent);
  }
  .none {
    margin: 0;
    padding: 1.25rem;
    border: 1px solid var(--ink);
    background: var(--card);
  }

  @media (max-width: 759px) {
    .first {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .txt {
      max-width: none;
      gap: 0.85rem;
      padding: 1.1rem 1.1rem 0;
    }
    .first .hl {
      font-size: calc(clamp(1.8rem, 8vw, 2.2rem) * var(--hk));
    }
    .art {
      position: static;
      order: 2;
      display: block;
      width: 100%;
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 40%);
      mask-image: linear-gradient(to bottom, transparent, #000 40%);
    }
    .tray {
      padding: 0 1rem 0.25rem;
    }
    .row {
      grid-template-columns: 5.5rem minmax(0, 1fr);
      gap: 0.9rem;
    }
    .sq {
      grid-row: 1 / 3;
    }
    .when {
      grid-column: 2;
      padding-top: 0;
    }
    .what {
      grid-column: 2;
      margin-top: -0.5rem;
    }
    .row .dek {
      display: none;
    }
  }
</style>
