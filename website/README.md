# Workflow Engine docs site

This is the [Docusaurus](https://docusaurus.io) project that renders the
documentation living in the repository root (`../*.md` and `../*/**.md`).
It doesn't own that content — it only reads it. The Markdown files
themselves, and their navigation order (`../_nav.md`), stay the single
source of truth; see [`sidebars.js`](./sidebars.js), which parses
`_nav.md` into the sidebar at build time.

## Local development

```bash
npm install
npm start
```

Starts a hot-reloading dev server at `http://localhost:3000/workflow-engine.github.io/`.

## Build

```bash
npm run build
```

Outputs static files to `build/`. Verify the production build locally with:

```bash
npm run serve
```

## Deployment

Pushes to `main` are built and published automatically by
[`../.github/workflows/deploy-docs.yml`](../.github/workflows/deploy-docs.yml)
via GitHub Actions + GitHub Pages. In the repo's **Settings → Pages**, set
the build source to **GitHub Actions** once.

A manual fallback (`docusaurus deploy`, pushes `build/` to the `gh-pages`
branch over git) is also available:

```bash
GIT_USER=<your-username> npm run deploy
```

## Search

Algolia DocSearch isn't wired up yet. The placeholder and instructions live
in `docusaurus.config.js` next to the commented-out `algolia` block in
`themeConfig` — apply for indexing at https://docsearch.algolia.com/apply/,
then fill in `appId` / `apiKey` / `indexName` there.

## Adding new documentation

Add the Markdown file at the repo root (or one of its subfolders) as usual,
then add one line to `../_nav.md` pointing at it. The sidebar picks it up
automatically — nothing in `website/` needs to change.

## Future additions

The project is deliberately left in a state where these don't require
restructuring:

- **Versioned docs** — the `docs` plugin instance in `docusaurus.config.js`
  already owns a single `routeBasePath`; run `docusaurus docs:version <x.y>`
  when the package needs its first cut.
- **API reference** — add a second `@docusaurus/plugin-content-docs`
  instance (its own `id`/`path`/`routeBasePath`), or a generator plugin
  (e.g. phpDocumentor/OpenAPI output), without touching the existing docs.
- **Blog** — the classic preset's `blog` option is currently `false`;
  swap it for a config object to turn it back on.
- **Plugins / custom theme** — add to the (currently absent) `plugins`
  array, or `npm run swizzle` a component, independently of the docs setup.
- **Search** — see the commented-out `algolia` block in
  `docusaurus.config.js`.
