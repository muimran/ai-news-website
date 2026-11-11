<script>
  /* A topic: its number and name down the side, as on its dossier's tab;
     beside it every story it has, the newest as a card, the rest by month. */
  import { sectionLabel } from '$lib/labels.js';
  import { matches, two, STR } from '$lib/site/reel.js';
  import Frame from '../../../Frame.svelte';
  import Side from '../../../Side.svelte';
  import Stories from '../../../Stories.svelte';
  import { deskHome } from '../../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  let q = $state('');
  const shown = $derived(data.stories.filter((s) => matches(s, q)).length);
</script>

<svelte:head>
  <title>{sectionLabel(data.section, lang)} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <Side {lang} label={L.topic} no={two(data.no, lang)} title={sectionLabel(data.section, lang)} total={data.stories.length} {shown} bind:q back={{ href: deskHome(lang), text: FRONT[lang] }} />
  {/snippet}
  {#key data.section}<Stories {lang} stories={data.stories} {q} topic={false} />{/key}
</Frame>
