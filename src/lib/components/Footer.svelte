<script>
  /* A footer is wayfinding of last resort, not a sitemap. The earlier version
     carried 22 links in three columns, nine of which duplicated the section
     nav. What people actually look for down here is who published this, how to
     reach them, and the policy boilerplate — so that is all this keeps. */

  import Wordmark from './Wordmark.svelte';
  import SignalBar from './SignalBar.svelte';
  import { formatNumber, homeUrl } from '../content.js';
  import { t } from '../i18n.js';
  import {
    siFacebook,
    siWhatsapp,
    siYoutube,
    siBluesky,
    siRss,
    siSignal
  } from 'simple-icons';

  let { lang = 'en' } = $props();
  const L = $derived(t(lang));
  const home = $derived(homeUrl(lang));
  const year = $derived(formatNumber(new Date().getFullYear(), lang).replace(/,/g, ''));

  const LINKS = $derived(
    lang === 'bn'
      ? [
          ['আমাদের কথা', `${home}#about`],
          ['যোগাযোগ', `${home}#about`],
          ['এআই নীতি', `${home}#about`],
          ['নিউজলেটার', `${home}#newsletter`],
          ['গোপনীয়তা', `${home}#about`],
          ['শর্তাবলি', `${home}#about`]
        ]
      : [
          ['About', `${home}#about`],
          ['Contact', `${home}#about`],
          ['AI policy', `${home}#about`],
          ['Newsletter', `${home}#newsletter`],
          ['Privacy', `${home}#about`],
          ['Terms', `${home}#about`]
        ]
  );

  /* Official marks from simple-icons, so the paths are accurate and stay
     maintained rather than being approximated by hand.

     The list is weighted for the audience: Facebook and WhatsApp carry far
     more news traffic in Bangladesh than Mastodon or LinkedIn do. Change the
     array to change the row — nothing else needs touching.

     LinkedIn is deliberately absent: it asked to be removed from simple-icons,
     so if you want it, take the SVG from LinkedIn's own brand-assets page. */
  const SOCIAL = [
    { icon: siFacebook, href: '#about' },
    { icon: siWhatsapp, href: '#about' },
    { icon: siYoutube, href: '#about' },
    { icon: siBluesky, href: '#about' },
    { icon: siRss, href: '#about' },
    { icon: siSignal, href: '#about' }
  ];
</script>

<footer class="foot" id="about">
  <div class="shell">
    <SignalBar seed="ground-truth-footer" height={6} />

    <div class="mark">
      <Wordmark size="lg" inverted />
      <p class="tag">{L.tagline}</p>
    </div>

    <nav class="social" aria-label={L.ftFollow}>
      {#each SOCIAL as s}
        <a href={s.href} aria-label={s.icon.title} title={s.icon.title}>
          <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <path d={s.icon.path} fill="currentColor" />
          </svg>
        </a>
      {/each}
    </nav>

    <nav class="links" aria-label={L.ftNewsroom}>
      {#each LINKS as [label, href]}
        <a {href} class="label">{label}</a>
      {/each}
    </nav>

    <p class="rights label">{L.ftRights.replace('{year}', year)}</p>
  </div>
</footer>

<style>
  .foot {
    background: var(--ink);
    color: var(--paper);
    padding-block: clamp(2rem, 4vw, 3rem) clamp(2rem, 3.5vw, 2.75rem);
    margin-top: var(--stack-lg);
    text-align: center;
  }

  .mark {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-block: clamp(1.75rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.25rem);
  }
  .mark :global(.wordmark) {
    max-width: 100%;
  }
  .tag {
    font-family: var(--font-serif);
    font-size: 1.0625rem;
    color: var(--peach);
    line-height: var(--lh-prose);
  }

  /* one inline row each, wrapping on narrow screens rather than stacking into
     columns — columns are what made the old footer read as a sitemap */
  .social,
  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem clamp(1rem, 2.5vw, 2rem);
  }

  .social {
    gap: 0.25rem clamp(0.5rem, 1.5vw, 1rem);
    padding-bottom: clamp(1rem, 2vw, 1.5rem);
  }
  .social a {
    display: grid;
    place-items: center;
    width: var(--tap);
    height: var(--tap);
    color: var(--ember);
    transition: color 0.16s, transform 0.16s var(--ease);
  }
  .social a:hover {
    color: var(--paper);
    transform: translateY(-2px);
  }

  .links {
    padding-block: clamp(1rem, 2vw, 1.5rem);
    border-top: 1px solid rgba(247, 247, 242, 0.18);
  }
  .links a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    color: rgba(247, 247, 242, 0.75);
    transition: color 0.16s;
  }
  .links a:hover {
    color: var(--paper);
  }

  .rights {
    color: rgba(247, 247, 242, 0.42);
    padding-top: clamp(0.75rem, 1.5vw, 1.25rem);
    border-top: 1px solid rgba(247, 247, 242, 0.18);
  }
</style>
