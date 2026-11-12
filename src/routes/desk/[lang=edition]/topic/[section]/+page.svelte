<script>
  /* A topic: its number and name down the side, as on its dossier's tab;
     beside it every story it has, the newest as a card, the rest by month. */
  import { sectionLabel } from '$lib/labels.js';
  import { matches, two, STR } from '$lib/site/reel.js';
  import Frame from '../../../Frame.svelte';
  import Side from '../../../Side.svelte';
  import Stories from '../../../Stories.svelte';
  import Pager from '../../../Pager.svelte';
  import { deskHome } from '../../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  let q = $state('');
  // the whole count until the reader filters this page
  const shown = $derived(q.trim() ? data.stories.filter((s) => matches(s, q)).length : data.total);
</script>

<svelte:head>
  <title>{sectionLabel(data.section, lang)} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <Side {lang} label={L.topic} no={two(data.no, lang)} title={sectionLabel(data.section, lang)} total={data.total} {shown} bind:q back={{ href: deskHome(lang), text: FRONT[lang] }} />
  {/snippet}
  {#key data.section}<Stories {lang} stories={data.stories} {q} topic={false} lead={data.page === 1} />{/key}
  <Pager {lang} page={data.page} pages={data.pages} href={data.href} />
</Frame>
