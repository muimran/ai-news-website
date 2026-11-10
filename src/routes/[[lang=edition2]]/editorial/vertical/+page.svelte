<script>
  import Vertical from '../Vertical.svelte';

  let { data } = $props();
</script>

<!-- the editorial trial, read down: one table, top to bottom -->
<Vertical lang={data.lang} ed={data.edition} />
