// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkWikiLink from '@portaljs/remark-wiki-link';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        pathFormat: 'obsidian-short',
      }]
    ]
  }
});