<script>
  import Edition from './Edition.svelte';

  let { data } = $props();
</script>

<!-- the editorial trial, its pages moving sideways like the reel -->
<Edition lang={data.lang} ed={data.edition} />
