<script>
  import { formatLabel } from '$lib/labels.js';
  import GridReel from '../../GridReel.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>{formatLabel(data.format, data.lang)} — New Terms</title>
</svelte:head>

<GridReel lang={data.lang} reel={data.reel} format={data.format} />
