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

<section class="news" id="newsletter" aria-labelledby="news-h">
  <div class="shell inner">
    <div class="copy">
      <span class="label kicker">{L.nlKicker}</span>
      <h2 class="h" id="news-h">{L.nlHead}</h2>
      <p class="sub">{L.nlSub}</p>

      <form class="form" onsubmit={submit} novalidate>
        <div class="field">
          <label class="label f-label" for="email">{L.nlEmail}</label>
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
        </div>
        <button class="submit label" type="submit" disabled={status === 'working'}>
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

    <div class="viz" aria-hidden="true">
      <svg viewBox="0 0 8 6" preserveAspectRatio="xMidYMid meet">
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
    </div>
  </div>
</section>

<style>
  .news {
    background: var(--navy);
    color: var(--paper);
    padding-block: clamp(3rem, 6.5vw, 6rem);
    margin-top: var(--stack-lg);
  }
  .inner {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
    gap: clamp(2rem, 5vw, 5rem);
    align-items: center;
  }

  .kicker {
    color: var(--ember);
    display: block;
    margin-bottom: 1rem;
  }
  .h {
    font-size: clamp(2rem, 5vw, 4rem);
    color: var(--paper);
    max-width: 18ch;
  }
  .sub {
    font-family: var(--font-serif);
    font-size: var(--t-md);
    line-height: var(--lh-prose);
    color: var(--peach);
    max-width: 52ch;
    margin-top: 1.1rem;
    font-weight: 350;
  }

  .form {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }
  .field {
    flex: 1 1 18rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .f-label {
    color: rgba(255, 194, 168, 0.75);
  }
  input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid rgba(255, 194, 168, 0.5);
    color: var(--paper);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.25rem;
    padding: 0.5rem 0 0.6rem;
    outline: none;
    transition: border-color 0.2s;
  }
  input::placeholder {
    color: rgba(255, 194, 168, 0.45);
  }
  input:focus {
    border-bottom-color: var(--ember);
  }
  input[aria-invalid='true'] {
    border-bottom-color: #ff6b5e;
  }

  .submit {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    background: var(--ember);
    color: var(--navy);
    padding: 0.95rem 1.65rem 0.85rem;
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
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    color: rgba(255, 194, 168, 0.65);
    margin-top: 1rem;
  }
  .msg.err {
    color: #ff9c92;
  }
  .msg.ok {
    color: var(--ember);
  }

  /* ---- lattice ---- */
  .viz svg {
    width: 100%;
    height: auto;
  }
  .viz rect {
    animation: breathe 4.2s ease-in-out infinite;
    animation-delay: var(--d);
    transform-origin: center;
  }
  .viz .e {
    fill: var(--ember);
  }
  .viz .p {
    fill: var(--peach);
  }
  .viz .b {
    fill: #0b5ce8;
  }
  @keyframes breathe {
    0%,
    100% {
      opacity: 0.28;
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
      opacity: 0.75;
    }
  }

  @media (max-width: 900px) {
    .inner {
      grid-template-columns: 1fr;
    }
    .viz {
      order: -1;
      max-width: 15rem;
    }
  }
</style>
