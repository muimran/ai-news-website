<script>
  import GridReel from '../../../GridReel.svelte';
  import { sectionLabel } from '$lib/labels.js';

  let { data } = $props();
</script>

<svelte:head>
  <title>{sectionLabel(data.section, data.lang)} — Ground Truth</title>
</svelte:head>

<GridReel lang={data.lang} reel={data.reel} section={data.section} />
