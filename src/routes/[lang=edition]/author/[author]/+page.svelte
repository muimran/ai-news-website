<script>
  import { base } from '$app/paths';
  import Index from '$lib/site/Index.svelte';
  import { STR } from '$lib/site/reel.js';

  let { data } = $props();
  const L = STR.en;
  const w = $derived(data.author);
</script>

<svelte:head>
  <title>{w.name} — Ground Truth</title>
  <meta name="description" content="{w.name}, {w.role || L.reporter}" />
</svelte:head>

<Index
  lang="en"
  stories={data.stories}
  title={w.name}
  intro={w.bio}
  portrait
  photo={w.photo}
  links={w.links}
  kicker={w.role || L.reporter}
  back={{ href: `${base}/en/authors`, label: L.reporters }}
  placeholder={L.searchBy}
  showTopic
/>
