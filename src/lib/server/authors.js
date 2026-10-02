/* The writers, one entry per person in content/authors/<slug>.md: English
   name and role, and — for anyone on the Bangla desk — the Bangla spelling
   and role their bylines use. A writer has one page, in English, for their
   work on both desks. A short bio can go in the file's body; until it does,
   the page says who they are from their name and role. A photo
   (`photo: /uploads/...`) goes in the frontmatter; without one, the
   writer's pages keep an empty frame where it will go. So do their LinkedIn
   and Facebook addresses (`linkedin:`, `facebook:`), shown as icons under
   the bio.

   For now every writer's photo is a stand-in, never a stock photo of a real
   stranger under an invented name: five AI-generated portraits of people
   who don't exist (static/uploads/authors/stand-in-*.jpg; FLUX.1 schnell
   for the women, Realistic Vision for the men), shared between writers and
   spread so the same face seldom sits next to itself on the Reporters
   page. Point a writer's `photo:` field at their real photo when it
   arrives. */

import matter from 'gray-matter';
import { marked } from 'marked';
import { base } from '$app/paths';
import { authorSlug } from '$lib/site/reel.js';

const SOCIALS = [
  ['linkedin', 'LinkedIn'],
  ['facebook', 'Facebook']
];

/** A site path ("/uploads/…") gets the site's base, so it also works
    under a sub-path like GitHub Pages; a full URL is left as it is. */
const atBase = (src) => (src && src.startsWith('/') ? base + src : src || null);

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A plain stand-in bio from the name and role, until a real one is written. */
function standIn(name, role) {
  if (role === 'Newsroom') return '<p>Stories reported and edited by the Ground Truth newsroom as a whole.</p>';
  const what = role ? `${/^[aeiou]/i.test(role) ? 'an' : 'a'} ${role.toLowerCase()}` : 'a reporter';
  return `<p>${escape(name)} is ${escape(what)} at Ground Truth, the nonprofit newsroom reporting on AI in Bangladesh.</p>`;
}

const files = import.meta.glob('/content/authors/*.md', { query: '?raw', import: 'default', eager: true });

const REGISTRY = Object.entries(files).map(([path, raw]) => {
  const { data, content } = matter(raw);
  return {
    slug: path.split('/').pop().replace(/\.md$/, ''),
    name: data.name,
    name_bn: data.name_bn || null,
    role: data.role || '',
    role_bn: data.role_bn || null,
    photo: atBase(data.photo),
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
