<script>
  import GridReel from '../GridReel.svelte';
  import { STR } from '$lib/site/reel.js';

  let { data } = $props();
</script>

<svelte:head>
  <title>Ground Truth — {STR[data.lang].tagline}</title>
</svelte:head>

<GridReel lang={data.lang} reel={data.reel} opens />
