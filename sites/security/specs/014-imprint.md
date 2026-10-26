# 014 Imprint

Status: approved 2026-10-26, rewritten 2026-10-26 for the central legal
notice

## Why

security.charemma.de is the business site of a freelance penetration tester.
A German business website has to name its provider (§ 5 DDG), and a site
without a legal notice reads like a hobby project. The site is meant to show
a real, accountable business, so the legal notice is part of that proof.

The three sites of the same provider share one legal notice on
`charemma.de` (`sites/www/specs/001-imprint.md`). It names all three
domains, and keeping the provider details in one place keeps them correct.
security.charemma.de therefore renders no legal notice of its own; it links
to the central one from the footer of every page.

The first version of this spec specified a legal notice page on this site
with its values in `site.json`. It was never implemented; this version
replaces it.

## What

### Footer link

- Every page that carries the footer links to
  `https://charemma.de/impressum/`, in every language. The link is
  absolute, because the page is on another host.
- The link sits directly before the privacy link: GitHub, charemma.de,
  legal notice, privacy, version.
- The label is `Impressum` in German and `Legal notice` in English; Greek
  takes its label from `el.json`. The label is an interface text in
  `src/i18n/<lang>.json` under the key `imprint`. Those files are `content`;
  the implementation adds the key on the user's explicit instruction.
- `charemma.de` is German only, so the English and Greek links lead to the
  German page. The link carries `hreflang="de"` in every language, so
  browsers and assistive technology know the target language. There is no
  translated legal notice and no hint text beyond the label.

### Not on this site

- No legal notice page, no page key `imprint`, no `imprint` path segments,
  no sitemap entry and no alternates for it.
- No `operator` object in `site.json`: the provider details live on the
  legal notice page of `charemma.de`.
- `build.py` gains no check for provider details.

### Moved to the charemma.de spec

The following parts of the first version now live in
`sites/www/specs/001-imprint.md` and apply to the central legal notice:

- content and order of the legal notice;
- which values it states, that none is invented or derived, and that the
  tax number is never published;
- that the notice is published only with a complete postal address;
- what is left out (insurance, chamber, dispute resolution, disclaimers,
  references) and why;
- the legal assumptions, extended by the assumption that a footer link to
  one notice naming all domains satisfies § 5 DDG.

## Assumptions

This spec was written without legal advice. It rests on the assumptions of
`sites/www/specs/001-imprint.md`, in particular that a clearly labelled
footer link to the central legal notice, also with the English label on the
English pages, satisfies § 5 DDG for this site.

## Constraints

- The link goes live only once `https://charemma.de/impressum/` is
  published; no deployed page links to a missing legal notice.
- The addresses of the existing pages and the sitemap do not change.
- Rendering stays deterministic.

## Out of scope

- The legal notice itself: content, values and publication
  (`sites/www/specs/001-imprint.md`).
- The postal address on the privacy page (spec `014-visitor-statistics.md`
  decides).
- Publishing Greek.

## Acceptance

Checked against the generator output and a local nginx serving the stamped
site.

1. `just build` renders every page's footer with a link to
   `https://charemma.de/impressum/` directly before the privacy link,
   labelled `Impressum` on German pages and `Legal notice` on English
   pages, carrying `hreflang="de"`.
2. `just build` renders no `html/impressum/` and no `html/en/legal-notice/`;
   `sitemap.xml` names no legal notice.
3. `site.json` has no `operator` object and no `imprint` page entry.
4. `just check-generated` passes.

## Touches

Orientation for the implementation, not an instruction: the page skeleton
(`base.html.j2` footer link), the interface texts (`de.json`, `en.json`,
`el.json`, key `imprint`, on the user's instruction), the generated pages,
and the site registry row of `base.html.j2`, whose Dependencies gain
`014-imprint.md`.
