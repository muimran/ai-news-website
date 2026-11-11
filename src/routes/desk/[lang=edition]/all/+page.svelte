<script>
  /* The archive: every story in the edition, newest first, by month. */
  import { matches, STR } from '$lib/site/reel.js';
  import Frame from '../../Frame.svelte';
  import Side from '../../Side.svelte';
  import Stories from '../../Stories.svelte';
  import { deskHome } from '../../urls.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(STR[lang]);
  const FRONT = { en: 'Front page', bn: 'প্রথম পাতা' };
  const ARCHIVE = { en: 'Archive', bn: 'আর্কাইভ' };
  let q = $state('');
  const shown = $derived(data.stories.filter((s) => matches(s, q)).length);
</script>

<svelte:head>
  <title>{L.all} — Second Order</title>
</svelte:head>

<Frame>
  {#snippet side()}
    <Side {lang} label={ARCHIVE[lang]} title={L.all} total={data.stories.length} {shown} bind:q back={{ href: deskHome(lang), text: FRONT[lang] }} />
  {/snippet}
  <Stories {lang} stories={data.stories} {q} lead={false} />
</Frame>
