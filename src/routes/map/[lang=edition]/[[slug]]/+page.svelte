<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { marked } from 'marked';
  import { replaceState } from '$app/navigation';
  import { base } from '$app/paths';
  import { getStory, sibling, kindLabel, sectionLabel, formatNumber } from '$lib/content.js';
  import { mapFor, BOUNDS, CELL } from '$lib/map.js';

  let { data } = $props();

  const STR = {
    en: {
      tagline: 'AI, reported from wherever it lands.',
      mapLabel: 'Map of stories',
      search: 'Search the map',
      found: (n) => `${n} found · ↵`,
      none: 'Nothing found',
      newest: 'Newest',
      newer: 'Newer',
      older: 'Older',
      whole: 'Whole map',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      close: 'Close',
      min: 'min',
      readOther: 'বাংলায় পড়ুন',
      hint: 'Drag to move · pinch or ⌘ scroll to zoom · ← → newest to oldest'
    },
    bn: {
      tagline: 'এআই যেখানেই পৌঁছায়, সেখান থেকেই প্রতিবেদন।',
      mapLabel: 'প্রতিবেদনের মানচিত্র',
      search: 'মানচিত্রে খুঁজুন',
      found: (n) => `${n}টি পাওয়া গেছে · ↵`,
      none: 'কিছু পাওয়া যায়নি',
      newest: 'সর্বশেষ',
      newer: 'নতুনতর',
      older: 'পুরোনো',
      whole: 'পুরো মানচিত্র',
      zoomIn: 'বড় করুন',
      zoomOut: 'ছোট করুন',
      close: 'বন্ধ',
      min: 'মিনিট',
      readOther: 'Read in English',
      hint: 'টেনে সরান · পিঞ্চ বা ⌘ স্ক্রলে জুম · ← → নতুন থেকে পুরোনো'
    }
  };

  const DATE = {
    en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    bn: new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', timeZone: 'UTC' })
  };

  const lang = $derived(data.lang);
  const other = $derived(lang === 'en' ? 'bn' : 'en');
  const L = $derived(STR[lang]);
  const map = $derived(mapFor(lang));
  const order = $derived(
    [...map.items].sort((a, b) => b.story.date - a.story.date || a.story.weight - b.story.weight)
  );

  const url = (s) => `${base}/map/${s.lang}/${s.slug}`;
  const home = (l) => `${base}/map/${l}`;

  /* ---------------- camera ----------------
     `cam` is the world point at the centre of the screen and the scale.
     Screen = translate(tx, ty) + world × z. */
  const ZMAX = 2.2;
  let vw = $state(1440);
  let vh = $state(900);
  const wide = $derived(vw >= 760);
  const panelW = $derived(wide ? Math.min(680, vw * 0.48) : vw);

  const overviewZ = () => Math.min(vw / (BOUNDS.w + 160), (vh - 140) / (BOUNDS.h + 160));
  const clampZ = (z) => Math.min(ZMAX, Math.max(overviewZ() * 0.8, z));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const overview = () => ({ x: BOUNDS.x + BOUNDS.w / 2, y: BOUNDS.y + BOUNDS.h / 2 + 20, z: overviewZ() });

  /* Camera that puts a story's box in the middle of whatever part of the
     screen the map still has (left of the panel, or above it on a phone). */
  function storyCam(item, withPanel, z = wide ? 1 : 0.72) {
    let sx = vw / 2;
    let sy = vh / 2;
    if (withPanel) {
      if (wide) sx = (vw - panelW) / 2;
      else sy = 56 + (vh * 0.4 - 56) / 2;
    }
    return {
      x: item.x + CELL.w / 2 + (vw / 2 - sx) / z,
      y: item.y + CELL.h / 2 + (vh / 2 - sy) / z,
      z
    };
  }

  function fitCam(items) {
    const x0 = Math.min(...items.map((i) => i.x)) - 80;
    const x1 = Math.max(...items.map((i) => i.x + CELL.w)) + 40;
    const y0 = Math.min(...items.map((i) => i.y)) - 90;
    const y1 = Math.max(...items.map((i) => i.y + CELL.h)) + 40;
    const room = openItem && wide ? vw - panelW : vw;
    const z = clampZ(Math.min(1, room / (x1 - x0), (vh - 150) / (y1 - y0)));
    return { x: (x0 + x1) / 2 + (vw - room) / 2 / z, y: (y0 + y1) / 2, z };
  }

  let cam = $state(firstCam());

  function firstCam() {
    const item = data.slug && mapFor(data.lang).items.find((i) => i.story.slug === data.slug);
    return item ? storyCam(item, true) : overview();
  }

  const tx = $derived(vw / 2 - cam.x * cam.z);
  const ty = $derived(vh / 2 - cam.y * cam.z);
  const level = $derived(cam.z < 0.5 ? 'far' : cam.z < 0.9 ? 'near' : 'close');
  const grid = $derived.by(() => {
    let g = 48 * cam.z;
    while (g < 22) g *= 2;
    while (g > 44) g /= 2;
    return g;
  });

  function set(c) {
    cam = {
      x: clamp(c.x, BOUNDS.x, BOUNDS.x + BOUNDS.w),
      y: clamp(c.y, BOUNDS.y, BOUNDS.y + BOUNDS.h),
      z: clampZ(c.z)
    };
  }
  const panBy = (dx, dy) => set({ x: cam.x - dx / cam.z, y: cam.y - dy / cam.z, z: cam.z });

  /* Zoom about a screen point: the world point under it stays put. */
  function zoomedAt(sx, sy, factor) {
    const z = clampZ(cam.z * factor);
    const wx = (sx - tx) / cam.z;
    const wy = (sy - ty) / cam.z;
    return { x: wx - (sx - vw / 2) / z, y: wy - (sy - vh / 2) / z, z };
  }

  /* Van Wijk & Nuij smooth zoom: long moves pull back, travel, then dive in,
     which is what makes a jump across the map read as a flight rather than a
     slide. p = [centre x, centre y, visible world width]. */
  function zoomPath([ux0, uy0, w0], [ux1, uy1, w1]) {
    const rho = Math.SQRT2;
    const dx = ux1 - ux0;
    const dy = uy1 - uy0;
    const d2 = dx * dx + dy * dy;
    if (d2 < 1e-6) {
      const S = Math.log(w1 / w0) / rho;
      const f = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
      f.S = Math.abs(S);
      return f;
    }
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (2 * w0 * 2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (2 * w1 * 2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    const S = (r1 - r0) / rho;
    const f = (t) => {
      const s = t * S;
      const c0 = Math.cosh(r0);
      const u = (w0 / (2 * d1)) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)];
    };
    f.S = Math.abs(S);
    return f;
  }

  const still =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0;

  function flyTo(target, maxMs = 1700) {
    cancelAnimationFrame(frame);
    if (still) return set(target);
    const path = zoomPath([cam.x, cam.y, vw / cam.z], [target.x, target.y, vw / target.z]);
    const ms = Math.min(maxMs, Math.max(420, path.S * 900));
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const [x, y, w] = path(e);
      cam = { x, y, z: vw / w };
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  /* ---------------- reading ---------------- */
  let openSlug = $derived(data.slug);
  const openItem = $derived(openSlug ? map.items.find((i) => i.story.slug === openSlug) : null);
  const openIdx = $derived(openItem ? order.indexOf(openItem) : -1);
  let panelEl = $state();

  function open(item) {
    openSlug = item.story.slug;
    replaceState(url(item.story), {});
    flyTo(storyCam(item, true));
    panelEl?.scrollTo(0, 0);
  }

  function close() {
    const item = openItem;
    openSlug = null;
    replaceState(home(lang), {});
    if (item) flyTo(storyCam(item, false, Math.min(cam.z, 0.72)));
  }

  function step(d) {
    const i = openIdx === -1 ? (d > 0 ? 0 : order.length - 1) : openIdx + d;
    if (i >= 0 && i < order.length) open(order[i]);
  }

  function hrefFor(l) {
    const s = openSlug && getStory(openSlug, lang);
    if (!s) return home(l);
    if (l === lang) return url(s);
    const sib = sibling(s, l);
    return sib ? url(sib) : home(l);
  }

  /* Most bodies open by repeating the dek, which the panel already shows. */
  function bodyHtml(s) {
    let b = s.body;
    if (s.dek && b.startsWith(s.dek)) b = b.slice(s.dek.length).trimStart();
    return marked.parse(b);
  }

  /* ---------------- search ---------------- */
  let q = $state('');
  let searchEl = $state();
  const hits = $derived.by(() => {
    const t = q.trim().toLowerCase();
    if (!t) return null;
    const found = map.items.filter(({ story: s }) =>
      [s.title, s.dek, s.author, s.location, sectionLabel(s.section, lang), ...s.tags]
        .join(' ')
        .toLowerCase()
        .includes(t)
    );
    return new Set(found.map((i) => i.story.slug));
  });

  function goToHits(e) {
    e.preventDefault();
    if (!hits?.size) return;
    const found = map.items.filter((i) => hits.has(i.story.slug));
    if (found.length === 1) open(found[0]);
    else flyTo(fitCam(found));
  }

  /* ---------------- gestures ---------------- */
  let viewport = $state();
  let intro = 0;
  let dragged = false;
  let grabbing = $state(false);
  const pointers = new Map();
  let start = { x: 0, y: 0 };
  let pinch = null;

  const interrupt = () => {
    clearTimeout(intro);
    cancelAnimationFrame(frame);
  };

  function pinchState() {
    const [a, b] = [...pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }

  function down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    interrupt();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragged = false;
      start = { x: e.clientX, y: e.clientY };
    } else if (pointers.size === 2) {
      pinch = pinchState();
    }
  }

  function move(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size === 1) {
      if (!dragged && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) {
        dragged = true;
        grabbing = true;
        viewport.setPointerCapture(e.pointerId);
      }
      if (dragged) panBy(dx, dy);
    } else if (pointers.size === 2 && pinch) {
      dragged = true;
      const now = pinchState();
      set(zoomedAt(now.mx, now.my, now.d / pinch.d));
      panBy(now.mx - pinch.mx, now.my - pinch.my);
      pinch = now;
    }
  }

  function up(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) grabbing = false;
  }

  /* Trackpad: two fingers pan, pinch zooms (the browser reports a pinch as a
     ctrl+wheel). Mouse: the wheel pans, ⌘/ctrl + wheel zooms. */
  function wheel(e) {
    e.preventDefault();
    interrupt();
    if (e.ctrlKey || e.metaKey) {
      const unit = e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002;
      set(zoomedAt(e.clientX, e.clientY, Math.pow(2, -e.deltaY * unit * (e.ctrlKey ? 10 : 1))));
    } else {
      const f = e.deltaMode === 1 ? 16 : 1;
      panBy(-e.deltaX * f, -e.deltaY * f);
    }
  }

  function dbl(e) {
    if (e.target.closest('a, button')) return;
    flyTo(zoomedAt(e.clientX, e.clientY, 2), 600);
  }

  function pick(e, item) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (dragged && e.detail !== 0) return;
    // From far out a story is just a dot: first bring it close, then open it.
    if (level === 'far' && e.detail !== 0) flyTo(storyCam(item, !!openItem, 0.72));
    else open(item);
  }

  /* Tabbing through stories moves the map to follow the focus. */
  function followFocus(e, item) {
    if (!e.currentTarget.matches(':focus-visible')) return;
    const sx = tx + item.x * cam.z;
    const sy = ty + item.y * cam.z;
    const right = openItem && wide ? vw - panelW : vw;
    if (level === 'far' || sx < 40 || sy < 70 || sx > right - 200 || sy > vh - 160) {
      flyTo(storyCam(item, !!openItem, Math.max(cam.z, 0.72)), 700);
    }
  }

  function keys(e) {
    if (e.target.closest?.('input, textarea')) {
      if (e.key === 'Escape') {
        q = '';
        e.target.blur();
      }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const zoomBy = (f) => flyTo({ ...cam, z: clampZ(cam.z * f) }, 450);
    const act = {
      ArrowRight: () => step(1),
      ArrowLeft: () => step(-1),
      '+': () => zoomBy(1.6),
      '=': () => zoomBy(1.6),
      '-': () => zoomBy(1 / 1.6),
      '0': () => flyTo(overview()),
      '/': () => searchEl?.focus(),
      Escape: () => (openItem ? close() : (q = ''))
    }[e.key];
    if (act) {
      e.preventDefault();
      interrupt();
      act();
    }
  }

  // the server stamps <html lang>; client-side language switches must too
  $effect(() => {
    document.documentElement.lang = lang;
  });

  onMount(() => {
    const opts = { passive: false };
    viewport.addEventListener('wheel', wheel, opts);
    viewport.addEventListener('pointerdown', down);
    viewport.addEventListener('pointermove', move);
    viewport.addEventListener('pointerup', up);
    viewport.addEventListener('pointercancel', up);
    viewport.addEventListener('dblclick', dbl);

    // Real screen size is only known now. Start on the whole map, then fly in
    // to the newest story — one look at the shape of things, then the news.
    if (openItem) set(storyCam(openItem, true));
    else {
      set(overview());
      intro = setTimeout(() => order[0] && flyTo(storyCam(order[0], false, 0.72), 2200), 900);
    }

    return () => {
      interrupt();
      viewport.removeEventListener('wheel', wheel, opts);
    };
  });
</script>

<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} onkeydown={keys} />

<svelte:head>
  <title>{openItem ? `${openItem.story.title} — New Terms` : `New Terms — ${L.tagline}`}</title>
  <meta name="description" content={openItem ? openItem.story.dek : L.tagline} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400..700&display=swap"
  />
</svelte:head>

<div class="gt" {lang}>
  <main
    class="viewport"
    class:reading={!!openItem}
    class:searching={!!hits}
    class:grabbing
    data-level={level}
    aria-label={L.mapLabel}
    bind:this={viewport}
    style="background-size:{grid}px {grid}px; background-position:{tx}px {ty}px"
  >
    <h1 class="sr">New Terms — {L.tagline}</h1>
    <div class="world" style="--z:{cam.z}; transform:translate({tx}px, {ty}px) scale({cam.z})">
      {#each map.areas as a (a.key)}
        <button
          type="button"
          class="area"
          style="left:{a.x}px; top:{a.y}px"
          onclick={() => flyTo(fitCam(map.items.filter((i) => i.story.section === a.key)))}
        >
          {sectionLabel(a.key, lang)}<span>{formatNumber(a.count, lang)}</span>
        </button>
      {/each}

      {#each map.items as item (item.story.slug)}
        {@const s = item.story}
        <a
          class="pin"
          class:on={openSlug === s.slug}
          class:hit={hits?.has(s.slug)}
          class:newest={order[0] === item}
          href={url(s)}
          draggable="false"
          aria-current={openSlug === s.slug ? 'true' : undefined}
          style="left:{item.x}px; top:{item.y}px; --age:{item.age}"
          onclick={(e) => pick(e, item)}
          onfocus={(e) => followFocus(e, item)}
        >
          <span class="dot"></span>
          <span class="meta">{kindLabel(s.kind, lang)} · {DATE[lang].format(s.date)}</span>
          <span class="title">{s.title}</span>
          <span class="dek">{s.dek}</span>
        </a>
      {/each}
    </div>
  </main>

  <header class="top">
    <a class="name" href={home(lang)}>New Terms</a>
    <form class="search" role="search" onsubmit={goToHits}>
      <input
        bind:this={searchEl}
        bind:value={q}
        type="search"
        placeholder={L.search}
        aria-label={L.search}
        autocomplete="off"
      />
      {#if hits}<span class="count" aria-live="polite">{hits.size ? L.found(formatNumber(hits.size, lang)) : L.none}</span>{/if}
    </form>
    <nav class="langs" aria-label="Language / ভাষা">
      <a href={hrefFor('en')} hreflang="en" lang="en" aria-current={lang === 'en' ? 'page' : undefined}>EN</a>
      <a href={hrefFor('bn')} hreflang="bn" lang="bn" aria-current={lang === 'bn' ? 'page' : undefined}>বাং</a>
    </nav>
  </header>

  <nav class="dock" class:hidden={openItem && !wide} aria-label={L.mapLabel}>
    <button type="button" onclick={() => flyTo({ ...cam, z: clampZ(cam.z / 1.6) }, 450)} aria-label={L.zoomOut}>−</button>
    <button type="button" onclick={() => flyTo({ ...cam, z: clampZ(cam.z * 1.6) }, 450)} aria-label={L.zoomIn}>+</button>
    <button type="button" class="word" onclick={() => flyTo(overview())}>{L.whole}</button>
    <span class="sep"></span>
    {#if openIdx === -1}
      <button type="button" class="word" onclick={() => step(1)}>{L.newest} →</button>
    {:else}
      <button type="button" onclick={() => step(-1)} disabled={openIdx === 0} aria-label={L.newer}>←</button>
      <span class="pos">{formatNumber(openIdx + 1, lang)} / {formatNumber(order.length, lang)}</span>
      <button type="button" onclick={() => step(1)} disabled={openIdx === order.length - 1} aria-label={L.older}>→</button>
    {/if}
  </nav>

  {#if !openItem}<p class="hint">{L.hint}</p>{/if}

  {#if openItem}
    {@const s = openItem.story}
    {@const sib = sibling(s, other)}
    <aside
      class="panel"
      style={wide ? `width:${panelW}px` : ''}
      bind:this={panelEl}
      aria-label={s.title}
      transition:fly={{ x: wide ? 48 : 0, y: wide ? 0 : 80, duration: still ? 0 : 320 }}
    >
      <div class="panel-bar">
        <button type="button" onclick={() => step(-1)} disabled={openIdx === 0} aria-label={L.newer}>←</button>
        <span class="pos">{formatNumber(openIdx + 1, lang)} / {formatNumber(order.length, lang)}</span>
        <button type="button" onclick={() => step(1)} disabled={openIdx === order.length - 1} aria-label={L.older}>→</button>
        <button type="button" class="x" onclick={close}>{L.close} ✕</button>
      </div>
      <article>
        <p class="kicker">{sectionLabel(s.section, lang)}</p>
        <h2>{s.title}</h2>
        {#if s.dek}<p class="lede">{s.dek}</p>{/if}
        <p class="byline">
          <span>{kindLabel(s.kind, lang)}</span>
          <span>{s.author}</span>
          {#if s.location}<span>{s.location}</span>{/if}
          <span>{DATE[lang].format(s.date)}</span>
          <span>{formatNumber(s.readTime, lang)} {L.min}</span>
        </p>
        {#if s.image}
          <figure>
            <img src={s.image.src} alt={s.image.alt} loading="lazy" />
            {#if s.image.credit}<figcaption>{s.image.credit}</figcaption>{/if}
          </figure>
        {/if}
        <div class="body">{@html bodyHtml(s)}</div>
        {#if sib}<p class="other"><a href={url(sib)} hreflang={other} lang={other}>{L.readOther} →</a></p>{/if}
      </article>
    </aside>
  {/if}
</div>

<style>
  :global(:root:has(.gt)) {
    --bg: #e8e7e3;
    --panel: #f3f2ee;
    --ink: #111110;
    --mute: #6b6962;
    --faint: #b9b6ad;
    --line: #cdcac2;
    --accent: #e8430d;
    color-scheme: light;
    background: var(--bg);
  }
  @media (prefers-color-scheme: dark) {
    :global(:root:has(.gt)) {
      --bg: #0b0b0c;
      --panel: #141415;
      --ink: #efeee9;
      --mute: #8d8b85;
      --faint: #2e2e31;
      --line: #262628;
      --accent: #ff6a33;
      color-scheme: dark;
    }
  }
  :global(body:has(.gt)) {
    margin: 0;
    overflow: hidden;
    overscroll-behavior: none;
  }

  .gt {
    --mono: 'JetBrains Mono', 'Noto Sans Bengali', ui-monospace, monospace;
    position: fixed;
    inset: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: 'Instrument Sans', 'Noto Sans Bengali', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .gt:lang(bn) {
    font-family: 'Noto Sans Bengali', 'Instrument Sans', system-ui, sans-serif;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  button {
    font: inherit;
    color: inherit;
  }

  /* ---------------- the map ---------------- */
  .viewport {
    position: absolute;
    inset: 0;
    overflow: hidden;
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    background-image: radial-gradient(circle, var(--faint) 1px, transparent 1.4px);
  }
  .viewport.grabbing {
    cursor: grabbing;
  }
  .world {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
  }

  /* Area labels stay the same size on screen at every zoom, like place names. */
  .area {
    position: absolute;
    translate: -50% -100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    white-space: nowrap;
    font: 500 calc(12px / var(--z)) / 1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mute);
    transition: color 0.15s;
  }
  .area span {
    margin-left: 0.8em;
    color: var(--accent);
  }
  .area:hover {
    color: var(--ink);
  }
  [data-level='far'] .area {
    font-size: calc(13px / var(--z));
    color: var(--ink);
  }

  .pin {
    position: absolute;
    display: block;
    width: 330px;
    color: var(--ink);
    text-decoration: none;
    opacity: calc(1 - var(--age) * 0.5);
    -webkit-user-drag: none;
    transition: opacity 0.25s;
  }
  .dot {
    position: absolute;
    left: -24px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--ink);
    scale: max(1, calc(0.7 / var(--z)));
    transition: background 0.15s;
  }
  .newest .dot,
  .pin.on .dot,
  .pin:hover .dot {
    background: var(--accent);
  }
  .newest .dot {
    box-shadow: 0 0 0 5px color-mix(in oklab, var(--accent) 25%, transparent);
  }
  .meta,
  .title,
  .dek {
    display: block;
    transition: opacity 0.25s;
  }
  .meta {
    margin-bottom: 8px;
    font: 500 11px/1.3 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mute);
  }
  .title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    overflow: hidden;
    font-size: 24px;
    font-weight: 560;
    line-height: 1.12;
    letter-spacing: -0.02em;
  }
  .title:lang(bn) {
    line-height: 1.32;
    letter-spacing: 0;
  }
  .dek {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    overflow: hidden;
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.45;
    color: var(--mute);
  }
  .pin:hover .title,
  .pin.on .title {
    color: var(--accent);
  }
  .pin:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 8px;
    border-radius: 4px;
  }

  /* Semantic zoom: far = dots and areas, near = headlines, close = summaries. */
  [data-level='far'] .meta,
  [data-level='far'] .title,
  [data-level='far'] .dek,
  [data-level='near'] .dek {
    opacity: 0;
  }

  .reading .pin:not(.on),
  .searching .pin:not(.hit) {
    opacity: 0.14;
  }

  /* ---------------- chrome ---------------- */
  .top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.9rem clamp(1rem, 3vw, 1.75rem);
    font: 500 0.8125rem/1 var(--mono);
    background: linear-gradient(var(--bg) 35%, transparent);
    pointer-events: none;
  }
  .top > * {
    pointer-events: auto;
  }
  .name {
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
  }
  .search {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    min-width: 0;
    margin-right: auto;
  }
  .search input {
    width: 15rem;
    max-width: 100%;
    min-width: 0;
    padding: 0.4rem 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: none;
    color: var(--ink);
    font: inherit;
    outline: none;
  }
  .search input:focus {
    border-bottom-color: var(--ink);
  }
  .search input::placeholder {
    color: var(--mute);
  }
  .count {
    color: var(--accent);
    white-space: nowrap;
  }
  .langs {
    display: flex;
    gap: 0.125rem;
  }
  .langs a,
  .dock button,
  .panel-bar button {
    padding: 0.45rem 0.6rem;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--mute);
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
  }
  .langs a:hover,
  .dock button:hover:not(:disabled),
  .panel-bar button:hover:not(:disabled) {
    color: var(--ink);
  }
  .langs a[aria-current='page'] {
    background: var(--ink);
    color: var(--bg);
  }
  button:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .langs a:focus-visible,
  .dock button:focus-visible,
  .panel-bar button:focus-visible,
  .area:focus-visible,
  .name:focus-visible,
  .other a:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .dock {
    position: fixed;
    left: clamp(1rem, 3vw, 1.75rem);
    bottom: clamp(1rem, 3vw, 1.5rem);
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.25rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: color-mix(in oklab, var(--panel) 88%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font: 500 0.8125rem/1 var(--mono);
  }
  .dock.hidden {
    display: none;
  }
  .dock button {
    min-width: 2rem;
    font-size: 1rem;
  }
  .dock button.word {
    font-size: 0.8125rem;
  }
  .sep {
    width: 1px;
    height: 1.1rem;
    margin: 0 0.35rem;
    background: var(--line);
  }
  .pos {
    padding: 0 0.35rem;
    color: var(--ink);
    white-space: nowrap;
  }
  .hint {
    position: fixed;
    right: clamp(1rem, 3vw, 1.75rem);
    bottom: clamp(1.4rem, 3vw, 1.9rem);
    margin: 0;
    font: 400 0.75rem/1.4 var(--mono);
    color: var(--mute);
    pointer-events: none;
  }

  /* ---------------- reading panel ---------------- */
  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--panel);
    border-left: 1px solid var(--line);
  }
  .panel-bar {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.75rem clamp(1rem, 3vw, 2.5rem);
    background: color-mix(in oklab, var(--panel) 90%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font: 500 0.8125rem/1 var(--mono);
  }
  .panel-bar button {
    font-size: 1rem;
  }
  .panel-bar .x {
    margin-left: auto;
    font-size: 0.8125rem;
  }
  article {
    max-width: 38rem;
    padding: 1.5rem clamp(1rem, 3vw, 2.5rem) 5rem;
    font-size: 1.0625rem;
    line-height: 1.62;
  }
  article:lang(bn) {
    line-height: 1.8;
  }
  .kicker {
    margin: 0 0 1rem;
    font: 500 0.75rem/1.3 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }
  h2 {
    margin: 0 0 1rem;
    font-size: clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem);
    font-weight: 560;
    line-height: 1.08;
    letter-spacing: -0.025em;
    text-wrap: balance;
  }
  h2:lang(bn) {
    line-height: 1.3;
    letter-spacing: 0;
  }
  .lede {
    margin: 0 0 1.25rem;
    font-size: 1.2rem;
    line-height: 1.45;
    color: var(--mute);
  }
  .byline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin: 0 0 1.75rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--line);
    font: 400 0.75rem/1.4 var(--mono);
    color: var(--mute);
  }
  figure {
    margin: 0 0 1.75rem;
  }
  img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 24rem;
    object-fit: cover;
    background: var(--line);
  }
  figcaption {
    margin-top: 0.5rem;
    font: 400 0.6875rem/1.4 var(--mono);
    color: var(--mute);
  }
  .body :global(p) {
    margin: 0 0 1em;
  }
  .body :global(h2),
  .body :global(h3) {
    margin: 1.8em 0 0.5em;
    font-size: 1.0625rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .body :global(blockquote) {
    margin: 1.5em 0;
    padding: 0;
    font-size: 1.3rem;
    font-weight: 500;
    line-height: 1.4;
  }
  .body :global(a),
  .other a {
    color: var(--accent);
  }
  .other {
    margin: 2rem 0 0;
    font: 500 0.8125rem/1 var(--mono);
  }

  @media (max-width: 759px) {
    .top {
      gap: 0.75rem;
    }
    .search input {
      width: 100%;
    }
    .count,
    .hint {
      display: none;
    }
    .panel {
      top: 40vh;
      left: 0;
      border-left: 0;
      border-top: 1px solid var(--line);
      border-radius: 14px 14px 0 0;
    }
  }
</style>
