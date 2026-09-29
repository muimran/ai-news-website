<script>
  import Reel from '$lib/site/Reel.svelte';
  import { STR } from '$lib/site/reel.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
</script>

<svelte:head>
  <title>Ground Truth — {L.tagline}</title>
  <meta name="description" content={L.tagline} />
</svelte:head>

<!-- The front reel opens on the issue card: the latest stories, the topics
     and who we are; every story card after it is the same size. -->
<Reel lang={data.lang} reel={data.reel} feature={null} opener="issue" />
