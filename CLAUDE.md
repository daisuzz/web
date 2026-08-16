# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run develop   # dev server at http://localhost:8000 (also: npm start)
npm run build     # production build into public/
npm run serve     # serve the built public/ directory locally
npm run clean     # remove Gatsby's .cache/ and public/
```

There is no lint or test script configured in this repository.

`npm run build` requires `GATSBY_TRACKING_ID` to be set (even to a dummy value) or `gatsby-plugin-google-gtag` fails validation with `trackingIds[0] must not be a sparse array item`. `HATENA_NAME`/`HATENA_API_KEY` are optional locally — the Hatena/Qiita API calls in `gatsby-node.ts` are wrapped in try/catch with a timeout, so a missing or failing external API only logs a warning and does not fail the build.

## Architecture

Gatsby 5 + TypeScript personal site/blog, deployed as static assets to Cloudflare Workers (see `wrangler.jsonc`). Despite being a Gatsby site, it deliberately avoids Gatsby's usual content stack: there is no MDX, no `gatsby-transformer-remark`, and no `gatsby-source-filesystem`. Markdown content is parsed with a hand-rolled pipeline (`marked` lexer/renderer + `gray-matter` for frontmatter), and pages are created in `gatsby-node.ts`'s `createPages` by resolving content in plain TypeScript and passing the fully-parsed object straight into `pageContext` — the page templates read `pageContext` directly and do not run GraphQL queries. Keep new content types consistent with this pattern rather than introducing GraphQL-based content sourcing for them.

### Two parallel content pipelines: posts and notes

**Posts** (`/posts/<slug>`, the blog): `src/content/posts/*.md` → `src/content/loadPosts.ts` parses frontmatter (`title`, `date`) and lexes the body into a `PostBlock[]` (paragraph/heading/code/blockquote/list only — anything else `marked` emits is silently dropped) → `gatsby-node.ts` `createPages` calls `createPage({path: "/posts/<slug>", component: PostPage.tsx, context: {post}})`.

**Notes** (`/notes/<slug>`, a Zettelkasten-style personal wiki): `src/content/notes/*.md` → `src/content/loadNotes.ts` in two passes — pass 1 reads every file to build a `slug -> title` index (title is the first `# heading` line in the body, not frontmatter; frontmatter only carries `created`/`updated`), pass 2 re-parses each file with that index available. Before handing text to `marked`, `src/content/noteMarkdown.ts` preprocesses it: `[[wikilink]]` is rewritten into a normal Markdown link (or a `<span class="wikilink-missing">` if the target slug doesn't exist, with a `console.warn` at build time), and `#tag` is rewritten into a link to `/notes/tags/<tag>` (ASCII tags are lowercased, non-ASCII tags are left as-is). Both transforms operate only on the non-code regions of the source (fenced/inline code spans are split out first), so `[[...]]`/`#tag` inside code blocks are left untouched. ` ```mermaid ` code fences become a distinct `{type: "mermaid"}` block instead of a regular code block. `loadNotes()` also computes the reverse-link graph (`backlinks`) and a tag index across all notes. `gatsby-node.ts` uses these to create `/notes/<slug>` (`NotePage.tsx`), `/notes/` (`NotesIndexPage.tsx`), `/notes/tags/` (`NoteTagsIndexPage.tsx`), and `/notes/tags/<tag>` (`NoteTagPage.tsx`). Mermaid diagrams render client-side only: `src/components/organisms/Mermaid.tsx` dynamically `import("mermaid")` inside `useEffect`, so the `mermaid` bundle is only fetched when a note page actually contains a mermaid block. Notes are not sourced into GraphQL and are not part of the RSS feed — they're an intentionally separate namespace from posts.

### GraphQL nodes vs. pageContext

`sourceNodes` in `gatsby-node.ts` creates three custom node types by calling `createNode()` directly (not via `gatsby-source-filesystem`): `SitePosts` (from `loadPosts()`), `QiitaPosts` (fetched live from the Qiita API), and `HatenaPosts` (fetched live from the Hatena Blog Atom feed, paginated recursively by following `rel=next` links). `allSitePosts`/`allQiitaPosts`/`allHatenaPosts` are the only GraphQL queries in the app, used by `src/pages/index.tsx` (the home "writing" list) and the `gatsby-plugin-feed` RSS query in `gatsby-config.ts`. Individual post pages, and the entire notes feature, bypass GraphQL entirely.

### Styling and theming

CSS Modules (`*.module.css`, imported as `import * as style from "./X.module.css"` with `// @ts-ignore` since there's no generated type declaration for them) combined with MUI's `ThemeProvider`/`CssBaseline`. `src/assets/theme.ts` defines a single hardcoded dark theme (there is no light mode or theme toggle anywhere in the codebase) and exposes the palette as CSS custom properties (`--color-*`) that the `.module.css` files consume — reuse these variables rather than hardcoding colors.

### Head tags / SEO

There is no `react-helmet` / `gatsby-plugin-react-helmet`. `src/components/Layout.tsx` sets `<title>`, `<meta>`, OG/Twitter tags, canonical link, and JSON-LD structured data directly as JSX, relying on Gatsby 5's built-in `<head>` support.

### Deployment

`.github/workflows/deploy-cloudflare-workers.yml` runs `npm run build` and deploys the `public/` directory to Cloudflare Workers static assets on every push to `main`, and additionally on a daily cron — the cron run exists to refresh the live Qiita/Hatena content even when no code has changed. `preview-cloudflare-workers.yml` deploys PR branches to preview URLs. Production access is restricted at Cloudflare's edge to Japan/US traffic; preview URLs are protected by Cloudflare Access (see `README.md` for details).
