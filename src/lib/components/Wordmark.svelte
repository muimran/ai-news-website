<script>
  /* The mark carries a mono superscript `y_true` — in machine learning that is
     the variable name for ground truth: the verified, human-checked data a model
     is measured against. Same phrase, same job, in journalism. */

  let { size = 'md', mark = true, inverted = false } = $props();
</script>

<span class="wordmark {size}" class:inverted>
  <span class="word">Ground</span><span class="word second">Truth</span>{#if mark}<span
      class="ytrue"
      aria-hidden="true">y_true</span
    >{/if}
</span>

<style>
  .wordmark {
    display: inline-flex;
    align-items: flex-start;
    font-family: var(--font-display);
    font-weight: 900;
    font-stretch: 112%;
    letter-spacing: -0.035em;
    line-height: 0.84;
    color: var(--ink);
    white-space: nowrap;
  }
  .word {
    display: inline-block;
  }
  .second {
    color: var(--electric);
    margin-left: 0.24em;
  }
  .ytrue {
    font-family: var(--font-mono);
    font-weight: 400;
    /* floor it: 0.26em of the compact 18px wordmark is 4.7px, which is
       unreadable. The large footer mark still scales proportionally. */
    font-size: max(0.26em, 10px);
    letter-spacing: 0.06em;
    color: var(--ember);
    margin-left: 0.34em;
    transform: translateY(0.12em);
    text-transform: lowercase;
  }

  .sm {
    font-size: 1.125rem;
  }
  .md {
    font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  }
  .lg {
    font-size: clamp(2.75rem, 9vw, 7.5rem);
  }

  .inverted {
    color: var(--paper);
  }
  .inverted .second {
    color: var(--peach);
  }
  .inverted .ytrue {
    color: var(--ember);
  }
</style>
