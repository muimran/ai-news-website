<script>
  import { formatLabel } from '$lib/labels.js';
  import Index from '$lib/site/Index.svelte';
  import { formatUrl, STR } from '$lib/site/reel.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
  const name = $derived(formatLabel(data.format, data.lang));
</script>

<svelte:head>
  <title>{name}: {L.all} — Ground Truth</title>
  <meta name="description" content={name} />
</svelte:head>

<Index
  lang={data.lang}
  stories={data.stories}
  title={name}
  kicker={L.format}
  showTopic
  placeholder={L.searchBy}
  back={{ href: formatUrl(data.format, data.lang), label: L.reel }}
/>
