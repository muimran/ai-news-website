<script>
  import { sectionLabel } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';
  import ListPage from '../../../../ListPage.svelte';
  import { gridTopic } from '../../../../grid.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
  const name = $derived(sectionLabel(data.section, data.lang));
</script>

<svelte:head>
  <title>{L.all} · {name} — New Terms</title>
</svelte:head>

<ListPage
  lang={data.lang}
  stories={data.stories}
  section={data.section}
  title={L.all}
  kicker="{L.topic} · {name}"
  back={{ href: gridTopic(data.section, data.lang), label: L.reel }}
  placeholder={L.searchIn}
/>
