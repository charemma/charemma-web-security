# 003 Knowledge articles

Status: approved 2026-10-17, amended 2026-10-19

## Why

The knowledge overview lists fifteen topics, and every card ends in the same
dead end: there is no page behind it. The topics are the professional core of
the site, so each one gets its own article, written in waves, German first.

An article has to appear the moment it is finished, in the language it is
finished in, without touching any list by hand. The overview, the start page,
the sitemap and the language links derive what exists from the article files
themselves. A missing translation is neither announced nor dated; the topic
is simply a teaser there until the translation lands.

## What

### Article files

One article is one Markdown file per topic and language, named
`<slug>-<lang>.md` after the topic slug from `topics.json` and the language
code from `site.json`, placed in `src/articles/`. `prompt-injection-de.md` is
the German article on LLM01. A file whose topic a spec covers is registered
as `article` and written from that spec; a file without such a spec is
registered as `content` like the other content files.

A file whose slug matches no topic fails the build, like a dangling
identifier in the start page selection. A topic without any article file is
allowed; it stays a teaser in every language.

### Front matter

Each file starts with YAML front matter between `---` lines:

| Field | Required | Meaning |
| ----- | -------- | ------- |
| `lead` | yes | One or two sentences under the title; also the page's meta description |
| `updated` | yes | Date of the last substantive revision, `YYYY-MM-DD` |
| `draft` | no | `true` keeps the article out of the build; default `false` |
| `sources` | no | List of entries with `label` and optional `url`, rendered as the closing source list |

The front matter carries no title and no summary. The heading of the article
is the topic title from `topics.json`, so the card and the page never
disagree, as spec 002 requires.

### Publication

An article is published in a language when its file exists and `draft` is
not `true`. Nothing else switches it on. The `published` flag in
`topics.json` is removed; spec 002 no longer lists a publication state among
the topic fields.

A draft is treated exactly like a missing file: no page, no link, no sitemap
entry. To preview a draft locally, set `draft` to `false` in the working
copy.

### Article body

The body is Markdown in CommonMark form plus two extensions the articles
need: tables and fenced code blocks. Headings in the body start at the
second level; the first level is the topic title. Raw HTML in the body is
not rendered. Code blocks are shown in the monospace font without syntax
highlighting; long lines scroll inside the block instead of widening the
page. Wide tables scroll horizontally on narrow screens for the same reason.

### Page address and head

The article lives at `/<prefix>wissen/ki-sicherheit/<slug>/`, the address
the overview card already points to, in every language that has the
article. The page title is `<topic title> · <overview section title> ·
security.charemma.de`, following the pattern of the overview page. The meta
description is the lead.

Canonical and `hreflang` follow the other pages, with one difference: the
alternates name only the languages in which the article exists, plus
`x-default`. `x-default` points to the German article when it exists,
otherwise to the first existing language in the order of `site.json`.

### Page structure

The article page has no design of its own and follows the overview page:
light page style, same header, same footer with the version entry from spec
001, same reading width as the overview head. From top to bottom:

1. Back link to the overview page of the same language, in the place and
   style of the overview's back link to the start page.
2. Eyebrow in the style of the overview's: the knowledge pill, then the
   group title and the identifier, for example
   `LLM-Anwendungen · LLM01:2026`.
3. The topic title as the page heading, in the style of the overview title.
4. The lead, in the style of the overview lead.
5. The revision date from `updated`, as a short muted line with a localized
   label, the date itself in ISO form in every language.
6. The rendered body: headings, paragraphs, lists, code blocks and tables in
   the light page's type and colors; links in the accent color like the
   other links on light pages. An article with a step animation per spec
   006 shows it inside the body, at the position its marker names.
7. The source list under a localized heading, one entry per source, the
   label linked when a `url` is given. Omitted when `sources` is empty.
8. The call to action from the start page, unchanged: same title, same
   button, same mail link.

No table of contents, no reading time, no previous and next links. The back
link and the header are the navigation.

#### Presentation

The head stacks five text styles: back link, eyebrow, title, lead and
revision date. With one uniform gap between them the head looks compressed,
and the revision date reads as a sixth element of equal weight although it
is metadata of the lead. The lead and the body inherit the overview's text
color, which was chosen for short card texts next to a dark title. At
article length and reading size it is pale: 4.5:1 against the light
background, and the lead's light weight thins it further. These rules apply
to every article page:

- The revision date sits directly under the lead as its metadata, with half
  the gap that separates the other head elements.
- The gap between the head and the body is larger than any gap inside the
  head, so the body reads as a new block.
- Lead and body text are darker than the card text of the overview: at
  least 7:1 contrast against the light page background. The lead uses the
  normal font weight.
- Overview and start page keep their current spacing, colors and weights;
  the changes are scoped to the article page.

### Language switcher

The switcher in the header lists all languages, as on every page. For a
language that has this article, the entry leads to the article in that
language. For a language without it, the entry leads to the overview page
of that language, so a reader who switches lands on the list of topics and
not on a missing page. The saved-language redirect in `lang.js` then follows
the same links and needs no change.

### Overview and start page

On the overview page, a topic with an article in the page's language keeps
its card as today, linked to the article. A topic without one shows the card
as a teaser: identifier, title and summary, no link, no date, no
announcement. The "article follows" label disappears.

On the start page, a featured card links to the article when it exists in
the page's language and to the topic's anchor on the overview page
otherwise, as today.

### Sitemap

Every published article is in `sitemap.xml`, one entry per existing
language, with alternates for the existing languages and `x-default` as
defined above. Articles that do not exist in a language have no entry for
it.

### Room for a third group

The article page takes group title and identifier from the topic entry and
the interface texts; nothing in it counts groups or knows their names. A
later group such as the OWASP Top 10 for Agentic Applications adds topics to
`topics.json` and a group entry to the interface texts and gets article
pages without a change to this spec.

## Constraints

- The generated pages in `html/` stay committed; article pages are
  generator output like the other pages and are not registered individually.
- Rendering needs no network access and no JavaScript on the reader's side
  beyond what every page already loads. The one exception is the step
  animation of spec 006: an article that has one loads its player, and
  reads completely without it.
- Slugs of published articles do not change (spec 002); the article file is
  renamed only together with the slug, before the first publication.
- The committed `html/` must not depend on the build machine: Markdown
  rendering has to be deterministic.

## Out of scope

- Writing the articles. The first German article on LLM01 is the acceptance
  run of this spec, not its deliverable.
- Preview of drafts, syntax highlighting, a table of contents, reading time,
  previous and next links, an RSS feed and search. Each is a later spec if
  wanted.
- Images and diagrams inside articles. Until a spec covers them, articles
  are text, code and tables, plus the step animation that spec 006 defines.
- The third topic group itself.

## Acceptance

1. With `prompt-injection-de.md` present and not a draft, `just build`
   renders `/wissen/ki-sicherheit/prompt-injection/` with back link,
   eyebrow `LLM-Anwendungen · LLM01:2026`, title, lead, date, body, source
   list and the start page's call to action, in the light page style.
2. The German overview links the LLM01 card to that page; the English and
   Greek overviews show the LLM01 card without a link and without any
   label; all other cards are teasers in all three languages.
3. The head of the article page carries a canonical link, `hreflang="de"`
   and `hreflang="x-default"`, both pointing to the German page, and no
   English or Greek alternate.
4. On the article page, the English and Greek entries of the language
   switcher lead to `/en/wissen/ki-sicherheit/` and
   `/el/wissen/ki-sicherheit/`.
5. `sitemap.xml` contains the German article once, with alternates for
   `de` and `x-default` only.
6. Setting `draft: true` in the file and rebuilding removes the page, the
   link and the sitemap entry, and leaves everything else unchanged.
7. Renaming the file to a slug that matches no topic makes `just build`
   fail.
8. `topics.json` has no `published` field, and `just check-generated`
   passes.

## Touches

Orientation for the implementation, not an instruction: the generator
(`build.py`: read article files, render Markdown, derive publication state,
alternates and sitemap entries), a new article template next to the
overview template, the overview and start page templates (teaser without
link), the stylesheet (article body typography, code and table overflow),
the interface texts (back link, date label, source heading), `topics.json`
(drop `published`) and spec 002 (field list).
