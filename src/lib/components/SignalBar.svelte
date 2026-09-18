<script>
  /* The section rule, as a readout.

     Earlier this was a pattern hashed from the section name — it LOOKED like a
     data strip while encoding nothing, which is worse than honest ornament.
     Now each segment is one story in that section: width is proportional to
     how long it takes, colour is what kind of thing it is. So before reading a
     word you can see how much is here and what sort of reading it is — four
     quick reports, or one long investigation.

     Without `stories` it falls back to the decorative seeded pattern, which is
     what the footer and error pages want. */

  import { rng } from '../seed.js';

  let { seed = 'signal', height = 4, muted = false, stories = null, lang = 'en' } = $props();

  const KIND_TONE = {
    Investigation: 'ember',
    Analysis: 'peach',
    Explainer: 'peach',
    'Q&A': 'peach',
    Interview: 'peach'
  };

  const encoded = $derived.by(() => {
    if (!stories?.length) return null;
    const mins = stories.map((s) => Math.max(2, s.video ? s.duration || s.readTime : s.readTime));
    const total = mins.reduce((a, b) => a + b, 0) || 1;
    return stories.map((s, i) => ({
      w: (mins[i] / total) * 100,
      tone: s.video ? 'video' : KIND_TONE[s.kind] || 'electric',
      title: s.title,
      mins: mins[i]
    }));
  });

  /* decorative fallback: many fine segments read as a readout, few wide ones
     read as stripes, so keep them narrow */
  const decorative = $derived.by(() => {
    const r = rng(seed);
    const out = [];
    let total = 0;
    while (total < 100) {
      const w = Math.min(100 - total, 0.8 + r() * 5.5);
      const roll = r();
      out.push({
        w,
        tone: roll < 0.34 ? 'electric' : roll < 0.48 ? 'ember' : roll < 0.58 ? 'peach' : 'void'
      });
      total += w;
    }
    return out;
  });

  const segments = $derived(encoded || decorative);

  const summary = $derived.by(() => {
    if (!encoded) return null;
    const mins = encoded.reduce((a, s) => a + s.mins, 0);
    return lang === 'bn'
      ? `${encoded.length}টি প্রতিবেদন, মোট ${mins} মিনিট`
      : `${encoded.length} ${encoded.length === 1 ? 'story' : 'stories'}, ${mins} minutes in total`;
  });
</script>

<div
  class="signal"
  class:muted
  class:encoded={!!encoded}
  style="--h:{height}px"
  role={encoded ? 'img' : undefined}
  aria-label={summary}
  aria-hidden={encoded ? undefined : 'true'}
>
  {#each segments as seg}
    <span
      class="seg {seg.tone}"
      style="width:{seg.w}%"
      title={seg.title ? `${seg.title} — ${seg.mins} min` : undefined}
    ></span>
  {/each}
</div>

<style>
  .signal {
    display: flex;
    width: 100%;
    height: var(--h);
    gap: 2px;
    overflow: hidden;
  }
  .seg {
    display: block;
    height: 100%;
  }

  /* when it encodes real stories the segments are wider, so give them a little
     interaction — hovering one tells you which story it is */
  .encoded {
    gap: 3px;
  }
  .encoded .seg {
    transition: transform 0.18s var(--ease);
    transform-origin: bottom;
  }
  .encoded .seg:hover {
    transform: scaleY(2.2);
  }

  .electric {
    background: var(--electric);
  }
  .ember {
    background: var(--ember);
  }
  .peach {
    background: var(--peach);
  }
  .video {
    /* video reads as a dashed run rather than a solid one */
    background: repeating-linear-gradient(
      90deg,
      var(--ember) 0 4px,
      transparent 4px 7px
    );
  }
  .void {
    background: transparent;
  }
  .muted .electric,
  .muted .ember,
  .muted .peach {
    background: var(--rule-strong);
  }
</style>
