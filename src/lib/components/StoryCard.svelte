<script>
  import Halftone from './Halftone.svelte';
  import { storyUrl, sectionLabel, kindLabel, formatNumber } from '../content.js';
  import { t } from '../i18n.js';

  /** variant: lead | feature | standard | compact | list */
  let {
    story,
    variant = 'standard',
    showDek = true,
    showArt = true,
    index = null,
    lang = 'en',
    /* inside a section block the section name is already the heading, so the
       card says what KIND of story it is instead, quietly */
    inSection = false
  } = $props();

  const L = $derived(t(lang));

  const artRatio = { lead: 0.52, feature: 0.6, standard: 0.66, compact: 0.66, list: 0.66 };

  /* If a photo 404s the layout must not collapse into a blank box, so a failed
     load falls through to the generated artwork. */
  let imgFailed = $state(false);
  const hasPhoto = $derived(!!story.image?.src && !imgFailed);
  const isVideo = $derived(!!story.video);
  /* video runtime is a fact about the file; read time is an estimate — so a
     video shows its real duration and says "watch", never "read" */
  const timeValue = $derived(isVideo ? story.duration || story.readTime : story.readTime);
</script>

<article class="card {variant}">
  <a href={storyUrl(story)} class="hit">
    {#if showArt && variant !== 'compact' && variant !== 'list'}
      <!-- the spine only renders on small screens (CSS-gated), where the full
           artwork is suppressed; it keeps each story's generated identity at a
           cost of 14px of width and no vertical space at all -->
      <div class="spine">
        <Halftone seed={story.slug} cell={2} fill={true} />
      </div>
      <!-- the name must be unique per document; each story renders art at most
           once per page, and compact/list/radar cards have no art box at all -->
      <div class="art" class:photo={hasPhoto} style="view-transition-name: art-{story.slug}">
        {#if hasPhoto}
          <img
            src={story.image.src}
            alt={story.image.alt}
            loading="lazy"
            decoding="async"
            style="aspect-ratio:{(1 / artRatio[variant]).toFixed(3)}"
            onerror={() => (imgFailed = true)}
          />
          {#if story.image.credit}
            <span class="credit">{story.image.credit}</span>
          {/if}
        {:else}
          <Halftone seed={story.slug} ratio={artRatio[variant]} />
        {/if}
        {#if isVideo}
          <span class="play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
        {/if}
        {#if !inSection}<span class="kind label">{kindLabel(story.kind, lang)}</span>{/if}
      </div>
    {/if}

    <div class="text">
      {#if index !== null}
        <span class="index label">{String(index).padStart(2, '0')}</span>
      {/if}

      <span class="section label" class:quiet={inSection}>
        {#if isVideo}
          <!-- compact and list rows have no art box, so the format cue has to
               live in the text or those readers cannot tell it is a video -->
          <svg class="vmark" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        {/if}{inSection ? kindLabel(story.kind, lang) : sectionLabel(story.section, lang)}
      </span>

      <h3 class="title"><span class="headline-link">{story.title}</span></h3>

      {#if showDek && story.dek && variant !== 'list'}
        <p class="dek">{story.dek}</p>
      {/if}

      <p class="byline">
        <strong>{story.author}</strong>
        {#if story.location}<span class="sep">/</span><span>{story.location}</span>{/if}
        <span class="sep">/</span>
        <time datetime={story.dateISO}>{story.dateLabel}</time>
        <span class="sep">/</span>
        <span>{formatNumber(timeValue, lang)} {isVideo ? L.watchTime : L.minRead}</span>
      </p>
    </div>
  </a>
</article>

<style>
  .card {
    position: relative;
  }

  /* cards settle into place as they scroll in. Scroll-driven, so no JS and
     nothing to observe; browsers without view timelines just show them. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .card {
        animation: card-in linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 55%;
      }
    }
  }
  @keyframes card-in {
    from {
      opacity: 0;
      translate: 0 14px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .art img,
    .art :global(.halftone) {
      transition: none;
    }
  }
  .hit {
    display: block;
  }
  .spine {
    display: none;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .art {
    position: relative;
    margin-bottom: 1.1rem;
    overflow: hidden;
  }
  .art img,
  .art :global(.halftone) {
    transition: transform 0.9s var(--ease);
  }
  a:hover .art img,
  a:hover .art :global(.halftone) {
    transform: scale(1.035);
  }
  .art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: var(--paper-3);
  }
  .play {
    position: absolute;
    left: 0.6rem;
    top: 0.6rem;
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: var(--ember);
    color: var(--navy);
    padding-left: 2px;
    transition: transform 0.22s var(--ease);
  }
  a:hover .play {
    transform: scale(1.1);
  }
  .credit {
    position: absolute;
    right: 0;
    bottom: 0;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.04em;
    color: var(--paper);
    background: rgba(17, 17, 17, 0.72);
    padding: 0.2rem 0.4rem;
  }
  .kind {
    position: absolute;
    left: 0;
    bottom: 0;
    background: var(--ink);
    color: var(--paper);
    padding: 0.42rem 0.7rem 0.38rem;
  }

  .section {
    color: var(--electric);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .section.quiet {
    color: var(--mist);
  }
  .vmark {
    color: var(--ember);
    flex-shrink: 0;
  }
  .index {
    color: var(--ember);
  }

  .title {
    font-size: var(--t-lg);
  }
  .dek {
    font-family: var(--font-serif);
    color: var(--slate);
    font-weight: 350;
    line-height: var(--lh-prose);
    text-wrap: pretty;
  }

  /* ---- lead ----
     Deliberately smaller than --t-mega: the hero column is ~640px, and the
     full mega scale pushes the dek and byline below the fold. */
  .lead .title {
    font-size: clamp(2.375rem, 4.6vw, 4rem);
    font-stretch: 104%;
    letter-spacing: var(--track-display);
    line-height: var(--lh-display);
  }
  .lead .dek {
    font-size: clamp(1.125rem, 1.65vw, 1.5rem);
    max-width: 44ch;
  }
  .lead .text {
    gap: 0.9rem;
  }

  /* ---- feature ---- */
  .feature .title {
    font-size: var(--t-xl);
  }
  .feature .dek {
    font-size: var(--t-md);
    max-width: 46ch;
  }

  /* ---- standard ---- */
  .standard .title {
    font-size: var(--t-lg);
  }
  .standard .dek {
    font-size: var(--t-sm);
    max-width: 40ch;
  }

  /* ---- compact: no art, rule above ---- */
  .compact {
    padding-top: 0.95rem;
    border-top: 1px solid var(--rule);
  }
  .compact .title {
    font-size: var(--t-md);
    line-height: var(--lh-display-sm);
    letter-spacing: var(--track-display);
  }
  .compact .dek {
    font-size: var(--t-xs);
    max-width: 42ch;
  }
  .compact .text {
    gap: 0.5rem;
  }

  /* ---- list: the Just in rail ---- */
  .list {
    padding-block: 0.85rem;
    border-top: 1px solid var(--rule);
  }
  .list .title {
    font-size: 1.0625rem;
    line-height: var(--lh-display-sm);
    font-weight: 700;
    font-stretch: 104%;
    letter-spacing: var(--track-display);
  }
  .list .text {
    gap: 0.42rem;
  }
  .list .byline {
    font-size: 0.6875rem;
  }
  @media (max-width: 860px) {
    .list .byline {
      font-size: 0.75rem;
    }

    /* Compact rows on small screens.

       Shrinking the artwork to a thumbnail is the usual move, but it only
       works for photographs — a photo still reads at 100px. This artwork is
       generated abstraction, so at thumbnail size it becomes texture that
       costs 236px of a 393px screen and tells the reader nothing. So the
       full art is dropped for secondary stories and survives as a spine. */
    /* With a photo: thumbnail beside the text, because a photograph still
       reads at 104px. Without one: the 14px spine, because generated
       abstraction does not. Same compaction either way. */
    .standard .hit,
    .feature .hit {
      display: grid;
      grid-template-columns: 14px minmax(0, 1fr);
      gap: 0.9rem;
      align-items: stretch;
    }
    .standard .art,
    .feature .art {
      display: none;
    }
    .standard .spine,
    .feature .spine {
      display: block;
      min-height: 100%;
    }

    .standard .hit:has(.art.photo),
    .feature .hit:has(.art.photo) {
      grid-template-columns: minmax(0, 1fr) 104px;
      align-items: start;
    }
    .standard .hit:has(.art.photo) .spine,
    .feature .hit:has(.art.photo) .spine {
      display: none;
    }
    .standard .art.photo,
    .feature .art.photo {
      display: block;
      order: 2;
      margin-bottom: 0;
    }
    .standard .art.photo img,
    .feature .art.photo img {
      aspect-ratio: 1 !important;
    }
    .standard .hit:has(.art.photo) .text,
    .feature .hit:has(.art.photo) .text {
      order: 1;
    }
    .art.photo .kind,
    .art.photo .credit {
      display: none;
    }
    .art.photo .play {
      left: auto;
      right: 0.35rem;
      top: 0.35rem;
      width: 1.75rem;
      height: 1.75rem;
    }

    .standard .title,
    .feature .title {
      font-size: 1.25rem;
    }
    .standard .dek,
    .feature .dek {
      font-size: var(--t-xs);
    }
    .standard .text,
    .feature .text {
      gap: 0.5rem;
      padding-block: 0.15rem 0.25rem;
    }
  }
</style>
