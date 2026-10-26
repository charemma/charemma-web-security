# 013 Localized paths

Status: approved 2026-10-26

## Why

English pages live under German path segments:
`/en/wissen/ki-sicherheit/prompt-injection/`, `/en/datenschutz/`. An English
reader sees an address in a language they did not choose, and a shared link
looks like a German page. Each language gets its own path segments instead.

English is not published right now (spec 009). Changing the English addresses
before it returns means they do not change again right after the launch. The
segments are configuration, so Greek gets its own later without a change to
generator, templates or web server.

## What

### Path segments per language

Every entry in the `languages` list of `site.json` carries `paths`: one path
per page key, the part of the address after the language prefix. The page
keys are the pages of `site.json` that have a path segment:

| Page key | `de` | `en` | `el` |
| -------- | ---- | ---- | ---- |
| `knowledge` | `wissen/ki-sicherheit/` | `knowledge/ai-security/` | `wissen/ki-sicherheit/` |
| `privacy` | `datenschutz/` | `privacy/` | `datenschutz/` |

The start page has no path segment and no key; it stays at the bare prefix.
The 404 page has no address of its own and is not affected.

German keeps its addresses. Greek keeps the German segments, as today, until
its own segments are decided; that decision has to fall before Greek is
published and is not part of this spec. The table is the content of
`site.json` at the time of writing; `site.json` is the source, not this spec.

A path consists of lowercase ASCII letters, digits and dashes in segments
separated by `/`, and ends with `/`. Non-Latin scripts would end up
percent-encoded in links and logs; a language with a non-Latin script uses a
transliteration or another Latin form. Within one language, two keys do not
share a path, and no path of a key equals the default language's path of
another key.

A language without `paths`, or with a key missing, fails the build. There is
no silent fallback to the German segments.

### Article addresses

An article lives at the knowledge path of its language plus its slug:
`/<prefix><knowledge path><slug>/`, for example
`/en/knowledge/ai-security/prompt-injection/`. Slugs are the same in every
language (spec 002); translating slugs is not part of this spec.

### Links between pages

Every link the generator writes to a page of the site uses the path of the
page's own language: back links, the knowledge link and the featured cards on
the start page, the overview cards, the privacy link in the footer. Section
anchors on the start page (`#wissen` and the others) are fragment
identifiers, not path segments, and stay as they are.

### Language versions of one page

The language versions of a page are the same page key, or for articles the
same slug, in different languages, each at its own address. Canonical,
`hreflang`, the sitemap and the language switcher pair them that way and not
by an identical path:

- The canonical address of a page is its own address in its own language.
- The alternates name each published language that has the page, at that
  language's address, plus `x-default` at the address of the language spec 003
  picks for it.
- The sitemap lists every page once per language with the same alternates.
- A switcher entry leads to the same page in the target language at its
  address. For an article missing in the target language, it leads to that
  language's knowledge overview at its address (spec 003).

The language memory stores a language code, not an address. `lang.js` follows
the switcher links and needs no change.

### Former addresses

Before this spec, every language used the German segments. The English and
Greek pages under them were live before spec 009 and may be indexed or
bookmarked.

Under the prefix of every language other than the default, an address that
starts with the default language's path of a key, where that language has a
different path, is answered with a `301` to the same address with the
language's own path. The rest of the address and the query string are kept:

- `/en/wissen/ki-sicherheit/` leads to `/en/knowledge/ai-security/`.
- `/en/wissen/ki-sicherheit/prompt-injection/` leads to
  `/en/knowledge/ai-security/prompt-injection/`.
- `/en/datenschutz/` leads to `/en/privacy/`.

The redirect is permanent on purpose. Unlike the addresses of an unpublished
language in spec 009, these addresses never return: the language keeps its
own segments whether it is published or not. A `301` tells search engines to
move their entry to the new address and lets browsers skip the old one.

The rule applies whether the language is published or not, and before the
rule of spec 009. While English is unpublished, a former address thus takes
two steps: the `301` to the English address, then spec 009's `302` to the
German page.

### Addresses of an unpublished language

Spec 009 redirects a missing address under a language prefix to its German
counterpart. With localized segments, dropping the prefix is no longer
enough: `/en/knowledge/ai-security/` without its prefix is no German address.
The `302` therefore leads to the same page in the default language at the
default language's address: the prefix is dropped and the language's path of
a key is replaced by the default language's path of the same key.

- `/en/knowledge/ai-security/prompt-injection/` leads to
  `/wissen/ki-sicherheit/prompt-injection/`.
- `/en/privacy/` leads to `/datenschutz/`.
- `/en/` and `/en` lead to `/`.

An address under the prefix that starts with no path of the language keeps
the rule of spec 009: the prefix is dropped, the rest is kept.

Status code, caching and relative `Location` follow spec 009 and spec 008 for
both redirects: `Cache-Control: no-cache`, a path without scheme and host.

### Where the web server takes the paths from

The web server configuration names no path segment and no language prefix.
The generator writes the prefixes and the path pairs of every configured
language, published or not, from `site.json` into a file the web server
includes. Changing a path or adding a language is a change in `site.json`
and a rebuild; the web server configuration does not change. The include is
generator output like the pages, kept committed and covered by
`just check-generated`.

## Constraints

- Paths of a published language do not change. A change after publication
  would need the former-address rule for that change as well, which this spec
  does not provide.
- The German addresses do not change.
- `published` in `site.json` and spec 009's decision on which languages are
  published stay untouched.
- Rendering stays deterministic; the generated include changes only when
  `site.json` changes.

## Out of scope

- Translated slugs.
- The Greek path segments.
- Translated section anchors on the start page.
- Publishing English (spec 009 decides).

## Acceptance

Checked against a local nginx serving the stamped site, with English set to
published in a working copy for points 1 to 4 and 6.

1. `just build` renders `/en/knowledge/ai-security/`, `/en/privacy/` and the
   English articles under `/en/knowledge/ai-security/<slug>/`, and nothing
   under `html/en/wissen/` or `html/en/datenschutz/`. The German pages are
   unchanged in path.
2. The English prompt injection article names a canonical
   `https://security.charemma.de/en/knowledge/ai-security/prompt-injection/`
   and alternates `de` at `/wissen/ki-sicherheit/prompt-injection/`, `en` at
   `/en/knowledge/ai-security/prompt-injection/` and `x-default` at the German
   address; the German article names the same alternates.
3. `sitemap.xml` lists the English article under its English address with the
   same alternates as in point 2.
4. On the German privacy page, the `EN` switcher entry leads to
   `/en/privacy/`; on the English overview the footer links to
   `/en/privacy/` and the cards of English articles to
   `/en/knowledge/ai-security/<slug>/`. On the German supply chain article,
   which has no English version, the `EN` entry leads to
   `/en/knowledge/ai-security/`.
5. With English unpublished (the committed state), `curl -I` answers
   `/en/wissen/ki-sicherheit/prompt-injection/?a=1` with `301` and
   `Location: /en/knowledge/ai-security/prompt-injection/?a=1`; that address
   with `302` and `Location: /wissen/ki-sicherheit/prompt-injection/?a=1`;
   `/en/datenschutz/` with `301` to `/en/privacy/`, which answers `302` to
   `/datenschutz/`. Every redirect carries `Cache-Control: no-cache` and a
   relative `Location`.
6. With English published, `/en/wissen/ki-sicherheit/` answers `301` to
   `/en/knowledge/ai-security/`, which answers `200`.
7. `/el/wissen/ki-sicherheit/` answers `302` to `/wissen/ki-sicherheit/`, as
   before, without a `301`.
8. Removing the `privacy` key from the English `paths` makes `just build`
   fail; so does a path with an uppercase letter or without the closing `/`.
9. `default.conf` contains neither `wissen`, `datenschutz`, `knowledge`,
   `privacy` nor `en` or `el`, and `just check-generated` passes.

## Touches

Orientation for the implementation, not an instruction: the site
configuration (`paths` per language, page keys instead of the global
`knowledge.path` and `privacy_path`), the generator (`build.py`: addresses,
alternates, switcher, sitemap, links and stale-directory removal per
language, checks of `paths`, writing the web server include), the templates
that link to other pages (`base.html.j2` footer, `wissen.html.j2`,
`index.html.j2`, `article.html.j2`, `datenschutz.html.j2`), the web server
configuration (`default.conf`: include instead of the hand-written prefix
rule), `Dockerfile` (copy the include), `justfile` (`check-generated` covers
the include) and specs 003 and 009 (addresses, old addresses, the prefix
constraint).
