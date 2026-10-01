<script>
  import { formatLabel } from '$lib/labels.js';
  import { STR } from '$lib/site/reel.js';
  import ListPage from '../../../ListPage.svelte';
  import { gridFormat } from '../../../grid.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
  const name = $derived(formatLabel(data.format, data.lang));
</script>

<svelte:head>
  <title>{L.all} · {name} — Ground Truth</title>
</svelte:head>

<ListPage
  lang={data.lang}
  stories={data.stories}
  title={L.all}
  kicker="{L.format} · {name}"
  back={{ href: gridFormat(data.format, data.lang), label: L.reel }}
  placeholder={L.searchBy}
/>
