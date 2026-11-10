/* Typewriter quotes into printer's quotes: "Nobody" → “Nobody”, don't →
   don’t, '90s → ’90s. Writers type straight marks; a publication sets
   curly ones. A mark is opening when it starts a word after a space, an
   opening bracket or a dash (or the start of the text), and closing
   otherwise; an apostrophe inside a word is always closing. Works for
   Bangla the same way (letters and vowel signs both count as a word). */

const W = '\\p{L}\\p{M}\\p{N}';
const OPENS = '(^|[\\s(\\[{\\u2014\\u2013-])';

const DECADE = /'(?=\d\ds\b)/g;
const INSIDE = new RegExp(`([${W}])'([${W}])`, 'gu');
const SINGLE_OPEN = new RegExp(`(^|[\\s(\\[{\\u2014\\u2013"“-])'(?=[${W}"“…])`, 'gu');
const DOUBLE_OPEN = new RegExp(`${OPENS}"(?=[${W}‘'…])`, 'gu');

/* every replacement swaps one character for one, so a caller can add
   context either side and cut it off again by length */
export function smart(text) {
  if (!text || !/["']/.test(text)) return text;
  return text
    .replace(DECADE, '’')
    .replace(INSIDE, '$1’$2')
    .replace(SINGLE_OPEN, '$1‘')
    .replace(DOUBLE_OPEN, '$1“')
    .replace(/'/g, '’')
    .replace(/"/g, '”');
}

// where a run of text starts afresh: a new paragraph, item, heading, line
const BLOCK = /^<\/?(p|li|ul|ol|h[1-6]|blockquote|figure|figcaption|table|tr|td|th|br|hr|div)\b/i;
const CODE = /^<(\/?)(code|pre)\b/i;

/* The same for a story's HTML: only the words, never the tags or code. A
   quote's neighbours can sit across a tag ("<em>this</em>"), so each run
   of text is read with the visible character either side of it. */
export function smartHtml(html) {
  const parts = html.split(/(<[^>]+>)/);
  const text = parts.map((p, i) => (i % 2 ? null : p.replace(/&quot;/g, '"').replace(/&#39;/g, "'")));
  let code = 0;
  const live = parts.map((p, i) => {
    if (i % 2) {
      const c = CODE.exec(p);
      if (c) code += c[1] ? -1 : 1;
      return false;
    }
    return code === 0;
  });
  // the visible character either side of run i, within its block
  const near = (i, step) => {
    for (let j = i + step; j >= 0 && j < parts.length; j += step) {
      if (j % 2) {
        if (BLOCK.test(parts[j])) return '';
        continue;
      }
      if (text[j]) return step < 0 ? text[j].slice(-1) : text[j][0];
    }
    return '';
  };
  const out = parts.map((p, i) => {
    if (i % 2 || !live[i] || !/["']/.test(text[i])) return p;
    const before = near(i, -1);
    const after = near(i, 1);
    const done = smart(before + text[i] + after);
    return done.slice(before.length, done.length - after.length).replace(/"/g, '&quot;');
  });
  return out.join('');
}
