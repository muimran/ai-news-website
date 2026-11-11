<script>
  /* A format (Investigations, Interviews): every story of that kind,
     across the topics, so each row says which topic it's from. */
  import { formatLabel } from '$lib/labels.js';
  import { matches, STR } from '$lib/site/reel.js';
  import Frame from '../../Frame.svelte';
  import Side from '../../Side.svelte';
  import Stories from '../../Stories.svelte';
  import { deskHome } from '../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  const FORMAT = { en: 'Format', bn: 'ধরন' };
  let q = $state('');
  const shown = $derived(data.stories.filter((s) => matches(s, q)).length);
</script>

<svelte:head>
  <title>{formatLabel(data.format, lang)} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <Side {lang} label={FORMAT[lang]} title={formatLabel(data.format, lang)} total={data.stories.length} {shown} bind:q back={{ href: deskHome(lang), text: FRONT[lang] }} />
  {/snippet}
  {#key data.format}<Stories {lang} stories={data.stories} {q} />{/key}
</Frame>
