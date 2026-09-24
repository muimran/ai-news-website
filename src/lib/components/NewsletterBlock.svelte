<script>
  import { t } from '../i18n.js';

  let { lang = 'en' } = $props();
  const L = $derived(t(lang));

  let email = $state('');
  let status = $state('idle'); // idle | working | done | error
  let message = $state('');

  const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  async function submit(e) {
    e.preventDefault();
    if (status === 'working') return;

    if (!valid(email)) {
      status = 'error';
      message = L.nlBad;
      return;
    }

    status = 'working';
    message = '';
    try {
      // No backend yet — swap this for your list provider's endpoint.
      await new Promise((r) => setTimeout(r, 900));
      status = 'done';
      message = L.nlOk;
      email = '';
    } catch {
      status = 'error';
      message = L.nlFail;
    }
  }

  /* 8x6 lattice that breathes in a diagonal wave */
  const cells = Array.from({ length: 48 }, (_, i) => ({
    x: i % 8,
    y: Math.floor(i / 8),
    delay: ((i % 8) + Math.floor(i / 8)) * 0.16
  }));
</script>

<!-- One slim row inside the page margins. It used to be a full-bleed navy
     panel with the lattice filling half of it; the lattice survives as a
     small mark beside the kicker. -->
<section class="news" id="newsletter" aria-labelledby="news-h">
  <div class="shell">
    <div class="inner">
      <div class="copy">
        <div class="kick-row">
          <svg class="viz" viewBox="0 0 8 6" aria-hidden="true">
            {#each cells as c}
              <rect
                x={c.x + 0.16}
                y={c.y + 0.16}
                width="0.68"
                height="0.68"
                style="--d:{c.delay}s"
                class={(c.x + c.y) % 3 === 0 ? 'e' : (c.x * c.y) % 4 === 0 ? 'p' : 'b'}
              />
            {/each}
          </svg>
          <span class="label kicker">{L.nlKicker}</span>
        </div>
        <h2 class="h" id="news-h">{L.nlHead}</h2>
        <p class="sub">{L.nlSub}</p>
      </div>

      <div class="act">
        <form class="form" onsubmit={submit} novalidate>
          <label class="sr-only" for="email">{L.nlEmail}</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="you@example.com"
            autocomplete="email"
            aria-invalid={status === 'error'}
            aria-describedby="news-msg"
            oninput={() => { if (status === 'error') { status = 'idle'; message = ''; } }}
          />
          <button class="submit" type="submit" disabled={status === 'working'}>
            {status === 'working' ? L.nlWorking : status === 'done' ? L.nlDone : L.nlSignUp}
          </button>
        </form>

        <p
          class="msg"
          id="news-msg"
          class:err={status === 'error'}
          class:ok={status === 'done'}
          role="status"
          aria-live="polite"
        >
          {message || L.nlRest}
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .news {
    margin-top: var(--stack-lg);
  }
  .inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: end;
    border-top: 3px solid var(--ink);
    padding-top: clamp(1.25rem, 2vw, 1.75rem);
  }

  .kick-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .kicker {
    color: var(--head-hover);
  }
  .h {
    font-size: clamp(1.5rem, 2.4vw, 2.125rem);
    max-width: 22ch;
  }
  .sub {
    font-family: var(--font-serif);
    font-size: var(--t-sm);
    line-height: var(--lh-prose);
    color: var(--slate);
    max-width: 52ch;
    margin-top: 0.6rem;
  }

  .form {
    display: flex;
    align-items: stretch;
    gap: 0.6rem;
  }
  input {
    flex: 1 1 auto;
    min-width: 0;
    min-height: var(--tap);
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--rule-strong);
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 1.0625rem;
    padding: 0.4rem 0;
    outline: none;
    transition: border-color 0.2s;
  }
  input::placeholder {
    color: var(--mist);
  }
  input:focus {
    border-bottom-color: var(--ember);
  }
  input[aria-invalid='true'] {
    border-bottom-color: #d93a2b;
  }

  .submit {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    background: var(--ember);
    color: var(--navy);
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 600;
    padding: 0 1.35rem;
    transition: background 0.2s, transform 0.15s;
    white-space: nowrap;
  }
  .submit:hover:not(:disabled) {
    background: var(--peach);
  }
  .submit:active:not(:disabled) {
    transform: translateY(1px);
  }
  .submit:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  .msg {
    font-size: 0.8125rem;
    color: var(--mist);
    margin-top: 0.6rem;
  }
  .msg.err {
    color: #d93a2b;
  }
  .msg.ok {
    color: var(--head-hover);
  }

  /* ---- lattice, now a small mark ---- */
  .viz {
    width: 2.75rem;
    height: auto;
    flex-shrink: 0;
  }
  .viz rect {
    animation: breathe 4.2s ease-in-out infinite;
    animation-delay: var(--d);
    transform-origin: center;
    transform-box: fill-box;
  }
  .viz .e {
    fill: var(--ember);
  }
  .viz .p {
    fill: var(--peach);
  }
  .viz .b {
    fill: var(--electric);
  }
  @keyframes breathe {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.72);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .viz rect {
      animation: none;
      opacity: 0.8;
    }
  }

  @media (max-width: 900px) {
    .inner {
      grid-template-columns: 1fr;
      align-items: start;
    }
  }
</style>
