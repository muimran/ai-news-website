<script>
  import { STR } from '$lib/site/reel.js';
  import ListPage from '../../ListPage.svelte';
  import { gridHome } from '../../grid.js';

  let { data } = $props();
  const L = $derived(STR[data.lang]);
</script>

<svelte:head>
  <title>{L.all} — New Terms</title>
</svelte:head>

<ListPage
  lang={data.lang}
  stories={data.stories}
  title={L.all}
  kicker="New Terms"
  back={{ href: gridHome(data.lang), label: L.reel }}
  placeholder={L.searchAll}
/>
