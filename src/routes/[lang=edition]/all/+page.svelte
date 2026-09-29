<script>
  import { base } from '$app/paths';
  import Index from '$lib/site/Index.svelte';
  import { STR } from '$lib/site/reel.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
</script>

<svelte:head>
  <title>{L.all} — Ground Truth</title>
  <meta name="robots" content="noindex, follow" />
</svelte:head>

<Index
  lang={data.lang}
  stories={data.stories}
  title={L.all}
  kicker="Ground Truth"
  back={{ href: `${base}/${data.lang}`, label: L.reel }}
  showTopic
  placeholder={L.searchAll}
/>
