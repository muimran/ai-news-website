<script>
  /* Sits above the edition layout, so it carries its own colours and reads
     the language off the path. */
  import { page } from '$app/state';
  import { base } from '$app/paths';

  const bn = $derived(page.url.pathname.split('/').includes('bn'));
  const lang = $derived(bn ? 'bn' : 'en');
</script>

<svelte:head>
  <title>{page.status} — Second Order</title>
</svelte:head>

<main class="err" {lang}>
  <p class="code">{page.status}</p>
  <h1>{page.status === 404 ? (bn ? 'এই পাতাটি পাওয়া যায়নি।' : 'This page isn’t here.') : bn ? 'কিছু একটা ভুল হয়েছে।' : 'Something went wrong.'}</h1>
  <a href="{base}/{lang}">← Second Order</a>
</main>

<style>
  :global(body:has(.err)) {
    margin: 0;
    background: #e9ebee;
  }
  .err {
    max-width: 40rem;
    padding: 20vh 6vw;
    color: #111318;
    font-family: 'Instrument Sans', 'Noto Sans Bengali', system-ui, sans-serif;
  }
  .code {
    margin: 0 0 1rem;
    color: #a8471a;
    font: 500 0.75rem/1 ui-monospace, monospace;
    letter-spacing: 0.08em;
  }
  h1 {
    margin: 0 0 2rem;
    font-size: clamp(2rem, 1rem + 4vw, 4rem);
    font-weight: 620;
    line-height: 1;
  }
  a {
    color: inherit;
    font: 500 0.8125rem/1 ui-monospace, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :global(body:has(.err)) {
      background: #0b0b0c;
    }
    .err {
      color: #eceef1;
    }
    .code {
      color: #f08a4f;
    }
  }
</style>
