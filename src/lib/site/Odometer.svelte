<script>
  /* A number that rolls like an odometer: each digit is a wheel of 0–9, set
     three times over so a wheel can roll on past 9 to 0 (or back past 0 to
     9) in the direction the number moved, then quietly snap back to the
     middle set. Bangla digits on the Bangla site. */
  import { untrack } from 'svelte';

  let { value, lang = 'en', width = 2 } = $props();

  const GLYPHS = { en: '0123456789', bn: '০১২৩৪৫৬৭৮৯' };
  const glyphs = $derived([...(GLYPHS[lang] ?? GLYPHS.en)]);
  const digitsOf = (v) => String(v).padStart(width, '0').split('').map(Number);
  const wheel = (d) => 10 + d; // a digit's place on the middle set

  function start() {
    return digitsOf(value).map((d) => ({ pos: wheel(d), still: true }));
  }
  let cols = $state(start());
  let last = untrack(() => value);

  $effect(() => {
    const v = value;
    untrack(() => {
      if (v === last) return;
      const up = v > last;
      last = v;
      const ds = digitsOf(v);
      while (cols.length < ds.length) cols.unshift({ pos: wheel(0), still: true });
      const from = cols.slice(cols.length - ds.length);
      cols = ds.map((d, i) => {
        const cur = ((from[i].pos % 10) + 10) % 10;
        let pos = wheel(d);
        if (up && d < cur) pos = 20 + d; // roll forward past 9
        if (!up && d > cur) pos = d; // roll back past 0
        return { pos, still: false };
      });
    });
  });

  /* After a wrap, move the wheel back to the middle set with no animation. */
  function settle(i) {
    const c = cols[i];
    const d = ((c.pos % 10) + 10) % 10;
    if (c.pos !== wheel(d)) cols[i] = { pos: wheel(d), still: true };
  }
</script>

<span class="odo" aria-hidden="true">
  {#each cols as c, i (i)}
    <span class="col">
      <span
        class="strip"
        class:still={c.still}
        style="transform: translateY({(-c.pos * 100) / 30}%)"
        ontransitionend={() => settle(i)}
      >
        {#each [0, 1, 2] as set (set)}
          {#each glyphs as g, k (k)}<span>{g}</span>{/each}
        {/each}
      </span>
    </span>
  {/each}
</span>

<style>
  .odo {
    position: relative;
    top: 0.12em; /* sit the wheels on the surrounding text's baseline */
    display: inline-flex;
    vertical-align: bottom;
  }
  .col {
    display: block;
    height: 1.2em;
    overflow: hidden;
  }
  .strip {
    display: block;
    transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .strip.still {
    transition: none;
  }
  .strip span {
    display: block;
    height: 1.2em;
    line-height: 1.2em;
    text-align: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .strip {
      transition: none;
    }
  }
</style>
