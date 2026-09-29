<script>
  import { sectionLabel } from '$lib/labels.js';
  import Index from '$lib/site/Index.svelte';
  import { topicUrl, STR } from '$lib/site/reel.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
  const name = $derived(sectionLabel(data.section, data.lang));
</script>

<svelte:head>
  <title>{name}: {L.all} — Ground Truth</title>
  <meta name="description" content={name} />
</svelte:head>

<Index
  lang={data.lang}
  stories={data.stories}
  title={name}
  kicker={L.topic}
  back={{ href: topicUrl(data.section, data.lang), label: L.reel }}
/>
