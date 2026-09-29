<script>
  import { formatLabel } from '$lib/labels.js';
  import Reel from '$lib/site/Reel.svelte';

  let { data } = $props();
  const name = $derived(formatLabel(data.format, data.lang));
</script>

<svelte:head>
  <title>{name} — Ground Truth</title>
  <meta name="description" content={name} />
</svelte:head>

<Reel lang={data.lang} reel={data.reel} format={data.format} />
