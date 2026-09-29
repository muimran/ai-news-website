<script>
  import Reel from '../Reel.svelte';
  import { STR } from '../reel.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
</script>

<svelte:head>
  <title>Ground Truth — {L.tagline}</title>
  <meta name="description" content={L.tagline} />
</svelte:head>

<Reel lang={data.lang} reel={data.reel} />
