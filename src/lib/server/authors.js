/* The writers, one entry per person in content/authors/<slug>.md: English
   name and role, and — for anyone on the Bangla desk — the Bangla spelling
   and role their bylines use. A writer has one page, in English, for their
   work on both desks. A short bio can go in the file's body. */

import matter from 'gray-matter';
import { marked } from 'marked';
import { base } from '$app/paths';
import { authorSlug } from '$lib/site/reel.js';

const files = import.meta.glob('/content/authors/*.md', { query: '?raw', import: 'default', eager: true });

const REGISTRY = Object.entries(files).map(([path, raw]) => {
  const { data, content } = matter(raw);
  return {
    slug: path.split('/').pop().replace(/\.md$/, ''),
    name: data.name,
    name_bn: data.name_bn || null,
    role: data.role || '',
    role_bn: data.role_bn || null,
    bio: content.trim() ? marked.parse(content) : null
  };
});

const byName = new Map();
for (const w of REGISTRY) {
  byName.set(w.name, w);
  if (w.name_bn) byName.set(w.name_bn, w);
}

/** The writer behind a byline: their entry, or — for a Latin-script name
    with no entry yet — one made from the name. Null when there's no English
    name to give them an address; add them to content/authors to fix that. */
export function writerFor(name) {
  if (!name) return null;
  if (byName.has(name)) return byName.get(name);
  const slug = authorSlug(name);
  return slug ? { slug, name, name_bn: null, role: '', role_bn: null, bio: null } : null;
}

export const writerUrl = (w) => `${base}/en/author/${w.slug}`;
