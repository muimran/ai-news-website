/* Standing pages — About and the policies — written as markdown in
   content/pages/<lang>/<slug>.md, same slugs in both languages. A page with
   no body yet still gets its place in the menu and says it's being written. */

import matter from 'gray-matter';
import { marked } from 'marked';
import { base } from '$app/paths';

const files = import.meta.glob('/content/pages/*/*.md', { query: '?raw', import: 'default', eager: true });

const PAGES = Object.entries(files)
  .map(([path, raw]) => {
    const [lang, file] = path.split('/').slice(-2);
    const { data, content } = matter(raw);
    return {
      lang,
      slug: file.replace(/\.md$/, ''),
      title: data.title,
      order: Number(data.order) || 99,
      html: content.trim() ? marked.parse(content) : null
    };
  })
  .sort((a, b) => a.order - b.order);

export const pageUrl = (lang, slug) => `${base}/${lang}/about${slug === 'about' ? '' : `/${slug}`}`;

export const pagesFor = (lang) =>
  PAGES.filter((p) => p.lang === lang).map((p) => ({ slug: p.slug, title: p.title, href: pageUrl(lang, p.slug) }));

export const getPage = (lang, slug) => PAGES.find((p) => p.lang === lang && p.slug === slug) || null;

export const pageSlugs = (lang) => PAGES.filter((p) => p.lang === lang).map((p) => p.slug);
