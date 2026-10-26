# 001 Imprint

Status: approved 2026-10-26

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

## What

### Page

- The legal notice is the page `https://charemma.de/impressum/`, delivered
  from `sites/www/html/impressum/index.html`.
- The page is German only, like the rest of `charemma.de`. It has no other
  language version; the footer links of the other sites lead here in every
  language.
- It uses the layout of the site's privacy page: the brand header, a back
  link to the start page, the title, a lead and the body as headed blocks,
  and the footer.
- It is counted like every other page (`specs/014-visitor-statistics.md`),
  under the path `charemma.de/impressum/`, and may be indexed.

### Domains covered

The page states that it is the legal notice for the websites
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

### Values

- Name: `Charalambos Emmanouilidis`. E-mail: `me@charemma.de`.
- The postal address, telephone number, VAT identification number and
  business identification number are not part of this spec. The page
  carries them as written by the user; AI enters such a value only when the
  user names it and never invents or derives one.
- Entering or changing one of these values on the page is a value change
  this spec covers; no spec change is needed for it.
- The tax number (Steuernummer) is never published.

### Complete before published

The page is published only with a complete postal address (street, postal
code, city, country). Without it the page would claim a compliance the
sites do not have. The footer links on all three sites go live together
with the page or after it, never before, so no site links to a missing
page.

### Footer link

Every page of `charemma.de` that carries a footer links to `/impressum/`
with the label `Impressum`, placed directly before the privacy link. On the
legal notice page itself the link is marked as the current page, as the
privacy page does for its own link.

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
- An English label `Legal notice` leading to the German notice satisfies
  the same requirement for the English pages of `security.charemma.de`.
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
- An English or Greek version of the legal notice.
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
6. `just check` passes.

## Touches

Orientation for the implementation, not an instruction: a new page
`sites/www/html/impressum/index.html` (with its site registry row), the
footers of `sites/www/html/index.html` and
`sites/www/html/datenschutz/index.html`. The pages are `asset` files, so
no Dependencies column changes.
