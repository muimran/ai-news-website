<script>
  /* A small mark for each topic, built from squares and circles in the two
     colours at their three strengths, so a topic has a face even where
     there's no photo. */
  let { key, size = 16 } = $props();
</script>

<svg class="mark" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
  {#if key === 'The AI Race'}
    <!-- two runners, one a step ahead -->
    <circle cx="7" cy="10" r="6" fill="var(--i3)" />
    <circle cx="13" cy="10" r="6" fill="var(--o)" />
  {:else if key === 'AI & Everyday Life'}
    <!-- a lit window -->
    <rect x="2" y="2" width="16" height="16" fill="var(--o3)" />
    <circle cx="10" cy="10" r="4" fill="var(--i)" />
  {:else if key === 'Work After Automation'}
    <!-- the day's work, getting shorter -->
    <rect x="2" y="3" width="16" height="4" fill="var(--i)" />
    <rect x="2" y="8" width="11" height="4" fill="var(--i2)" />
    <rect x="2" y="13" width="6" height="4" fill="var(--o)" />
  {:else if key === 'Machines and Power'}
    <!-- a square cut in two, one side on top -->
    <path d="M2 2H18V18Z" fill="var(--i)" />
    <path d="M2 2V18H18Z" fill="var(--o3)" />
  {:else if key === 'AI Across Bangladesh'}
    <!-- a disc set left of centre on its field -->
    <rect x="2" y="3" width="16" height="14" fill="var(--i3)" />
    <circle cx="9" cy="10" r="4.5" fill="var(--o)" />
  {:else if key === 'Climate, Chips & Infrastructure'}
    <!-- a rising sun beside a chip's grid -->
    <path d="M2 18V8A10 10 0 0 1 12 18Z" fill="var(--o)" />
    <rect x="13" y="2" width="2.5" height="2.5" fill="var(--i)" />
    <rect x="16.5" y="2" width="2.5" height="2.5" fill="var(--i)" />
    <rect x="13" y="5.5" width="2.5" height="2.5" fill="var(--i2)" />
    <rect x="16.5" y="5.5" width="2.5" height="2.5" fill="var(--i)" />
  {:else}
    <rect x="4" y="4" width="12" height="12" fill="var(--i2)" />
  {/if}
</svg>

<style>
  .mark {
    flex: none;
    display: block;
  }
</style>
