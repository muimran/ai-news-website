<script>
  /* Procedural story artwork.

     Each story's slug seeds a layered composition of colour fields that are
     resolved through an 8x8 Bayer ordered-dither matrix — the same technique
     used to quantise images down to a limited palette. Never fetches, never
     404s, and gives every story a permanent visual identity. */

  import { onMount } from 'svelte';
  import { rng, range } from '../seed.js';

  let {
    seed = 'ground-truth',
    ratio = 0.62,
    tone = 'auto',
    class: klass = '',
    /* finer cells for narrow strips, where 4px would leave only two or three
       across and lose the dither texture entirely */
    cell = 4,
    /* take the wrapper's own height instead of deriving it from ratio —
       used by the mobile spine, which is sized by the row beside it */
    fill = false
  } = $props();

  let canvas = $state(null);
  let wrap = $state(null);

  const BAYER = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
  ];

  const ELECTRIC = '#0b5ce8';
  const NAVY = '#062446';
  const EMBER = '#ff8a1f';
  const PEACH = '#ffc2a8';
  const PAPER = '#f7f7f2';
  const INK = '#111111';

  /* Four deliberate colourways. Each keeps one dominant and one accent so the
     grid of stories reads as a family rather than a paint chart. */
  const WAYS = [
    { bg: ELECTRIC, layers: [PEACH, NAVY] },
    { bg: NAVY, layers: [ELECTRIC, EMBER] },
    { bg: PAPER, layers: [ELECTRIC, EMBER] },
    { bg: EMBER, layers: [NAVY, PEACH] },
    { bg: PEACH, layers: [NAVY, ELECTRIC] },
    { bg: INK, layers: [EMBER, ELECTRIC] }
  ];

  /* Every field is normalised so its transition zone falls INSIDE the canvas.
     The dithered gradient is the whole point — a field that resolves to all-on
     or all-off just paints a flat rectangle. */
  function buildFields(r) {
    const fields = [];
    for (let i = 0; i < 2; i++) {
      const kind = r();

      if (kind < 0.42) {
        // angled sweep, normalised to span exactly 0..1 across the frame
        const ang = range(r, 0, Math.PI * 2);
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const lo = Math.min(0, c) + Math.min(0, s);
        const span = Math.abs(c) + Math.abs(s) || 1;
        const mid = range(r, 0.32, 0.68);
        const soft = range(r, 0.3, 0.72);
        fields.push((x, y) => {
          const t = (x * c + y * s - lo) / span;
          return Math.max(0, Math.min(1, (t - mid) / soft + 0.5));
        });
      } else if (kind < 0.76) {
        // disc, always large enough to cross the frame
        const cx = range(r, 0.28, 0.72);
        const cy = range(r, 0.28, 0.72);
        const rad = range(r, 0.42, 0.85);
        fields.push((x, y) => {
          const d = Math.hypot(x - cx, y - cy) / rad;
          return Math.max(0, Math.min(1, 1.25 - d));
        });
      } else {
        // wide band with dithered shoulders
        const ang = range(r, 0, Math.PI);
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const lo = Math.min(0, c) + Math.min(0, s);
        const span = Math.abs(c) + Math.abs(s) || 1;
        const center = range(r, 0.34, 0.66);
        const half = range(r, 0.24, 0.46);
        fields.push((x, y) => {
          const t = (x * c + y * s - lo) / span;
          return Math.max(0, Math.min(1, 1.15 - Math.abs(t - center) / half));
        });
      }
    }
    return fields;
  }

  function paint() {
    if (!canvas || !wrap) return;
    const w = Math.round(wrap.clientWidth);
    if (w < 40) return;

    const h = fill ? Math.round(wrap.clientHeight) : Math.max(110, Math.round(w * ratio));
    if (h < 8) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const need = Math.round(w * dpr);
    const needH = Math.round(h * dpr);

    /* Grid and flex parents settle after first layout, so an early paint bakes
       in a low-res buffer that CSS then stretches. Comparing against the
       backing store rather than a cached width makes this self-correcting:
       whenever the canvas does not match its rendered size, redraw. */
    if (canvas.width === need && canvas.height === needH) return;

    canvas.width = need;
    canvas.height = needH;
    if (!fill) canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const r = rng(seed);
    let way = WAYS[Math.floor(r() * WAYS.length)];
    if (tone === 'light') way = WAYS[2];

    ctx.fillStyle = way.bg;
    ctx.fillRect(0, 0, w, h);

    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const fields = buildFields(r);

    fields.forEach((field, li) => {
      ctx.fillStyle = way.layers[li % way.layers.length];
      // later layers sit tighter so the composition keeps a focal point
      const bias = li === 0 ? 0.0 : -0.18;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const nx = cx / cols;
          const ny = cy / rows;
          const d = field(nx, ny) + bias;
          if (d <= 0) continue;
          const threshold = (BAYER[cy & 7][cx & 7] + 0.5) / 64;
          if (d > threshold) ctx.fillRect(cx * cell, cy * cell, cell, cell);
        }
      }
    });

    // occasional scan displacement — a nod to corrupted transmission
    if (r() > 0.55) {
      const bandY = Math.floor(range(r, 0.15, 0.8) * h);
      const bandH = Math.floor(range(r, 5, 16));
      const shift = Math.floor(range(r, -22, 22));
      const slice = ctx.getImageData(0, bandY, w, bandH);
      ctx.fillStyle = way.bg;
      ctx.fillRect(0, bandY, w, bandH);
      ctx.putImageData(slice, shift, bandY);
    }
  }

  onMount(() => {
    /* ResizeObserver drives painting: it fires once on observe with a settled
       measurement and again on every real size change. Gating the first paint
       behind IntersectionObserver looked like a cheap optimisation, but it
       leaves the artwork permanently blank anywhere IO never reports an
       intersection — a backgrounded tab, a hidden pane, a headless capture.
       These canvases are small and cheap; correctness wins. */
    let frame;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    });

    if (wrap) ro.observe(wrap);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  });
</script>

<div class="halftone {klass}" class:fill bind:this={wrap} aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .halftone {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: var(--paper-3);
  }
  canvas {
    display: block;
    width: 100%;
    transition: transform 0.7s var(--ease);
  }
  .halftone.fill,
  .halftone.fill canvas {
    height: 100%;
  }
  :global(a:hover) .halftone canvas,
  :global(a:focus-visible) .halftone canvas {
    transform: scale(1.028);
  }
</style>
