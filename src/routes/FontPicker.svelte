<script>
  /* A trial: three small menus that set the headline face, the reading
     face and the two colours, remembered in this browser. Shown on the local copy, and on the
     live site only to someone who opens it with ?fonts (?nofonts hides
     them again); readers never see them. Fonts load only when picked. */
  const HEAD = {
    now: { label: 'Instrument Sans (now)' },
    archivo: { label: 'Archivo', css: 'Archivo:wdth,wght@62..125,400..800' },
    newsreader: { label: 'Newsreader (serif)', css: 'Newsreader:opsz,wght@6..72,400..800' },
    bricolage: { label: 'Bricolage Grotesque', css: 'Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800' },
    schibsted: { label: 'Schibsted Grotesk', css: 'Schibsted+Grotesk:wght@400..900' },
    fraunces: { label: 'Fraunces (serif)', css: 'Fraunces:opsz,wght@9..144,400..800' }
  };
  const BODY = {
    now: { label: 'Georgia (now)' },
    literata: { label: 'Literata', css: 'Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400' },
    sourceserif: { label: 'Source Serif 4', css: 'Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400' },
    newsreader: { label: 'Newsreader', css: 'Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400' },
    lora: { label: 'Lora', css: 'Lora:ital,wght@0,400..700;1,400' },
    plex: { label: 'IBM Plex Sans (sans)', css: 'IBM+Plex+Sans:ital,wght@0,400..700;1,400' }
  };
  /* the two colours at three strengths each, plus the warm one dark enough
     for small text; picking one also swaps every illustration for its
     version in those colours and re-reads each card's colour from it */
  const PAL = {
    now: { label: 'Ember + indigo (now)' },
    B: { label: 'Signal red + cobalt', c: ['#d9412b', '#ec9a86', '#f7d9d1', '#b0301c', '#2f55c9', '#8fa6e6', '#d9e1f7'] },
    C: { label: 'Brick + navy', c: ['#b9472f', '#dc9a84', '#f2dcd2', '#943620', '#23396e', '#7d8fbd', '#d5dcec'] },
    D: { label: 'Tomato + petrol blue', c: ['#ef5b3f', '#f6a690', '#fde0d7', '#b83a20', '#1f6f8b', '#86b6c6', '#d4e8ee'] },
    E: { label: 'Crimson + sky blue', c: ['#c8273e', '#e88a97', '#f7d6db', '#a11d31', '#3d8bd9', '#9cc6ee', '#dcebfa'] },
    F: { label: 'Ochre + ink blue', c: ['#d49a1f', '#e8c26e', '#f6e7c4', '#8a5f05', '#1f2f4a', '#6f7f99', '#d6dbe4'] },
    G: { label: 'Persimmon + slate', c: ['#e5603a', '#f0a38a', '#fadcd1', '#b03f1f', '#4a5a6b', '#93a1ae', '#dde3e8'] },
    H: { label: 'Coral + deep plum', c: ['#f07a6a', '#f6b2a8', '#fde3df', '#b8412f', '#4a2346', '#9b7598', '#e7dbe6'] },
    // black and one colour
    I: { label: 'Black + blue', c: ['#2a52d6', '#93a8ec', '#dde4fa', '#2343b5', '#17181c', '#8b8e96', '#dfe1e5'] },
    J: { label: 'Black + red', c: ['#e0301e', '#f09a8f', '#fadcd8', '#b5220f', '#17181c', '#8b8e96', '#dfe1e5'] },
    K: { label: 'Black + green', c: ['#0a8a5c', '#86c9ae', '#d6eee4', '#06704a', '#17181c', '#8b8e96', '#dfe1e5'] },
    // black and blue, every picture on one field whatever its topic
    L: { label: 'Black + blue: black pictures', c: ['#2a52d6', '#93a8ec', '#dde4fa', '#2343b5', '#17181c', '#8b8e96', '#dfe1e5'] },
    M: { label: 'Black + blue: blue pictures', c: ['#2a52d6', '#93a8ec', '#dde4fa', '#2343b5', '#17181c', '#8b8e96', '#dfe1e5'] },
    // three colours: the lightest becomes the page (the eighth value)
    N: { label: 'Beige + royal blue + burgundy', c: ['#7d1d2f', '#b86a77', '#ecd3d6', '#7d1d2f', '#2a4bb3', '#8296d6', '#dce2f4', '#efe7d8'] },
    O: { label: 'Vanilla + purple blue + lime', c: ['#a6d22f', '#cde58a', '#ecf5cf', '#4f7a0e', '#5a4fcf', '#a39de6', '#e3e0f7', '#f5eed6'] },
    P: { label: 'Pastel purple + moss + rose', c: ['#e0607e', '#f0a3b4', '#fadbe2', '#b23a58', '#5d6b2f', '#a3ad7c', '#e1e5d2', '#efe9f5'] }
  };
  const TOKENS = ['--o', '--o2', '--o3', '--o-text', '--i', '--i2', '--i3'];

  // the same reading as the build's (src/lib/server/tone.js): the fullest
  // colour bin of the picture's upper half, then ink or white, eased to 4.5:1
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const INK = [0x26, 0x28, 0x2f];
  const WHITE = [255, 255, 255];
  const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  function toneOf(img) {
    const w = 80;
    const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
    const cv = Object.assign(document.createElement('canvas'), { width: w, height: h });
    const cx = cv.getContext('2d');
    cx.drawImage(img, 0, 0, w, h);
    const data = cx.getImageData(0, 0, w, Math.ceil(h / 2)).data;
    const bins = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const key = ((data[i] >> 5) << 6) | ((data[i + 1] >> 5) << 3) | (data[i + 2] >> 5);
      const bin = bins.get(key) ?? [0, 0, 0, 0];
      bin[0] += data[i];
      bin[1] += data[i + 1];
      bin[2] += data[i + 2];
      bin[3]++;
      bins.set(key, bin);
    }
    const [r, g, b, n] = [...bins.values()].sort((x, y) => y[3] - x[3])[0];
    let rgb = [r / n, g / n, b / n];
    const ink = contrast(rgb, INK) >= contrast(rgb, WHITE);
    const fg = ink ? INK : WHITE;
    for (let k = 0; k < 20 && contrast(rgb, fg) < 4.5; k++) rgb = rgb.map((v) => v + ((ink ? 255 : 0) - v) * 0.06);
    return { bg: hex(rgb), fg: hex(fg) };
  }

  const STORY = /\/uploads\/stories\/(?:trial\/[A-Z]\/)?([^/]+)-(?:240|800|1600)\.jpg/;
  function paint(pal) {
    for (const img of document.querySelectorAll('img')) {
      const src = img.dataset.orig ?? img.getAttribute('src') ?? '';
      if (!STORY.test(src)) continue;
      if (img.dataset.orig == null) {
        img.dataset.orig = src;
        img.dataset.origSet = img.getAttribute('srcset') ?? '';
      }
      const card = img.closest('.card');
      if (card && card.dataset.origCard == null) {
        card.dataset.origCard = card.style.getPropertyValue('--card');
        card.dataset.origOn = card.style.getPropertyValue('--on');
      }
      const want = pal === 'now' ? img.dataset.orig : img.dataset.orig.replace(STORY, (m, slug) => `/uploads/stories/trial/${pal}/${slug}-800.jpg`);
      if (img.getAttribute('src') === want && img.dataset.pal === pal) continue;
      img.dataset.pal = pal;
      if (pal === 'now') {
        img.setAttribute('src', want);
        if (img.dataset.origSet) img.setAttribute('srcset', img.dataset.origSet);
        if (card) {
          card.style.setProperty('--card', card.dataset.origCard);
          card.style.setProperty('--on', card.dataset.origOn);
        }
        continue;
      }
      img.removeAttribute('srcset');
      img.setAttribute('src', want);
      if (card) {
        const set = () => {
          const t = toneOf(img);
          card.style.setProperty('--card', t.bg);
          card.style.setProperty('--on', t.fg);
        };
        img.complete && img.naturalWidth ? set() : img.addEventListener('load', set, { once: true });
      }
    }
  }

  // the name drawn four ways, each from the world of terms and contracts
  const LOGO = {
    now: { label: 'Plain (now)' },
    stack: { label: 'Stacked' },
    caret: { label: 'Inserted (caret)' },
    bracket: { label: 'Amended [brackets]' },
    signed: { label: 'Signed (× line)' }
  };

  const get = (k, d) => {
    try {
      return localStorage.getItem(k) || d;
    } catch {
      return d;
    }
  };
  const set = (k, v) => {
    try {
      v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
    } catch {}
  };

  let on = $state(import.meta.env.DEV);
  let head = $state('now');
  let body = $state('now');
  let pal = $state('now');
  let logo = $state('now');
  let open = $state(false); // folded to a chevron at the edge until wanted
  $effect.pre(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('fonts')) set('gt-fonts', '1');
    if (q.has('nofonts')) set('gt-fonts', null);
    on = import.meta.env.DEV || get('gt-fonts', '') === '1';
    head = get('gt-head', 'now');
    body = get('gt-body', 'now');
    pal = get('gt-pal', 'now');
    open = get('gt-pick-open', '') === '1';
    logo = get('gt-logo', 'now');
  });

  function load(key, f) {
    if (f?.css && !document.getElementById(key)) {
      document.head.append(
        Object.assign(document.createElement('link'), {
          id: key,
          rel: 'stylesheet',
          href: `https://fonts.googleapis.com/css2?family=${f.css}&display=swap`
        })
      );
    }
  }
  $effect(() => {
    const root = document.documentElement;
    if (!on) {
      delete root.dataset.head;
      delete root.dataset.body;
      delete root.dataset.logo;
      return;
    }
    const p = PAL[pal] ?? PAL.now;
    TOKENS.forEach((t, k) => (p.c ? root.style.setProperty(t, p.c[k]) : root.style.removeProperty(t)));
    p.c ? root.style.setProperty('--trial-i3', p.c[6]) : root.style.removeProperty('--trial-i3');
    p.c?.[7] ? root.style.setProperty('--paper', p.c[7]) : root.style.removeProperty('--paper');
    p.c ? (root.dataset.pal = pal) : delete root.dataset.pal;
    set('gt-pal', pal);
    paint(pal);
    // pages that arrive later (moving around the site) get the same
    let queued = false;
    const watch = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => ((queued = false), paint(pal)));
    });
    watch.observe(document.body, { childList: true, subtree: true });
    load(`head-${head}`, HEAD[head]);
    load(`body-${body}`, BODY[body]);
    root.dataset.logo = logo;
    set('gt-logo', logo);
    root.dataset.head = head;
    root.dataset.body = body;
    set('gt-head', head);
    set('gt-body', body);
    return () => watch.disconnect();
  });
</script>

{#if on}
  <div class="pick" class:open>
    <button
      type="button"
      class="tab"
      aria-expanded={open}
      aria-controls="gt-pick"
      aria-label={open ? 'Hide the trial menus' : 'Show the trial menus'}
      onclick={() => ((open = !open), set('gt-pick-open', open ? '1' : null))}
      ><span aria-hidden="true">{open ? '›' : '‹'}</span></button
    >
    {#if open}<div id="gt-pick" class="menus">
    <label>
      <span>Logo</span>
      <select bind:value={logo}>
        {#each Object.entries(LOGO) as [key, f] (key)}<option value={key}>{f.label}</option>{/each}
      </select>
    </label>
    <label>
      <span>Headline</span>
      <select bind:value={head}>
        {#each Object.entries(HEAD) as [key, f] (key)}<option value={key}>{f.label}</option>{/each}
      </select>
    </label>
    <label>
      <span>Body</span>
      <select bind:value={body}>
        {#each Object.entries(BODY) as [key, f] (key)}<option value={key}>{f.label}</option>{/each}
      </select>
    </label>
    <label>
      <span>Colours</span>
      <select bind:value={pal}>
        {#each Object.entries(PAL) as [key, p] (key)}<option value={key}>{p.label}</option>{/each}
      </select>
    </label>
    </div>{/if}
  </div>
{/if}

<style>
  .pick {
    position: fixed;
    z-index: 100;
    top: 50%;
    right: 0;
    display: flex;
    align-items: flex-start;
    transform: translateY(-50%);
    color: #fff;
    font: 500 10px/1 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  /* folded, only a small chevron shows at the screen's edge */
  .tab {
    width: 18px;
    height: 36px;
    padding: 0;
    border: 0;
    background: #26282f;
    color: #fff;
    font: 600 16px/1 system-ui, sans-serif;
    cursor: pointer;
    opacity: 0.55;
  }
  .tab:hover,
  .tab:focus-visible,
  .open .tab {
    opacity: 1;
  }
  .menus {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 6px;
    background: #26282f;
    color: #fff;
    font: 500 10px/1 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  select {
    font: 13px system-ui;
    max-width: 11rem;
  }
  /* the headlines: cards, stories, page titles (English; Bangla keeps its
     own face, except under a serif, where it takes Noto Serif Bengali) */
  :global(html[data-head='archivo'] :is(.card .title, h1, .issue h2)) {
    font-family: 'Archivo', 'Noto Sans Bengali', sans-serif;
    font-stretch: 72%;
    font-weight: 680;
    letter-spacing: -0.01em;
  }
  :global(html[data-head='newsreader'] :is(.card .title, h1, .issue h2)) {
    font-family: 'Newsreader', 'Noto Serif Bengali', serif;
    font-stretch: 100%;
    font-weight: 560;
    letter-spacing: -0.015em;
    line-height: 1.02;
  }
  :global(html[data-head='bricolage'] :is(.card .title, h1, .issue h2)) {
    font-family: 'Bricolage Grotesque', 'Noto Sans Bengali', sans-serif;
    font-stretch: 78%;
    font-weight: 650;
    letter-spacing: -0.02em;
  }
  :global(html[data-head='schibsted'] :is(.card .title, h1, .issue h2)) {
    font-family: 'Schibsted Grotesk', 'Noto Sans Bengali', sans-serif;
    font-stretch: 100%;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.02;
  }
  :global(html[data-head='fraunces'] :is(.card .title, h1, .issue h2)) {
    font-family: 'Fraunces', 'Noto Serif Bengali', serif;
    font-stretch: 100%;
    font-weight: 600;
    letter-spacing: -0.015em;
    line-height: 1.02;
  }
  /* the logo, four ways. 1 stacked: NEW over TERMS, set to one width,
     parted by an accent rule, like a stamp */
  :global(html[data-logo='stack'] .name .logo) {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    font-size: 0.84em;
    font-weight: 800;
    line-height: 0.82;
    text-transform: uppercase;
  }
  :global(html[data-logo='stack'] .name .w1) {
    font-stretch: 100%;
    letter-spacing: 0.115em;
    padding-bottom: 0.1em;
    margin-bottom: 0.12em;
    border-bottom: 0.11em solid var(--o);
  }
  :global(html[data-logo='stack'] .name .w2) {
    font-stretch: 75%;
    letter-spacing: 0.01em;
  }
  /* 2 inserted: "new" written in above a proofreader's caret */
  :global(html[data-logo='caret'] .name .logo) {
    position: relative;
    display: inline-block;
    padding-top: 0.42em;
    padding-left: 0.12em;
    font-size: 0.92em;
  }
  :global(html[data-logo='caret'] .name .w1) {
    position: absolute;
    top: 0.02em;
    left: -0.32em;
    font-size: 0.5em;
    font-weight: 600;
    font-stretch: 100%;
    font-style: italic;
    letter-spacing: 0.02em;
    color: var(--o-text);
  }
  :global(html[data-logo='caret'] .name .w2::before) {
    content: '‸';
    position: absolute;
    left: -0.2em;
    bottom: 0.02em;
    font-size: 0.7em;
    font-weight: 700;
    color: var(--o);
  }
  /* 3 amended: [New] Terms, the brackets an amendment's */
  :global(html[data-logo='bracket'] .name .w1::before),
  :global(html[data-logo='bracket'] .name .w1::after) {
    font-weight: 300;
    color: var(--o);
  }
  :global(html[data-logo='bracket'] .name .w1::before) {
    content: '[';
    margin-right: 0.04em;
  }
  :global(html[data-logo='bracket'] .name .w1::after) {
    content: ']';
    margin-left: 0;
  }
  /* 4 signed: the name on a signature line, marked × */
  :global(html[data-logo='signed'] .name .logo) {
    position: relative;
    display: inline-block;
    padding: 0 0.1em 0.06em 0.62em;
    border-bottom: 0.06em solid currentColor;
  }
  :global(html[data-logo='signed'] .name .logo::before) {
    content: '×';
    position: absolute;
    left: 0;
    bottom: 0.08em;
    font-size: 0.6em;
    font-weight: 500;
    color: var(--o);
  }
  /* the menu's pale panel takes the trial's palest cool shade */
  :global(html[data-pal] .panel) {
    --paper: var(--trial-i3);
  }
  /* the reading face: running text of stories and pages, English only
     (Bangla keeps Noto Serif Bengali) */
  :global(html[data-body='literata'] .g:not(:lang(bn))) {
    --read: 'Literata', 'Noto Serif Bengali', serif;
  }
  :global(html[data-body='sourceserif'] .g:not(:lang(bn))) {
    --read: 'Source Serif 4', 'Noto Serif Bengali', serif;
  }
  :global(html[data-body='newsreader'] .g:not(:lang(bn))) {
    --read: 'Newsreader', 'Noto Serif Bengali', serif;
  }
  :global(html[data-body='lora'] .g:not(:lang(bn))) {
    --read: 'Lora', 'Noto Serif Bengali', serif;
  }
  :global(html[data-body='plex'] .g:not(:lang(bn))) {
    --read: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;
  }
</style>
