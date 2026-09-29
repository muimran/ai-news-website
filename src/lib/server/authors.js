/* The writers, one entry per person in content/authors/<slug>.md: English
   name and role, and — for anyone on the Bangla desk — the Bangla spelling
   and role their bylines use. A writer has one page, in English, for their
   work on both desks. A short bio can go in the file's body; until it does,
   the page says who they are from their name and role. A photo
   (`photo: /uploads/...`) goes in the frontmatter; without one, the
   writer's pages keep an empty frame where it will go. So do their LinkedIn
   and Facebook addresses (`linkedin:`, `facebook:`), shown as icons under
   the bio. */

import matter from 'gray-matter';
import { marked } from 'marked';
import { base } from '$app/paths';
import { dev } from '$app/environment';
import { authorSlug } from '$lib/site/reel.js';

const SOCIALS = [
  ['linkedin', 'LinkedIn'],
  ['facebook', 'Facebook']
];

/* PREVIEW ONLY: stock portraits from Unsplash, so the photo frames can be
   judged on the dev server. `dev` keeps them out of every build; delete this
   once real photos arrive. Staff keeps its empty frame, to show both. */
const SAMPLE = dev
  ? [
      'photo-1599257891200-693611501ecb',
      'photo-1573497019707-1c04de26e58c',
      'photo-1761435756843-0ca5f4ff1d59',
      'photo-1609371497456-3a55a205d5eb',
      'photo-1618593706014-06782cd3bb3b',
      'photo-1701728667207-54b43dbdab97',
      'photo-1610767619216-94a37b9f3686',
      'photo-1726156619056-5de67024df67',
      'photo-1507003211169-0a1dd7228f2d',
      'photo-1570676372087-468f8806f717',
      'photo-1610767541061-cc2cf8121199',
      'photo-1577878317861-2a54eb46ed42'
    ].map((id) => `https://images.unsplash.com/${id}?w=480&h=672&fit=crop&crop=faces&q=80`)
  : [];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A plain stand-in bio from the name and role, until a real one is written. */
function standIn(name, role) {
  if (role === 'Newsroom') return '<p>Stories reported and edited by the Ground Truth newsroom as a whole.</p>';
  const what = role ? `${/^[aeiou]/i.test(role) ? 'an' : 'a'} ${role.toLowerCase()}` : 'a reporter';
  return `<p>${escape(name)} is ${escape(what)} at Ground Truth, the nonprofit newsroom reporting on AI in Bangladesh.</p>`;
}

const files = import.meta.glob('/content/authors/*.md', { query: '?raw', import: 'default', eager: true });

const REGISTRY = Object.entries(files).map(([path, raw], i) => {
  const { data, content } = matter(raw);
  return {
    slug: path.split('/').pop().replace(/\.md$/, ''),
    name: data.name,
    name_bn: data.name_bn || null,
    role: data.role || '',
    role_bn: data.role_bn || null,
    photo: data.photo || (data.role === 'Newsroom' ? null : SAMPLE[i % SAMPLE.length]) || null,
    links: SOCIALS.filter(([key]) => data[key]).map(([key, label]) => ({ key, label, href: data[key] })),
    bio: content.trim() ? marked.parse(content) : standIn(data.name, data.role)
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
  return slug ? { slug, name, name_bn: null, role: '', role_bn: null, photo: null, links: [], bio: standIn(name, '') } : null;
}

export const writerUrl = (w) => `${base}/en/author/${w.slug}`;
