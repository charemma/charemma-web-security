# 001 Imprint

Status: approved 2026-10-26, amended 2026-10-26 for the English version

## Why

A German business website has to name its provider (§ 5 DDG). The three
sites `charemma.de`, `security.charemma.de` and `ai.charemma.de` belong to
one provider, a freelancer (Freiberufler) without a commercial register
entry, so they share one legal notice instead of three.

One legal notice is easier to keep correct: every change to the provider
details happens in one place. It also fits the business address the notice
needs. The serviceable postal address comes from a business address
service, which books one "project" per address; three legal notices on
three domains would be three projects for the same person.

The notice lives on `charemma.de`, the main site. The other two sites link
to it from their footer (`sites/security/specs/014-imprint.md`,
`sites/ai/specs/001-imprint-link.md`).

security.charemma.de is published in German and English. Its English
readers get the legal notice in English, so they can read who runs the
site without a German detour. The German version stays authoritative: the
obligation comes from German law, and one binding text avoids two that
could drift apart in meaning.

## What

### Page

- The legal notice is the page `https://charemma.de/impressum/`, delivered
  from `sites/www/html/impressum/index.html`.
- Its English version is the page `https://charemma.de/en/legal-notice/`,
  delivered from `sites/www/html/en/legal-notice/index.html`. The address
  follows the pattern of `security.charemma.de`: the language prefix `en/`
  and an English path segment. It is the only English page of
  `charemma.de`; the rest of the site stays German.
- There is no Greek version.
- Both versions use the layout of the site's privacy page: the brand
  header, a back link to the start page, the title, a lead and the body as
  headed blocks, and the footer.
- Both are counted like every other page (`specs/014-visitor-statistics.md`),
  under the paths `charemma.de/impressum/` and `charemma.de/en/legal-notice/`,
  and may be indexed.

### Domains covered

Each version states that it is the legal notice for the websites
`charemma.de`, `security.charemma.de` and `ai.charemma.de`, each named in
full. A visitor arriving from any of the three sites sees that the notice
is meant for the site they came from.

### Content and order

Top to bottom:

1. Title `Impressum`; lead `Angaben gemäß § 5 DDG`.
2. Scope: one sentence naming the three domains, for example `Dieses
   Impressum gilt für die Websites charemma.de, security.charemma.de und
   ai.charemma.de.`
3. Provider: name; the line `Freiberufler`, followed by the fields of work
   `Platform Engineering, Penetrationstests und AI Engineering`; street;
   postal code and city; country.
4. `Kontakt`: `E-Mail:` with `me@charemma.de` as a `mailto:` link;
   `Telefon:` only when a telephone number is known.
5. Only when known: `Umsatzsteuer-Identifikationsnummer gemäß § 27a
   Umsatzsteuergesetz:` and the number.
6. Only when known: `Wirtschafts-Identifikationsnummer gemäß § 139c
   Abgabenordnung:` and the number.
7. `Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV`: name, street,
   postal code and city, country.

Blocks 5 and 6 and the telephone line are left out entirely, heading
included, while their value is unknown.

### English version

The English page has the same blocks in the same order, with the same
values and the same rule for unknown values. Headings and labels are
translated; the names of the laws and the § references stay in their
German form, because they cite German law:

1. Title `Legal notice`; lead `Information pursuant to § 5 DDG`.
2. Scope: `This legal notice applies to the websites charemma.de,
   security.charemma.de and ai.charemma.de.`
3. `Provider`: name; `Freelancer, Platform Engineering, penetration
   testing and AI Engineering`; street; postal code and city; country as
   `Germany`.
4. `Contact`: `Email:`; `Phone:` only when known.
5. Only when known: `VAT identification number pursuant to § 27a
   Umsatzsteuergesetz:` and the number.
6. Only when known: `Business identification number pursuant to § 139c
   Abgabenordnung:` and the number.
7. `Responsible for the content pursuant to § 18 (2) MStV`: name, street,
   postal code and city, country as `Germany`.

The page title is `Legal notice · charemma.de`, the back link reads
`← back to the start page` and leads to the German start page.

### Language versions

- The English page states, directly after the lead: `This is a
  translation. The German version is authoritative.`, with `German
  version` linking to `/impressum/` (`hreflang="de"`).
- The German page links to the English one directly after the lead with
  the line `English version`, linking to `/en/legal-notice/`
  (`hreflang="en"`, `lang="en"`).
- Both pages name themselves as canonical and carry
  `<link rel="alternate">` entries for `de`, `en` and `x-default`, the
  last pointing to the German page.

### Values

- Name: `Charalambos Emmanouilidis`. E-mail: `me@charemma.de`.
- The postal address, telephone number, VAT identification number and
  business identification number are not part of this spec. The page
  carries them as written by the user; AI enters such a value only when the
  user names it and never invents or derives one.
- Entering or changing one of these values on the page is a value change
  this spec covers; no spec change is needed for it. A value change
  applies to both language versions in the same change.
- The tax number (Steuernummer) is never published.

### Complete before published

The pages are published only with a complete postal address (street, postal
code, city, country). Without it the page would claim a compliance the
sites do not have. The footer links on all three sites go live together
with the page they target or after it, never before, so no site links to a
missing page. This holds for the English page as well.

### Footer link

Every page of `charemma.de` that carries a footer links to `/impressum/`
with the label `Impressum`, placed directly before the privacy link. On the
German legal notice page the link is marked as the current page, as the
privacy page does for its own link. The English page carries the same
German footer, without a current-page mark, because none of its links
leads to the English page itself.

### Not on this page

- Professional liability insurance: § 2 DL-InfoV requires the insurer only
  for mandatory insurance, and none of the three fields of work is a
  regulated profession with mandatory insurance. The existing insurance
  belongs on a later page describing how engagements are run.
- Supervisory authority, chamber and professional title: not applicable to
  non-regulated professions.
- Online dispute resolution: the EU platform was shut down in July 2025, and
  the consumer dispute statement of § 36 VSBG does not apply to a business
  with ten or fewer employees.
- Liability or copyright disclaimers: not required and of little legal
  effect.
- Bug bounty and other references: they belong to a later About page.

## Assumptions

This spec was written without legal advice. It rests on these assumptions;
if one does not hold, the spec changes:

- A clearly labelled footer link `Impressum` on every page, leading to one
  legal notice on another domain of the same provider that names all
  domains it covers, satisfies § 5 DDG for each of those domains (easily
  recognizable, directly reachable, permanently available).
- An English translation of the notice, marked as non-authoritative and
  linking to the German version, satisfies the same requirement for the
  English pages of `security.charemma.de`; the German version remains the
  binding notice.
- E-mail together with the postal address satisfies the requirement of fast
  electronic contact and direct communication (§ 5 (1) no. 2 DDG, CJEU
  C-298/07). A telephone number is not required.
- The knowledge articles on `security.charemma.de` and the texts on the
  other sites may count as journalistic-editorial content, so the page names
  the person responsible under § 18 (2) MStV. Stating it when it is not
  required does no harm.
- A business address service provides a serviceable address (ladungsfähige
  Anschrift) where documents can be served; a P.O. box does not.
- No register, chamber or regulated-profession details apply to a
  freelancer in platform engineering, penetration testing or AI engineering.

## Constraints

- No value on the page is invented or derived.
- The URLs of the start page and the privacy page do not change.

## Out of scope

- The postal address on the privacy pages (`specs/014-visitor-statistics.md`
  decides).
- Legal notices for profiles on other platforms (GitHub, dev.to).
- A Greek version of the legal notice.
- English versions of other pages of `charemma.de`.
- The footer links of `security.charemma.de` and `ai.charemma.de` (their
  own specs).

## Acceptance

Checked against a local server serving the stamped site (`just dev`), with
a complete address on the page.

1. `/impressum/` answers `200` with a German page titled `Impressum` that
   shows the blocks in the order of "Content and order".
2. The page names `charemma.de`, `security.charemma.de` and
   `ai.charemma.de`.
3. With telephone, VAT identification number and business identification
   number unknown, the page contains neither `Telefon`, `Umsatzsteuer` nor
   `Wirtschafts-Identifikationsnummer`.
4. The footer of the start page, the privacy page and the legal notice page
   shows `Impressum` directly before `Datenschutz`, linking to
   `/impressum/`; on the legal notice page it is marked as the current page.
5. The page carries the visitor statistics snippet with the path
   `charemma.de/impressum/`.
6. `/en/legal-notice/` answers `200` with a page in English (`lang="en"`)
   titled `Legal notice` that shows the blocks of "English version" in that
   order, with the same values as the German page.
7. The English page carries the translation note with a link to
   `/impressum/`; the German page carries `English version` linking to
   `/en/legal-notice/`. Both carry the canonical and the `de`, `en` and
   `x-default` alternates.
8. The English page carries the visitor statistics snippet with the path
   `charemma.de/en/legal-notice/`.
9. `just check` passes.

## Touches

Orientation for the implementation, not an instruction: a new page
`sites/www/html/impressum/index.html` (with its site registry row), the
footers of `sites/www/html/index.html` and
`sites/www/html/datenschutz/index.html`; for the English version a new
page `sites/www/html/en/legal-notice/index.html` (with its site registry
row) and the alternates and link on the German page. The pages are
`asset` files, so no Dependencies column changes.
