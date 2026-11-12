<script>
  /* A format (Investigations, Interviews): every story of that kind,
     across the topics, so each row says which topic it's from. */
  import { matches, STR } from '$lib/site/reel.js';
  import Frame from '../../Frame.svelte';
  import Side from '../../Side.svelte';
  import Stories from '../../Stories.svelte';
  import Pager from '../../Pager.svelte';
  import { deskHome } from '../../urls.js';
  import { formatName } from '../../formats.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  const FORMAT = { en: 'Format', bn: 'ধরন' };
  let q = $state('');
  // the whole count until the reader filters this page
  const shown = $derived(q.trim() ? data.stories.filter((s) => matches(s, q)).length : data.total);
</script>

<svelte:head>
  <title>{formatName(data.format, lang)} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <Side {lang} label={FORMAT[lang]} title={formatName(data.format, lang)} total={data.total} {shown} bind:q back={{ href: deskHome(lang), text: FRONT[lang] }} />
  {/snippet}
  {#key data.format}<Stories {lang} stories={data.stories} {q} lead={data.page === 1} />{/key}
  <Pager {lang} page={data.page} pages={data.pages} href={data.href} />
</Frame>
