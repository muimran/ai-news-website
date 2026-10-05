<script>
  /* A demo special: one data centre's day, hour by hour. Drag the hour and
     its power draw and the water its cooling evaporates follow, with a note
     for each part of the day. The figures are illustrative, made to show
     how a special works, not reporting. */
  let { story, lang } = $props();

  // illustrative hourly figures: power in megawatts, water in cubic metres an hour
  const POWER = [38, 37, 36, 36, 36, 37, 39, 42, 45, 47, 49, 50, 51, 52, 52, 53, 52, 50, 48, 46, 44, 42, 40, 39];
  const WATER = [42, 40, 38, 37, 37, 40, 48, 60, 74, 88, 100, 110, 116, 120, 122, 121, 112, 98, 82, 68, 58, 52, 47, 44];
  const HOMES_PER_MW = 1400;

  const T = {
    en: {
      kicker: 'Special',
      drag: 'Drag through the day',
      power: 'Power',
      water: 'Water evaporated',
      homes: (n) => `as much as ${n} homes`,
      perHour: 'an hour',
      demo: 'Demo special: the figures are illustrative, made to show how a special page works.',
      notes: [
        [0, 6, 'Night. The air is coolest, so the chillers rest and the towers barely steam. This is when the facility is cheapest to run.'],
        [6, 11, 'Morning. Offices log on, requests climb, and the cooling has to keep pace with the sun on the roof.'],
        [11, 17, 'Afternoon peak. The building draws as much power as a small town and evaporates the most water, just as the grid and the river are under the most strain.'],
        [17, 24, 'Evening. Demand eases with the heat; the towers keep running into the night to bring the halls back down.']
      ]
    },
    bn: {
      kicker: 'বিশেষ',
      drag: 'দিনের ঘণ্টাগুলো টেনে দেখুন',
      power: 'বিদ্যুৎ',
      water: 'বাষ্প হয়ে যাওয়া পানি',
      homes: (n) => `${n}টি বাড়ির সমান`,
      perHour: 'ঘণ্টায়',
      demo: 'নমুনা বিশেষ প্রতিবেদন: সংখ্যাগুলো উদাহরণমাত্র।',
      notes: [
        [0, 6, 'রাত। বাতাস সবচেয়ে ঠান্ডা, তাই শীতলীকরণ যন্ত্র প্রায় বিশ্রামে।'],
        [6, 11, 'সকাল। অফিস খোলে, চাহিদা বাড়ে, ছাদে রোদও বাড়ে।'],
        [11, 17, 'দুপুরের চূড়া। সবচেয়ে বেশি বিদ্যুৎ ও পানি লাগে, ঠিক যখন গ্রিড আর নদী সবচেয়ে চাপে।'],
        [17, 24, 'সন্ধ্যা। গরম কমে, চাহিদাও কমে; তবু রাত পর্যন্ত শীতলীকরণ চলে।']
      ]
    }
  };
  const t = $derived(T[lang] ?? T.en);
  // Bangla digits in the Bangla edition
  const num = (n) => (lang === 'bn' ? String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]) : String(n));

  let hour = $state(15);
  const clock = $derived(num(`${String(hour).padStart(2, '0')}:00`));
  const note = $derived(t.notes.find(([from, to]) => hour >= from && hour < to)[2]);

  // the two curves, drawn into one 24-hour strip each
  const W = 480;
  const H = 90;
  const x = (h) => (h / 23) * W;
  function area(values) {
    const lo = Math.min(...values) * 0.9;
    const hi = Math.max(...values);
    const y = (v) => H - ((v - lo) / (hi - lo)) * (H - 8);
    const line = values.map((v, h) => `${h ? 'L' : 'M'}${x(h).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    return { line, fill: `${line} L${W} ${H} L0 ${H}Z`, y };
  }
  const P = area(POWER);
  const Wa = area(WATER);
</script>

<article class="special" {lang}>
  <header class="hero">
    <p class="kicker">{t.kicker}</p>
    <h1>{story.title}</h1>
    <p class="dek">{story.dek}</p>
    <p class="by">{story.author}</p>
  </header>

  <section class="day">
    <label class="drag">
      <span>{t.drag}</span>
      <input type="range" min="0" max="23" step="1" bind:value={hour} />
    </label>

    <p class="clock">{clock}</p>

    <div class="figures">
      <div class="fig">
        <p class="what">{t.power}</p>
        <p class="big">{num(POWER[hour])} <small>MW</small></p>
        <p class="aside">{t.homes(num((POWER[hour] * HOMES_PER_MW).toLocaleString('en')))}</p>
        <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
          <path d={P.fill} class="area i" />
          <path d={P.line} class="line i" />
          <line x1={x(hour)} x2={x(hour)} y1="0" y2={H} class="now" />
          <circle cx={x(hour)} cy={P.y(POWER[hour])} r="5" class="dot i" />
        </svg>
      </div>
      <div class="fig">
        <p class="what">{t.water}</p>
        <p class="big">{num(WATER[hour])} <small>m³</small></p>
        <p class="aside">{t.perHour}</p>
        <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
          <path d={Wa.fill} class="area o" />
          <path d={Wa.line} class="line o" />
          <line x1={x(hour)} x2={x(hour)} y1="0" y2={H} class="now" />
          <circle cx={x(hour)} cy={Wa.y(WATER[hour])} r="5" class="dot o" />
        </svg>
      </div>
    </div>

    <p class="note" aria-live="polite">{note}</p>
  </section>

  <p class="demo">{t.demo}</p>
</article>

<style>
  .special {
    min-height: 100%;
    background: var(--i3);
    color: var(--ink);
  }
  /* the header lies over the top on arrival: room for it */
  .hero {
    max-width: 52rem;
    margin: 0 auto;
    padding: 7rem var(--in) calc(3 * var(--in));
  }
  .kicker {
    margin: 0 0 1rem;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--o-text);
  }
  h1 {
    margin: 0 0 1.25rem;
    font-size: clamp(2.6rem, 1rem + 5vw, 6rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 0.92;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }
  .special:lang(bn) h1 {
    line-height: 1.2;
  }
  .dek {
    max-width: 34em;
    margin: 0 0 1rem;
    font-family: var(--read);
    font-size: 1.25rem;
    line-height: 1.5;
  }
  .by {
    margin: 0;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .day {
    max-width: 52rem;
    margin: 0 auto;
    padding: calc(2 * var(--in)) var(--in);
    border-top: var(--line) solid var(--rule);
  }
  .drag {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font: 500 calc(0.6875rem * var(--k)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--o);
  }
  .clock {
    margin: 1.5rem 0 1rem;
    font-size: clamp(3rem, 2rem + 4vw, 5rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .figures {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--in);
  }
  .fig {
    padding: var(--in);
    background: var(--paper);
  }
  .what,
  .aside {
    margin: 0;
    font: 500 calc(0.6875rem * var(--k)) / 1.4 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .big {
    margin: 0.5rem 0 0.25rem;
    font-size: clamp(2.2rem, 1.5rem + 2.5vw, 3.5rem);
    font-weight: 640;
    font-stretch: 75%;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .big small {
    font-size: 0.45em;
    font-weight: 500;
  }
  svg {
    display: block;
    width: 100%;
    height: 5.5rem;
    margin-top: var(--in);
    overflow: visible;
  }
  .area.i {
    fill: color-mix(in srgb, var(--i) 22%, transparent);
  }
  .area.o {
    fill: color-mix(in srgb, var(--o) 22%, transparent);
  }
  .line {
    fill: none;
    stroke-width: 2.5;
    vector-effect: non-scaling-stroke;
  }
  .line.i,
  .dot.i {
    stroke: var(--i);
    fill: var(--i);
  }
  .line.o,
  .dot.o {
    stroke: var(--o);
    fill: var(--o);
  }
  .line.i,
  .line.o {
    fill: none;
  }
  .now {
    stroke: var(--ink);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    vector-effect: non-scaling-stroke;
  }
  .note {
    max-width: 34em;
    min-height: 4.5em;
    margin: calc(2 * var(--in)) 0 0;
    font-family: var(--read);
    font-size: 1.25rem;
    line-height: 1.5;
  }
  .demo {
    max-width: 52rem;
    margin: 0 auto;
    padding: var(--in) var(--in) calc(3 * var(--in));
    font: 500 calc(0.6875rem * var(--k)) / 1.5 var(--mono);
    color: var(--mute);
  }
  @media (max-width: 759px) {
    .hero {
      padding-top: 5rem;
    }
    .figures {
      grid-template-columns: minmax(0, 1fr);
    }
    .dek,
    .note {
      font-size: 1.1rem;
    }
  }
</style>
