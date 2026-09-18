<!--
  REMOVED, RECOVERABLE: the top ribbon.

  A full-width electric-blue bar above the masthead, removed Sept 2026. It held
  four things:
    1. the current date, localised per edition (Intl.DateTimeFormat, bn-BD/en-GB)
    2. the tagline, hidden below 900px
    3. a light/dark toggle
    4. the language switch, which now lives small in .actions below

  To bring it back: restore a .rail block as the first child of <header>, with
  `max-height: 2.25rem` collapsing to 0 under `.compact`. Keep the hysteresis in
  onMount — the ribbon changing height is exactly what caused the original
  scroll flicker, and a single threshold will reintroduce it.

  The theme toggle needs more than markup: `src/lib/theme.js` was deleted along
  with it. The CSS side survives untouched — app.css still defines
  `:root[data-theme="dark"]` and guards the media query with
  `:root:not([data-theme="light"])`, so a toggle only has to stamp or clear
  `data-theme` on <html> and everything re-themes.
-->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Wordmark from './Wordmark.svelte';
  import { t } from '../i18n.js';
  import { getStory, sibling, storyUrl, homeUrl, topicUrl, sectionSlug, liveSections } from '../content.js';

  let { onsearch, lang = 'en' } = $props();

  const L = $derived(t(lang));
  const other = $derived(lang === 'en' ? 'bn' : 'en');

  let compact = $state(false);
  let menuOpen = $state(false);

  /* The header renders on every page, so these must be absolute to the
     current language's front page. A bare "#latest" is simply dead on an
     article page — the section it points at isn't there. */
  const home = $derived(homeUrl(lang));

  /* A nav item may point at a section this desk does not cover — the Bangla
     edition publishes fewer beats than the English one. Anchoring to a section
     that was never rendered produces a link that silently does nothing, so
     fall back to the top of the page whenever the target is not live. */
  const anchor = $derived((section) =>
    liveSections(lang).includes(section) ? `${home}#${sectionSlug(section)}` : `${home}#latest`
  );

  const NAV = $derived([
    { label: L.nav.latest, href: `${home}#latest` },
    { label: L.nav.investigations, href: anchor('Machines and Power') },
    { label: L.nav.ideas, href: anchor('The AI Race') },
    { label: L.nav.people, href: anchor('Work After Automation') },
    { label: L.nav.tools, href: `${home}#tools` },
    { label: L.nav.about, href: `${home}#about` }
  ]);

  /* Where the language switch goes.
     On a story, jump to its sibling so the reader keeps their place. Without a
     sibling, fall back to the other front page — and say so, because silently
     dumping someone on a homepage reads as a broken link. */
  const alt = $derived.by(() => {
    const params = page.params || {};
    const path = page.url?.pathname || '/';

    if (params.slug) {
      const story = getStory(params.slug, lang);
      const twin = sibling(story, other);
      if (twin) return { href: storyUrl(twin), missing: false };
      return { href: homeUrl(other), missing: true };
    }
    if (params.tag) return { href: topicUrl(params.tag, other), missing: false };

    const hash = path.includes('#') ? '' : '';
    return { href: homeUrl(other) + hash, missing: false };
  });

  function switchLang(e) {
    try {
      localStorage.setItem('gt-lang', other);
    } catch {
      /* private mode — the navigation still works, it just won't be remembered */
    }
    if (alt.missing) {
      // let the destination explain why it isn't the story they clicked from
      e.preventDefault();
      location.href = alt.href + '?from=untranslated';
    }
  }

  /* If the browser can drive compaction from the scroll timeline, the CSS owns
     it and this listener never attaches. Running both would mean two things
     setting the same sizes from different sources — the JS snapping at 170px
     while the CSS interpolates continuously, fighting on every frame. */
  const cssDrivesCompaction =
    typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: scroll()');

  onMount(() => {
    if (cssDrivesCompaction) return;

    /* Hysteresis, not a single threshold.

       The header is sticky, so it sits in flow: collapsing the rail shifts
       everything below it up by ~36px, which drops scrollY back under a single
       threshold, which re-expands the rail, which pushes content down again.
       That loop is the flicker. Two thresholds with a dead zone between them
       break it — once compacted it takes a deliberate scroll back toward the
       top to expand again. */
    const COMPACT_AT = 170;
    const EXPAND_AT = 70;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!compact && y > COMPACT_AT) compact = true;
        else if (compact && y < EXPAND_AT) compact = false;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    }
  });
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === 'Escape' && menuOpen) menuOpen = false;
    if (e.key === '/' && !menuOpen && !/^(INPUT|TEXTAREA)$/.test(e.target?.tagName)) {
      e.preventDefault();
      onsearch?.();
    }
  }}
/>

<header class="head" class:compact>
  <div class="bar">
    <div class="shell bar-in">
      <nav class="nav left" aria-label={L.nav.latest}>
        {#each NAV.slice(0, 3) as item}
          <a href={item.href}>{item.label}</a>
        {/each}
      </nav>

      <a href={homeUrl(lang)} class="mark" aria-label={L.home}>
        <Wordmark size={compact ? 'sm' : 'md'} />
      </a>

      <div class="actions">
        <nav class="nav right" aria-label={L.nav.about}>
          {#each NAV.slice(3) as item}
            <a href={item.href}>{item.label}</a>
          {/each}
        </nav>

        <a
          class="lang label"
          href={alt.href}
          hreflang={other}
          lang={other}
          onclick={switchLang}
          title={L.switchTo}>{L.otherLangName}</a
        >

        <button class="icon" onclick={() => onsearch?.()} aria-label={L.searchStories}>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path d="M12.8 12.8 17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>

        <a href="{home}#newsletter" class="cta label">{L.newsletter}</a>

        <button
          class="icon burger"
          onclick={() => (menuOpen = !menuOpen)}
          aria-label={menuOpen ? L.closeMenu : L.openMenu}
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            {#if menuOpen}
              <path d="M4 4 16 16M16 4 4 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            {:else}
              <path d="M2 6h16M2 13h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>

{#if menuOpen}
  <div class="sheet">
    <nav class="sheet-nav" aria-label={L.nav.about}>
      {#each NAV as item, i}
        <a href={item.href} onclick={() => (menuOpen = false)}>
          <span class="label n">{String(i + 1).padStart(2, '0')}</span>
          {item.label}
        </a>
      {/each}
    </nav>
    <div class="sheet-foot">
      <button class="label" onclick={() => { menuOpen = false; onsearch?.(); }}>{L.search}</button>
      <a class="label" href={alt.href} hreflang={other} lang={other} onclick={switchLang}
        >{L.otherLangName}</a
      >
    </div>
  </div>
{/if}

<style>
  .head {
    /* named so the browser carries it across a navigation as one element */
    view-transition-name: site-header;
    position: sticky;
    top: 0;
    z-index: 90;
    background: var(--paper);
    border-bottom: 1px solid var(--rule);
  }


  .bar {
    padding-block: clamp(0.85rem, 1.6vw, 1.35rem);
    transition: padding 0.3s var(--ease);
  }

  /* ---- fallback path: JS toggles .compact, header snaps between two sizes ---- */
  .compact .bar {
    padding-block: 0.6rem;
  }

  /* ---- modern path: continuous, tied to scroll position ----

     The header no longer snaps at a threshold — it shrinks in proportion to
     how far you have scrolled, and is fully compact by 200px. This removes the
     flicker as a CATEGORY rather than working around it: there are no two
     states to oscillate between, so no hysteresis is needed here. It also runs
     off the main thread, so it stays smooth while the page is busy.

     `scroll()` with no arguments resolves to the nearest scrollport, which for
     the document header is the page itself. */
  @supports (animation-timeline: scroll()) {
    .bar {
      transition: none;
      animation: bar-compact linear both;
      animation-timeline: scroll();
      animation-range: 0 200px;
    }
    .mark {
      animation: mark-shrink linear both;
      animation-timeline: scroll();
      animation-range: 0 200px;
    }
    /* the JS class is inert on this path, but belt and braces */
    .compact .bar {
      padding-block: unset;
    }
  }

  @keyframes bar-compact {
    to {
      padding-block: 0.6rem;
    }
  }
  @keyframes mark-shrink {
    to {
      transform: scale(0.74);
    }
  }

  /* ---- the header styles itself while pinned ----

     `stuck: top` is true only while the element is actually stuck, so the rule
     below needs no scroll listener and no measurement. The browser knows
     directly, which is why this cannot drift out of sync the way a JS
     threshold can. */
  @supports (container-type: scroll-state) {
    .head {
      container-type: scroll-state;
    }
    @container scroll-state(stuck: top) {
      .bar {
        border-bottom: 1px solid var(--rule);
        margin-bottom: -1px;
      }
    }
  }
  .bar-in {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1.5rem;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: clamp(0.9rem, 1.8vw, 1.75rem);
  }
  .nav a {
    font-family: var(--font-mono);
    font-size: var(--t-label);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--slate);
    padding-block: 0.3rem;
    border-bottom: 1.5px solid transparent;
    transition: color 0.18s, border-color 0.18s;
  }
  .nav a:hover,
  .nav a:focus-visible {
    color: var(--ink);
    border-bottom-color: var(--ember);
  }

  .mark {
    transform-origin: center center;
    justify-self: center;
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: clamp(0.75rem, 1.4vw, 1.35rem);
    flex-shrink: 0;
    min-width: max-content;
  }

  /* The language switch used to sit in the ribbon. It stays deliberately
     quiet here — a reader who wants it goes looking for it; everyone else
     should not have it competing with the masthead. */
  .lang {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding-inline: 0.55rem;
    color: var(--slate);
    border: 1px solid var(--rule-strong);
    letter-spacing: 0.06em;
    transition: all 0.16s;
  }
  .lang:hover {
    color: var(--ink);
    border-color: var(--ink);
  }

  .icon {
    display: grid;
    place-items: center;
    width: var(--tap);
    height: var(--tap);
    margin-inline: -0.35rem;
    color: var(--ink);
    transition: color 0.18s;
  }
  .actions > :last-child {
    margin-right: 0;
  }
  .icon:hover {
    color: var(--electric);
  }
  .burger {
    display: none;
  }

  .cta {
    background: var(--ink);
    color: var(--paper);
    padding: 0.6rem 1.05rem 0.55rem;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .cta:hover {
    background: var(--electric);
  }

  @media (max-width: 1080px) {
    .nav.right {
      display: none;
    }
  }
  @media (max-width: 860px) {
    .bar-in {
      grid-template-columns: auto 1fr;
      gap: 0.75rem;
    }
    .nav.left {
      display: none;
    }
    .mark {
      justify-self: start;
      transform-origin: left center;
    }
    .burger {
      display: grid;
    }
    .cta {
      display: none;
    }
  }

  .sheet {
    position: fixed;
    inset: 0;
    z-index: 89;
    background: var(--paper);
    padding: 7rem var(--gutter) 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    animation: sheet 0.28s var(--ease);
  }
  @keyframes sheet {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
  }
  .sheet-nav {
    display: flex;
    flex-direction: column;
  }
  .sheet-nav a {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding-block: 0.7rem;
    border-top: 1px solid var(--rule);
    font-family: var(--font-display);
    font-weight: 800;
    font-stretch: 108%;
    font-size: clamp(1.75rem, 8vw, 2.75rem);
    letter-spacing: -0.028em;
  }
  .sheet-nav .n {
    color: var(--ember);
  }
  .sheet-foot {
    display: flex;
    gap: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--rule);
    color: var(--slate);
  }
  .sheet-foot button:hover,
  .sheet-foot a:hover {
    color: var(--electric);
  }
</style>
