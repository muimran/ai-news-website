<script>
  /* A trial: two small menus that set the headline face and the reading
     face, remembered in this browser. Shown on the local copy, and on the
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
  $effect.pre(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('fonts')) set('gt-fonts', '1');
    if (q.has('nofonts')) set('gt-fonts', null);
    on = import.meta.env.DEV || get('gt-fonts', '') === '1';
    head = get('gt-head', 'now');
    body = get('gt-body', 'now');
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
      return;
    }
    load(`head-${head}`, HEAD[head]);
    load(`body-${body}`, BODY[body]);
    root.dataset.head = head;
    root.dataset.body = body;
    set('gt-head', head);
    set('gt-body', body);
  });
</script>

{#if on}
  <div class="pick">
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
  </div>
{/if}

<style>
  .pick {
    position: fixed;
    z-index: 100;
    top: 50%;
    right: 0;
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
