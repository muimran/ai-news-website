<script>
  /* A YouTube video, 16:9. Until the reader asks it's only a still and a
     play button; then the player loads in its place, from youtube-nocookie,
     so nothing of YouTube's runs before that. Used by the front page's video
     card and by a video story's page. */
  let { id, title, label, still = null } = $props();
  let playing = $state(false);
</script>

<div class="screen">
  {#if playing}
    <iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1&rel=0" {title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
  {:else}
    <button type="button" class="play" onclick={() => (playing = true)} aria-label="{label}: {title}">
      <img src={still ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span class="btn" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" /></svg>{label}</span>
    </button>
  {/if}
</div>

<style>
  .screen {
    position: relative;
    aspect-ratio: 16 / 9;
    border-bottom: 1px solid var(--ink);
    background: var(--ink);
  }
  iframe,
  .play,
  .play img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .play {
    padding: 0;
    background: none;
    cursor: pointer;
  }
  .play img {
    object-fit: cover;
    filter: grayscale(1) contrast(1.05);
  }
  /* the play button: in the middle of the still, where a reader looks for
     it; paper with one ink rule, the bar's own kind of box, so it shows on
     any picture */
  .btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    height: 2.5rem;
    padding: 0 0.95rem;
    border: 1px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    font-family: var(--mono);
    font-size: var(--ms);
    font-weight: 500;
    letter-spacing: var(--mt);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .btn svg {
    width: 0.85rem;
    height: 0.85rem;
    fill: currentColor;
  }
  @media (hover: hover) {
    .play:hover .btn {
      box-shadow: 4px 4px 0 var(--ink);
    }
  }
  .play:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
</style>
