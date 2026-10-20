# 009 Published languages

Status: approved 2026-10-20

## Why

The articles exist only in German. An English or Greek visitor today gets a
start page, an overview of fifteen teasers and not a single article to read.
That looks unfinished, so the site goes out in German only for now.

English and Greek come back once the articles are written and translated one
after another. Bringing a language back has to be a switch in the
configuration, not a rebuild of templates, generator or web server.

## What

### A published flag per language

Every entry in the `languages` list of `site.json` carries `published`, `true`
or `false`. Today German is `true`, English and Greek are `false`. The
languages stay in the list; their interface texts `en.json` and `el.json`
stay in the repository.

A language without the field fails the build; there is no silent default. The
default language must be published, otherwise the build fails as well. The
other specs say "every published language" where they mean the languages the
site delivers.

### What the generator renders

The generator renders pages, the 404 page and the sitemap only for published
languages, and reads interface texts only for them.

An article file of a configured but unpublished language, for example a
`prompt-injection-en.md` in translation, is checked like any other (slug,
front matter) and then left out. A translation can thus be committed before
its language goes live. A language code that `site.json` does not configure
still fails the build.

For every unpublished language the generator removes its output directory,
`html/en/` and `html/el/` today, the way it removes stale article pages. The
committed `html/` then holds only what the site delivers.

### Header and language memory

The switcher in the header lists the published languages. With a single
published language the header has no switcher at all: no empty space, no lone
`DE`.

With a single published language the pages do not load `lang.js` either.
There is nothing to click and nowhere to send a returning visitor. A language
saved by an earlier visit (`en` or `el`) is ignored, not deleted: without the
script nobody reads it, and the script follows a saved language only if the
switcher lists it. When that language is published again, the visitor's
earlier choice applies again.

### Alternates and sitemap

Canonical and `hreflang` follow spec 003, limited to published languages. With
German alone, a page names `de` and `x-default`, both pointing to the German
page itself. No alternate points to a page the site does not deliver.

`sitemap.xml` lists only pages of published languages.

### Old addresses

The English and Greek pages were live and may be indexed or bookmarked. The
web server answers every address under `/en/` or `/el/`, and `/en` and `/el`
themselves, for which no file exists, with a `302` redirect to the same path
without the language prefix: `/en/wissen/ki-sicherheit/` leads to
`/wissen/ki-sicherheit/`, `/el/` to `/`. The query string is kept.

The redirect is temporary on purpose. A `301` would be stored by browsers and
search engines as permanent, and a browser that once saw it would keep
skipping `/en/` after English returns. A `404` or `410` would break bookmarks
and drop the pages from search results at once. With a `302`, a bookmark
reaches the same content in German, and search engines drop the old address
over time because neither sitemap nor alternates name it anymore. When the
language returns, sitemap and alternates bring it back.

The redirect applies only when the file is missing. Once a language is
published again, its pages exist and the web server delivers them; its
configuration does not change. A single page missing under a published
prefix then also leads to its German counterpart instead of a 404, which is
acceptable.

Redirects carry `Cache-Control: no-cache` like every redirect (spec 008).

## Constraints

- Bringing a language back is a change of its `published` value and a
  rebuild. Nothing else has to change; the switcher, `lang.js`, alternates
  and sitemap return by themselves.
- The web server lists the configured language prefixes in its redirect
  rule. Adding a fourth language adds it there; publishing or unpublishing
  one does not touch the rule.

## Out of scope

- The translations of the articles.
- An automatic language choice from the browser's language.
- Any notice that a language will follow.

## Acceptance

Checked against a local nginx serving the stamped site.

1. No page has a `lang-switch` group in the header or loads `lang.js`.
2. `just build` writes no file under `html/en/` or `html/el/`, and removes
   the ones that existed.
3. `sitemap.xml` and the 404 page contain German only; every page names
   `de` and `x-default` as its only alternates, both pointing to itself.
4. `curl -I` on `/en`, `/en/`, `/en/wissen/ki-sicherheit/` and `/el/` answers
   `302` with a `Location` on the German counterpart and
   `Cache-Control: no-cache`.
5. With `sec-lang` set to `en` in `localStorage`, a German page stays where it
   is.
6. `just check-generated` passes.
7. Setting `published` to `true` for English and rebuilding renders the
   English pages again, with a switcher of `DE` and `EN` and `lang.js`
   loaded, and the web server answers `/en/` with `200`. Setting it back to
   `false` and rebuilding returns to the state of point 1.

## Touches

Orientation for the implementation, not an instruction: the site
configuration (`published`), the generator (filter, checks, removal of output
directories), the base template (switcher and `lang.js` only with several
languages) and the nginx config (redirect of missing addresses under a
language prefix).
