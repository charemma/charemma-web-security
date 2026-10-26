# 014 Imprint

Status: approved 2026-10-26

## Why

security.charemma.de is the business site of a freelance penetration tester.
A German business website has to name its provider (§ 5 DDG), and a site
without a legal notice reads like a hobby project. The site is meant to show
a real, accountable business, so the legal notice is part of that proof.

The provider is a freelancer (Freiberufler) without a commercial register
entry. The serviceable postal address the law requires is not decided yet:
the private registered address is not published, a P.O. box does not
satisfy the law, and a business address is still to be arranged. An
incomplete legal notice would claim a compliance the site does not have, so
the page appears only once its required values are complete.

## What

### Page

The legal notice is a page of `site.json` with the page key `imprint`,
rendered from its own template for every published language, like the
privacy page. Its path segments per language (spec `013-localized-paths.md`):

| Page key | `de` | `en` | `el` |
| -------- | ---- | ---- | ---- |
| `imprint` | `impressum/` | `legal-notice/` | `impressum/` |

Greek keeps the German segment until its own segments are decided, as for
the other page keys. English uses `legal-notice/` because "imprint" is not
the English term for this page.

The page uses the privacy page's layout: the page skeleton, the light page
style, a back link to the start page, title, lead and the body as headed
blocks. It has no navigation links in the header, like the privacy page.
Canonical, alternates, sitemap entry and language switcher follow spec
`013-localized-paths.md` like every other page. It is counted like every
other page (spec `014-visitor-statistics.md`) and may be indexed.

### Footer link

Every page that carries the footer links to the legal notice of its own
language, placed directly before the privacy link: GitHub, charemma.de,
legal notice, privacy, version. The label is `Impressum` in German and
`Legal notice` in English; Greek takes its label from `el.json`.

### Values

The provider details are facts, not translations, and live in `site.json`
in a new object `operator`, next to `contact_email`:

| Field | Required | Content |
| ----- | -------- | ------- |
| `name` | yes | `Charalambos Emmanouilidis` |
| `address` | yes, see below | `street`, `postal_code`, `city`, `country` |
| `phone` | no | a telephone number in international form, `+` and digits with single spaces |
| `vat_id` | no | VAT identification number (USt-IdNr.), `DE` and nine digits |
| `business_id` | no | business identification number (Wirtschafts-Identifikationsnummer), `DE`, nine digits, `-` and five digits |

The e-mail address is `contact_email`, the same value the privacy page and
the contact block use. The tax number (Steuernummer) has no field and is
never published.

`address`, `phone`, `vat_id` and `business_id` are absent or `null` while
they have no value. Entering or changing one of these values in `site.json`
is a value change this spec covers; no spec change is needed for it. AI
enters such a value only when the user names it; it never invents or
derives an address.

Headings, labels, lead and the page's meta texts are interface texts in
`src/i18n/<lang>.json` under the key `imprint`. Those files are `content`;
the implementation adds the keys on the user's explicit instruction.

### Missing and malformed values

- Without `address`, the generator does not render the legal notice in any
  language: no page, no footer link, no sitemap entry, no alternates. It
  removes a previously rendered legal notice directory and prints one line
  naming the missing value. The build succeeds, so the rest of the site
  keeps deploying.
- An `address` with one of its four fields missing or empty fails the build.
- A `phone`, `vat_id` or `business_id` that does not match its form in the
  table fails the build.
- A missing or empty `name` or `contact_email` fails the build.

Failing the build while the address is missing was rejected: the rendered
pages are committed and checked in CI, so every change to the site would be
blocked until the address exists. Rendering the page without the address was
rejected because the site would then publish a legal notice that does not
meet § 5 DDG.

### Content and order

The German page, top to bottom:

1. Title `Impressum`; lead `Angaben gemäß § 5 DDG`.
2. Provider: name; the line `Freiberuflicher Penetrationstester`; street;
   postal code and city; country.
3. `Kontakt`: `E-Mail:` with the address as a `mailto:` link; `Telefon:`
   only when `phone` is set.
4. Only when `vat_id` is set: `Umsatzsteuer-Identifikationsnummer gemäß
   § 27a Umsatzsteuergesetz:` and the number.
5. Only when `business_id` is set: `Wirtschafts-Identifikationsnummer gemäß
   § 139c Abgabenordnung:` and the number.
6. `Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV`: name, street,
   postal code and city, country.

Blocks 4 and 5 are left out entirely, heading included, when their value is
absent. Name, address and numbers are written as they are in `site.json`,
in every language.

### Language versions

The German version is the legally relevant one. The other language versions
carry the same blocks in the same order with translated headings and labels
and the same values, and a lead stating that this is a translation and the
German version is authoritative, with a link to it. The paragraph references
(§ 5 DDG, § 27a UStG, § 139c AO, § 18 Abs. 2 MStV) stay in their German form
in every language.

### Not on this page

- Professional liability insurance: § 2 DL-InfoV requires the insurer only
  for mandatory insurance, and penetration testing is not a regulated
  profession with mandatory insurance. The existing insurance belongs on a
  later page describing how engagements are run.
- Supervisory authority, chamber and professional title: not applicable to
  a non-regulated profession.
- Online dispute resolution: the EU platform was shut down in July 2025, and
  the consumer dispute statement of § 36 VSBG does not apply to a business
  with ten or fewer employees.
- Liability or copyright disclaimers: not required and of little legal
  effect.
- Bug bounty and other references: they belong to a later About page.

## Assumptions

This spec was written without legal advice. It rests on these assumptions;
if one does not hold, the spec changes:

- E-mail together with the postal address satisfies the requirement of fast
  electronic contact and direct communication (§ 5 (1) no. 2 DDG, CJEU
  C-298/07). A telephone number is not required; the optional `phone` field
  exists in case it is.
- The knowledge articles may count as journalistic-editorial content, so the
  page names the person responsible under § 18 (2) MStV. Stating it when it
  is not required does no harm.
- A business address service provides a serviceable address (ladungsfähige
  Anschrift) where documents can be served; a P.O. box does not.
- No register, chamber or regulated-profession details apply to a
  freelancer in penetration testing.

## Constraints

- No value on the page is invented or derived; every value comes from
  `site.json`.
- The German addresses of the existing pages do not change.
- Rendering stays deterministic. With the address absent, the pages and the
  sitemap are the same as before this spec; only the web server include of
  spec `013-localized-paths.md` gains the `imprint` paths.

## Out of scope

- The postal address on the privacy page (spec `014-visitor-statistics.md`
  decides; it says the address follows once added there).
- A legal notice on `charemma.de` or `ai.charemma.de`.
- The Greek path segment and publishing Greek.
- The page describing how engagements are run, and the About page.

## Acceptance

Checked against the generator output and a local nginx serving the stamped
site.

1. With `operator.address` absent (the state until the user supplies it),
   `just build` succeeds, prints one line naming the missing address,
   renders no `html/impressum/` and no `html/en/legal-notice/`, and the
   footer and `sitemap.xml` name no legal notice. `just check-generated`
   passes.
2. With a complete address in a working copy, `just build` renders
   `/impressum/` and `/en/legal-notice/`; every page's footer shows the legal
   notice link of its language directly before the privacy link.
3. The German page shows the blocks in the order of "Content and order" with
   the values from `site.json`; with `phone`, `vat_id` and `business_id`
   absent it contains neither `Telefon`, `Umsatzsteuer` nor
   `Wirtschafts-Identifikationsnummer`. Setting each of them makes its line
   or block appear.
4. The English page names the canonical
   `https://security.charemma.de/en/legal-notice/`, alternates `de` at
   `/impressum/`, `en` at `/en/legal-notice/` and `x-default` at the German
   address, states that the German version is authoritative and links to it.
   `sitemap.xml` lists both with the same alternates.
5. An address without `city`, a `vat_id` of `DE12345678`, a `business_id`
   without the five-digit suffix and a `phone` with letters each make
   `just build` fail.
6. Removing the address again after a build with it removes
   `html/impressum/` and `html/en/legal-notice/` on the next build.
7. With English unpublished in a working copy, `/en/legal-notice/` answers
   `302` to `/impressum/` (spec `009-published-languages.md`).

## Touches

Orientation for the implementation, not an instruction: the site
configuration (`site.json`: page entry and `imprint` paths per language, the
`operator` object), the generator (`build.py`: checks of `operator`,
skipping the page and its footer link, sitemap entry and alternates without
an address, removing a stale page directory, the `imprint` paths in the
web server include), a new page template for the
legal notice, the page skeleton (`base.html.j2` footer link), the interface
texts (`de.json`, `en.json`, `el.json`, key `imprint`, on the user's
instruction) and the site registry row of the new template.
