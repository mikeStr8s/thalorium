import type { Root } from 'mdast';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkWikiLink from '@portaljs/remark-wiki-link';
import remarkDirective from 'remark-directive';
import {visit} from 'unist-util-visit';
import {h} from 'hastscript';


export default defineConfig({
  site: 'https://www.thalorium.com',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        pathFormat: 'obsidian-absolute',
        wikiLinkResolver: (slug) => [configureSlug(slug)]
      }],
      [remarkDirective, {}],
      [stickynoteBlockPlugin, {}]
    ],
  }
});

function configureSlug(slug: string) {
  let newslug = slug.toLowerCase().replaceAll(' ', '-');
  return ['legendarium/' + newslug];
}


function stickynoteBlockPlugin() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        if (node.name !== 'stickynote') {
          return;
        }

        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        node.attributes = node.attributes || {};
        node.attributes.class = 'stickynote';

        data.hName = tagName;
        data.hProperties = h(tagName, node.attributes || {}).properties;
      }
    })
  }
}