# 008 Browser caching

Status: approved 2026-10-20

## Why

After a deploy, the browser keeps showing the old site. Two settings cause it.
Stylesheets and scripts are served for seven days from fixed addresses such as
`/assets/css/main.css`; when the file changes, the address does not, so the
browser has no reason to fetch it again. HTML pages carry no `Cache-Control`
at all, and browsers then cache them for a guessed time without asking the
server.

A deploy has to reach the browser on the next page load. Unchanged files
should still come from the cache, so that a visit after a deploy costs little
more than one that follows no deploy.

## What

### Two kinds of address

Every file the site delivers is fetched either from an address that changes
with its content or from one that does not.

- A **versioned** address carries the content in its name: a stylesheet or
  script referenced as `/assets/css/main.css?v=<hash>`. A new content gets a
  new address, so the old one may be cached for as long as the browser likes.
- Every other address is **fixed**. A browser may keep its response only if
  it asks the server before using it again, or, for files that practically
  never change, for a bounded time.

### Cache rule per kind of response

| Response | `Cache-Control` |
| -------- | --------------- |
| HTML pages, the 404 page, `sitemap.xml`, `robots.txt`, `security.txt`, `favicon.ico`, redirects | `no-cache` |
| Stylesheets and scripts under a versioned address | `public, max-age=31536000, immutable` |
| Stylesheets and scripts under a fixed address | `no-cache` |
| Fonts and `apple-touch-icon.png` | `public, max-age=604800` |
| `/version` | as spec 001 requires: never from a long-lived cache |

`no-cache` does not forbid caching. The browser keeps the response and asks
the server before each use; an unchanged file costs one `304 Not Modified`
without a body. HTML changes on every deploy anyway, because the footer names
the commit (spec 001).

A stylesheet or script requested without its version gets `no-cache`, not a
lifetime. Old pages still sitting in a browser, and links from elsewhere,
then receive the current file as well. A long lifetime is only ever granted
through a versioned address.

The 404 page carries its rule like every other page, although it answers
with status 404.

The cache rules leave every other response header untouched; the security
headers stay on every response.

### The version in the address

The generator appends `?v=` and the first 10 hexadecimal characters of the
SHA-256 of the file's content to every reference to a stylesheet or script
it renders into a page. Today these are `main.css`, `lang.js`,
`engagement.js` and `player.js`.

The hash comes from the content, not from the commit:

- A file that did not change keeps its address across deploys and stays in
  the browser's cache.
- Rendering stays deterministic; `html/` does not change between commits that
  leave the files alone, and `check-generated` keeps passing.
- Stamping the version identifier into the pages (spec 001) touches only
  HTML, so the hashes in the pages stay correct in the image.

A reference to a stylesheet or script that does not exist fails the build.

The version is a query string, not part of the file name
(`main.<hash>.css`). A name would make the generator write renamed copies
into `html/assets/` and clean up old ones, and `main.css` would turn from a
maintained file into generator output. The server ignores the query string
when it looks up the file, so no file is added.

### Fonts and images

Fonts and `apple-touch-icon.png` are not versioned. The stylesheet refers to
the fonts by relative `url()`, and the page head preloads two of them by the
same address. Versioning them would require the generator to rewrite the
stylesheet and the preload links with identical hashes, or the browser loads
each preloaded font twice. Their names already describe their content
(family, subset, weight), and they change practically never.

A changed font or image therefore gets a new file name; it is never replaced
under its old name. With that rule, seven days do no harm.

## Constraints

- A stylesheet or script must not load another stylesheet or script by a
  fixed address (an `@import`, a module `import`, a `fetch`). Such a file
  would not be versioned and would fall back to `no-cache`; it would work,
  but defeat the cache. A later need for it is a change to this spec.
- The committed pages in `html/` stay independent of the commit, as spec 001
  requires; the hash is part of the content, not of the build.
- The cache rules live in the web server configuration as one table of rules
  with one place that applies them, so that a reader sees the whole policy at
  once and no rule silently drops another header.

## Out of scope

- The short window of a rolling update. During a deploy, old and new pod
  serve side by side for a few seconds. A new page may then request
  `main.css?v=<new>` from the old pod and cache the old file for a year under
  the new address, until the next change to that file. The window is short
  and the damage heals itself. If it ever shows, a `Recreate` deployment
  strategy or hashes in file names close it; each is a later change.
- Caching at a CDN or proxy in front of the site. None exists today.
- A service worker or offline use.

## Acceptance

Checked with `curl -I` against a local nginx serving the stamped site, and
against the live site after deploy.

1. `/`, `/en/`, `/wissen/ki-sicherheit/`, an article page, a missing address
   (404), `/sitemap.xml`, `/robots.txt`, `/.well-known/security.txt`,
   `/favicon.ico` and `/security.txt` (redirect) answer with
   `Cache-Control: no-cache`.
2. `/assets/css/main.css?v=<hash>` and the scripts with their `?v=` answer
   with `Cache-Control: public, max-age=31536000, immutable`; the same files
   without `?v=` answer with `Cache-Control: no-cache`.
3. A font under `/assets/fonts/` and `/assets/apple-touch-icon.png` answer
   with `Cache-Control: public, max-age=604800`.
4. `/version` answers with `Cache-Control: no-cache` and the identifier as
   spec 001 requires.
5. The security headers (`Content-Security-Policy`,
   `X-Content-Type-Options` and the others) appear on the responses of
   points 1 to 4, including the 404.
6. Every page references `main.css`, `lang.js`, and where it loads them
   `engagement.js` and `player.js`, with `?v=` and 10 hexadecimal
   characters that match the file's content.
7. After a change to `main.css` and `just build`, every page carries a new
   `?v=` for `main.css`; the script references keep theirs.
8. `just check-generated` passes.

## Touches

Orientation for the implementation, not an instruction: the generator
(compute the hash, offer it to the templates), the base, start page and
article templates (versioned references), and the nginx config (cache
rules).
