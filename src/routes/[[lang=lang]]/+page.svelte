<script>
  import Hero from '$lib/components/Hero.svelte';
  import TopicSection from '$lib/components/TopicSection.svelte';
  import SignalBoard from '$lib/components/SignalBoard.svelte';
  import NewsletterBlock from '$lib/components/NewsletterBlock.svelte';
  import { featured, secondary, justIn, sectionFeed, liveSections } from '$lib/content.js';
  import { t } from '$lib/i18n.js';

  let { data } = $props();
  const lang = $derived(data.lang);
  const L = $derived(t(lang));

  /* Layout patterns alternate deliberately so the page keeps a rhythm instead
     of repeating one card grid nine times. Keyed by section so each desk gets
     the same treatment for the same beat. */
  const PATTERN = {
    'The AI Race': 'a',
    'AI & Everyday Life': 'b',
    'Work After Automation': 'a',
    'Machines and Power': 'a',
    'AI in the Global South': 'c',
    'The Human Dataset': 'b',
    'Climate, Chips & Infrastructure': 'a',
    'Culture, Media & Synthetic Reality': 'c',
    'Open Source and the Commons': 'b'
  };

  /* Only sections this desk actually has stories in — the Bangla desk covers
     fewer beats, and an empty section heading reads as a broken page. */
  const live = $derived(liveSections(lang));
</script>

<svelte:head>
  <title
    >{lang === 'bn'
      ? 'গ্রাউন্ড ট্রুথ — এআই যেখানেই পৌঁছায়'
      : 'Ground Truth — AI, reported from wherever it lands'}</title
  >
  <meta name="description" content={L.tagline} />
  <link rel="alternate" hreflang="en" href="https://groundtruth.example/" />
  <link rel="alternate" hreflang="bn" href="https://groundtruth.example/bn" />
  <link rel="alternate" hreflang="x-default" href="https://groundtruth.example/" />
</svelte:head>

<Hero lead={featured(lang)} secondary={secondary(lang)} justIn={justIn(lang)} {lang} />

{#each live.slice(0, 3) as name}
  <TopicSection
    title={name}
    pattern={PATTERN[name] || 'a'}
    blurb={L.sectionBlurbs[name] || ''}
    stories={sectionFeed(name, lang)}
    {lang}
  />
{/each}

<SignalBoard {lang} />

{#each live.slice(3, 6) as name}
  <TopicSection
    title={name}
    pattern={PATTERN[name] || 'a'}
    blurb={L.sectionBlurbs[name] || ''}
    stories={sectionFeed(name, lang)}
    {lang}
  />
{/each}

<NewsletterBlock {lang} />

{#each live.slice(6) as name}
  <TopicSection
    title={name}
    pattern={PATTERN[name] || 'a'}
    blurb={L.sectionBlurbs[name] || ''}
    stories={sectionFeed(name, lang)}
    {lang}
  />
{/each}
