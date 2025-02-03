import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkWikiLink, { getPermalinks } from '@portaljs/remark-wiki-link';


export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        pathFormat: 'obsidian-absolute',
        wikiLinkResolver: (slug) => [configureSlug(slug)]
      }]
    ]
  }
});

function configureSlug(slug: string) {
  let newslug = slug.toLowerCase().replaceAll(' ', '-');
  return ['legendarium/' + newslug];
}