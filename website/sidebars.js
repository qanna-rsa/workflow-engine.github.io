// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// `_nav.md`, at the repository root, is the single source of truth for
// documentation navigation (see docusaurus.config.js, where the same
// directory is set as the docs plugin's content root). This parses it into
// a Docusaurus sidebar so the nav never has to be duplicated by hand here.
//
// Supported shape:
//
//   # Title (ignored)
//
//   - [Label](relative/path.md)   <- top-level sidebar item
//
//   ## Category Name              <- starts a collapsible category
//
//   - [Label](relative/path.md)   <- item inside that category
function sidebarFromNav(navPath) {
  const source = fs.readFileSync(navPath, 'utf-8');
  const lines = source.split('\n');

  /** @type {Array<string | {type: 'category', label: string, collapsed: boolean, items: string[]}>} */
  const sidebar = [];
  let currentCategory = null;

  const linkPattern = /^-\s*\[(.+?)\]\((.+?)\)\s*$/;
  const categoryPattern = /^##\s+(.+?)\s*$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const categoryMatch = line.match(categoryPattern);
    if (categoryMatch) {
      currentCategory = {
        type: 'category',
        label: categoryMatch[1],
        collapsed: false,
        items: [],
      };
      sidebar.push(currentCategory);
      continue;
    }

    const linkMatch = line.match(linkPattern);
    if (linkMatch) {
      const relativePath = linkMatch[2];
      const docId = relativePath.replace(/\.mdx?$/, '');
      if (currentCategory) {
        currentCategory.items.push(docId);
      } else {
        sidebar.push(docId);
      }
    }
  }

  return sidebar;
}

const navPath = path.resolve(__dirname, '..', '_nav.md');

const sidebars = {
  docs: sidebarFromNav(navPath),
};

export default sidebars;
