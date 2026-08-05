// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// GitHub Pages deployment target. `workflow-engine.github.io` is a GitHub
// *user/org site* (repo name === "<org>.github.io"), which GitHub Pages
// always serves at the domain root rather than under "/<repo>/" the way a
// project site would — hence baseUrl below is '/', not `/${GITHUB_REPO}/`.
// If this docs site ever moves to an ordinary project repo, baseUrl must
// switch back to `/${GITHUB_REPO}/`.
const GITHUB_ORG = 'qanna-rsa';
const GITHUB_REPO = 'workflow-engine.github.io';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Workflow Engine',
  tagline: 'A headless workflow automation engine for Laravel',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    faster: true,
  },

  // Set the production url of your site here
  url: `https://${GITHUB_ORG}.github.io`,
  // User/org site (see note above) -> served at the root.
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: GITHUB_ORG,
  projectName: GITHUB_REPO,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // The Markdown docs live at the repository root (one level up
          // from this Docusaurus project) and are treated as the single
          // source of truth. This project only ever *reads* them.
          path: '../',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          exclude: [
            // Docusaurus' own defaults (files/dirs starting with `_`,
            // tests, etc.) — repeated explicitly because setting `exclude`
            // overrides the built-in list. This is what keeps `_nav.md`
            // itself out of the doc set while still driving the sidebar.
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            // The Docusaurus app itself lives inside the docs root
            // (`../` = repo root), so it must be excluded from the doc set.
            'website/**',
            '.github/**',
          ],
          editUrl: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/edit/main/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Workflow Engine',
        logo: {
          alt: 'Workflow Engine logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/docs/examples/first-workflow',
            position: 'left',
            label: 'Examples',
          },
          {
            to: '/docs/api/facade',
            position: 'left',
            label: 'API',
          },
          {
            href: `https://github.com/${GITHUB_ORG}/workflow-engine`,
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {label: 'Introduction', to: '/docs/introduction'},
              {label: 'Installation', to: '/docs/installation'},
              {label: 'Configuration', to: '/docs/configuration'},
              {label: 'Quick Start', to: '/docs/quickstart'},
            ],
          },
          {
            title: 'Reference',
            items: [
              {label: 'Nodes', to: '/docs/nodes/overview'},
              {label: 'Triggers', to: '/docs/triggers/overview'},
              {label: 'Workflow Facade', to: '/docs/api/facade'},
              {label: 'Contracts', to: '/docs/api/contracts'},
            ],
          },
          {
            title: 'Learn More',
            items: [
              {label: 'Console', to: '/docs/console/overview'},
              {label: 'Testing', to: '/docs/testing/overview'},
              {label: 'Advanced', to: '/docs/advanced/advanced-configuration'},
              {label: 'Examples', to: '/docs/examples/first-workflow'},
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: `https://github.com/${GITHUB_ORG}/workflow-engine`,
              },
              {
                label: 'Packagist',
                href: 'https://packagist.org/packages/qanna-rsa/workflow-engine',
              },
              {
                label: 'Issues',
                href: `https://github.com/${GITHUB_ORG}/workflow-engine/issues`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Qanna. Workflow Engine documentation built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['php', 'json', 'bash', 'yaml', 'markup'],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
        ],
      },
      // --- Algolia DocSearch -----------------------------------------------
      // Not configured yet. Once this project is registered with Algolia
      // DocSearch (https://docsearch.algolia.com/apply/) or a self-hosted
      // index is available, replace the block below with the real
      // appId / apiKey / indexName and remove the `algolia: undefined` line.
      //
      // algolia: {
      //   appId: 'YOUR_APP_ID',
      //   apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
      //   indexName: 'workflow-engine',
      //   contextualSearch: true,
      // },
      algolia: undefined,
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),
};

export default config;
