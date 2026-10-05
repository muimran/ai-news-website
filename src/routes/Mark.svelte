<script>
  /* A small mark for each topic, a plain picture of what it covers, built
     from squares, circles and a few lines in the two colours at their
     three strengths, simple enough to read at 11px. */
  let { key, size = 16 } = $props();
  const TEETH = [0, 45, 90, 135, 180, 225, 270, 315];
  const PINS = [6.5, 9.25, 12];
</script>

<svg class="mark" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
  {#if key === 'The AI Race'}
    <!-- a stopwatch: the race against time -->
    <rect x="8.5" y="1" width="3" height="2.4" fill="var(--i)" />
    <circle cx="10" cy="11.5" r="7.4" fill="var(--i)" />
    <circle cx="10" cy="11.5" r="5.4" fill="var(--o3)" />
    <path d="M10 11.5 13.4 7.6" stroke="var(--o)" stroke-width="2" stroke-linecap="round" />
    <circle cx="10" cy="11.5" r="1.4" fill="var(--o)" />
  {:else if key === 'AI & Everyday Life'}
    <!-- a home, its door lit -->
    <path d="M10 1.5 19 9.5H1Z" fill="var(--i)" />
    <rect x="3.5" y="9.5" width="13" height="8.5" fill="var(--i2)" />
    <rect x="8.2" y="12" width="3.6" height="6" fill="var(--o)" />
  {:else if key === 'Work After Automation'}
    <!-- a briefcase: the work -->
    <path d="M7 6.5V3.8h6v2.7" fill="none" stroke="var(--i)" stroke-width="1.8" />
    <rect x="2" y="6.5" width="16" height="11" fill="var(--i)" />
    <rect x="2" y="10.6" width="16" height="1.6" fill="var(--i2)" />
    <rect x="8.6" y="9.6" width="2.8" height="3.6" fill="var(--o)" />
  {:else if key === 'Machines and Power'}
    <!-- a gear, power at its hub -->
    <g fill="var(--i)">
      {#each TEETH as a (a)}<rect x="8.6" y="1.2" width="2.8" height="4" transform="rotate({a} 10 10)" />{/each}
      <circle cx="10" cy="10" r="6.2" />
    </g>
    <circle cx="10" cy="10" r="2.6" fill="var(--o)" />
  {:else if key === 'AI Across Bangladesh'}
    <!-- the flag: a disc set toward the pole on its field -->
    <rect x="2" y="2" width="1.6" height="16" fill="var(--i)" />
    <rect x="3.6" y="3" width="14.4" height="10" fill="var(--i2)" />
    <circle cx="9.6" cy="8" r="3.3" fill="var(--o)" />
  {:else if key === 'Climate, Chips & Infrastructure'}
    <!-- a chip with its pins, a leaf on it -->
    <g fill="var(--i2)">
      {#each PINS as p (p)}
        <rect x="2" y={p} width="3" height="1.5" />
        <rect x="15" y={p} width="3" height="1.5" />
        <rect x={p} y="2" width="1.5" height="3" />
        <rect x={p} y="15" width="1.5" height="3" />
      {/each}
    </g>
    <rect x="5" y="5" width="10" height="10" fill="var(--i)" />
    <path d="M7 13C7 8.6 9.6 7 13 7 13 11 11 13 7 13Z" fill="var(--o)" />
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
