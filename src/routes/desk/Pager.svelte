<script>
  /* Under a long list: the way to newer and older pages of it. */
  import { formatNumber } from '$lib/labels.js';
  import { pageHref } from './paging.js';

  let { lang, page, pages, href } = $props();
  const W = {
    en: { newer: 'Newer', older: 'Older', of: (a, b) => `Page ${a} of ${b}` },
    bn: { newer: 'নতুনতর', older: 'পুরোনো', of: (a, b) => `পাতা ${a} / ${b}` }
  };
  const num = (n) => formatNumber(n, lang);
</script>

{#if pages > 1}
  <nav class="pager mono" aria-label={W[lang].of(num(page), num(pages))}>
    {#if page > 1}<a href={pageHref(href, page - 1)} rel="prev">← {W[lang].newer}</a>{:else}<span></span>{/if}
    <span class="at">{W[lang].of(num(page), num(pages))}</span>
    {#if page < pages}<a href={pageHref(href, page + 1)} rel="next">{W[lang].older} →</a>{:else}<span></span>{/if}
  </nav>
{/if}

<style>
  .pager {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 0;
    border-top: 1px solid var(--ink);
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
  }
  .pager a {
    justify-self: start;
    display: inline-flex;
    text-decoration: none;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    border: 1px solid var(--ink);
    background: var(--card);
  }
  .pager a:hover,
  .pager a:focus-visible {
    background: var(--ink);
    color: var(--card);
    outline: none;
  }
  .pager a[rel='next'] {
    justify-self: end;
  }
  .at {
    color: var(--mute);
  }
</style>
