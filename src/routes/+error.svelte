<script>
  import { page } from '$app/state';
  import SignalBar from '$lib/components/SignalBar.svelte';
  import { t } from '$lib/i18n.js';
  import { homeUrl } from '$lib/content.js';

  /* The error page sits above the language segment, so it reads the language
     off the path rather than from layout data. */
  const lang = $derived(page.url.pathname.split('/')[1] === 'bn' ? 'bn' : 'en');
  const L = $derived(t(lang));
</script>

<svelte:head><title>{page.status} — Ground Truth</title></svelte:head>

<section class="err shell">
  <SignalBar seed="error-{page.status}" height={10} />
  <p class="code label">{page.status}</p>
  <h1>{page.status === 404 ? L.err404 : L.errOther}</h1>
  <p class="body">{L.errBody}</p>
  <a class="back label" href={homeUrl(lang)}>{L.errBack}</a>
</section>

<style>
  .err {
    padding-block: clamp(3rem, 8vw, 7rem) var(--stack-lg);
    max-width: 52rem;
  }
  .code {
    color: var(--ember);
    margin-top: 2rem;
  }
  h1 {
    font-size: var(--t-mega);
    margin-top: 1rem;
  }
  .body {
    font-family: var(--font-serif);
    font-size: var(--t-md);
    color: var(--slate);
    margin-top: 1.25rem;
    max-width: 46ch;
    line-height: 1.5;
  }
  .back {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    margin-top: 2rem;
    background: var(--ink);
    color: var(--paper);
    padding: 0 1.35rem;
    transition: background 0.2s;
  }
  .back:hover {
    background: var(--electric);
  }
</style>
