# 001 Imprint link

Status: approved 2026-10-26

## Why

A German business website has to name its provider (§ 5 DDG). The three
sites of the same provider share one legal notice on `charemma.de`
(`sites/www/specs/001-imprint.md`), which names all three domains.
ai.charemma.de therefore has no legal notice of its own; it links to the
central one from the footer of every page.

## What

### Footer link

- Every page of the site that carries a footer links to
  `https://charemma.de/impressum/`. The link is absolute, because the page
  is on another host.
- The label is `Impressum`. The site is German only, like the target page.
- The link sits directly before the privacy link `Datenschutz`, the same
  place it has on the other two sites.

### Not on this site

- No legal notice page and no provider details beyond what the pages
  already state; content, values and publication of the legal notice are
  specified in `sites/www/specs/001-imprint.md`.

## Assumptions

This spec was written without legal advice. It rests on the assumptions of
`sites/www/specs/001-imprint.md`, in particular that a clearly labelled
footer link to the central legal notice satisfies § 5 DDG for this site.

## Constraints

- The link goes live only once `https://charemma.de/impressum/` is
  published; no deployed page links to a missing legal notice.
- The URLs of the existing pages do not change.

## Out of scope

- The legal notice itself (`sites/www/specs/001-imprint.md`).
- The postal address on the privacy page (`specs/014-visitor-statistics.md`
  decides).

## Acceptance

Checked against a local server serving the stamped site (`just dev`).

1. The footer of the start page and of the privacy page shows `Impressum`
   directly before `Datenschutz`, linking to
   `https://charemma.de/impressum/`.
2. `just check` passes.

## Touches

Orientation for the implementation, not an instruction: the footers of
`sites/ai/html/index.html` and `sites/ai/html/datenschutz/index.html`. The
pages are `asset` files, so no Dependencies column changes.
