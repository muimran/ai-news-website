<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Header from '$lib/components/Header.svelte';
  import SearchOverlay from '$lib/components/SearchOverlay.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { t } from '$lib/i18n.js';
  import { homeUrl } from '$lib/content.js';

  let { data, children } = $props();
  const lang = $derived(data.lang);
  const L = $derived(t(lang));

  let searchOpen = $state(false);
  let untranslated = $state(false);

  onMount(() => {
    // the header sets this when a story had no sibling to switch to
    untranslated = page.url.searchParams.get('from') === 'untranslated';

    /* Land a returning reader in the language they last chose — but ONLY on a
       bare front page, and only from a preference they set themselves by using
       the switcher. Never from Accept-Language: plenty of phones in Bangladesh
       report an English locale while their owner reads Bangla, and guessing
       wrong sends people to the wrong newsroom. A shared story link never
       redirects, so a link always opens in the language it was written in. */
    const path = location.pathname.replace(/\/$/, '');
    const isFrontPage = path === '' || path === '/bn';
    if (!isFrontPage || untranslated) return;

    let pref = null;
    try {
      pref = localStorage.getItem('gt-lang');
    } catch {
      return;
    }
    if (pref && pref !== lang && (pref === 'en' || pref === 'bn')) {
      location.replace(homeUrl(pref));
    }
  });
</script>

<a class="skip-link" href="#main">{L.skipToMain}</a>

<Header onsearch={() => (searchOpen = true)} {lang} />

<SearchOverlay open={searchOpen} onclose={() => (searchOpen = false)} {lang} />

{#if untranslated}
  <div class="note shell" role="status">
    <p>{L.noTranslation}</p>
    <button class="label" onclick={() => (untranslated = false)} aria-label={L.closeMenu}>✕</button>
  </div>
{/if}

<main id="main">
  {@render children()}
</main>

<Footer {lang} />

<style>
  .note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: var(--ember);
    color: var(--navy);
    max-width: none;
    padding-block: 0.85rem;
  }
  .note p {
    font-family: var(--font-serif);
    font-size: 1rem;
    line-height: 1.4;
  }
  .note button {
    flex-shrink: 0;
    min-width: var(--tap);
    min-height: var(--tap);
  }
</style>
