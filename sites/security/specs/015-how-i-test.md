# 015 How I test

Status: approved 2026-10-26

## Why

The start page says what I test and shows how an engagement runs (specs
010 and 012, the section "03 / zusammenarbeit"). It does not say under
which rules I test. A prospective client, and anyone who checks whether
this is a real, accountable business, wants to know that every test is
authorized and agreed, that I report what matters at once and break
nothing on purpose, how AI is used and what happens with the client's data
there, and which standards and credentials stand behind the work.

One page answers that, in a few short sections. It is a statement of
principles, not a contract: details such as data retention, report
transfer, confidentiality agreements and stop conditions belong in the
offer and the contract of each engagement, and the page says so instead of
listing them.

## What

### Page

The page is a page of `site.json` with the page key `conduct`, rendered by
its own template. Its paths:

| Page key | `de` | `en` | `el` |
| -------- | ---- | ---- | ---- |
| `conduct` | `so-teste-ich/` | `how-i-test/` | `so-teste-ich/` |

Greek keeps the German segment, as for the other pages, until its own
segments are decided (spec 013). `vorgehen/` is not used: "Vorgehen" is
already the name of the walkthrough section on the start page (`02 /
vorgehen`, header entry "Vorgehen"), and a page of the same name would be
mistaken for it.

Addresses, canonical, alternates, switcher, sitemap and the former and
unpublished-language redirects follow spec 013 and spec 009 as for the
privacy page; this spec adds nothing to them.

### Layout

There is no design file for this page. **Flagged:** the layout follows the
privacy page as it is built (`datenschutz.html.j2`): light page, no
navigation links in the header, a head with back link to the start page,
title and lead, then a body of sections, each a heading and one or more
paragraphs, in the article typography of the stylesheet. The page is a
short text document like the privacy page, and that structure exists
already; it adds no new visual elements. A later design for the page
replaces this choice through a change of this spec.

### Content

The page has a head and four sections, in this order. The spec states what
each says; the texts are written from it into the interface texts.

**Head.** The title is `So teste ich` in German and `How I test` in
English. The lead says in one or two sentences that I test only with
authorization and under agreed rules, and that the details of each
engagement are settled in offer and contract.

**1. Authorization.** I test only with a written order, and only systems
the client owns or may have tested. Before the test, scope, test type
(black, grey or white box) and time window are agreed in writing. This matches step 01 of the process section and does not
contradict it.

**2. During the test.** Critical findings are reported to the client
immediately, not only in the report. Destructive tests (deleting data,
deliberately impairing systems) are not performed. The statement says
"deliberately": broad automated tests can still strain a fragile system
unintentionally, so the page does not promise more than that. The first
sentence matches step 02 of the process section.

**3. AI in the penetration test.** The section states:

- AI agents do reconnaissance and breadth: they map the attack surface and
  run broad, automated tests.
- I set the agreed scope as a fixed boundary for the agents and supervise
  their work.
- I follow up exploitable findings by hand and verify every finding in the
  report myself.
- Data from an engagement goes to an AI model only with the client's
  written consent. The model is named: Anthropic Claude.
- Without that consent I work without cloud AI.

The section is consistent with the approach section (spec 012): agents
for the breadth, me for the depth, within the agreed scope.

**4. Standards and credentials.** The section names:

- the BSI guideline for penetration tests (in German "BSI IS-Pentest-
  Leitfaden", as the start page's profile names it) and the OWASP Web
  Security Testing Guide (WSTG) as the methods I follow;
- the certifications OSCP and SCP Web Application Security;
- a professional liability insurance (Berufshaftpflichtversicherung) with
  exali, without a sum insured.

Report and retest are not a section of their own: the process section of
the start page covers them, and the page does not repeat it.

### What the page does not state

- No retention periods, no storage or transfer methods, no statement on
  confidentiality agreements, no list of stop conditions. These are part
  of offer and contract.
- No sum insured, no policy details.
- No legal statements: no citation of statutes, no claim about what is
  legal or required.
- No promises the test cannot keep, in the terms of spec 012's tone rules.

### Tone and length

The tone rules of spec 012 apply to every text of the page: factual, first
person for me, formal address for the client, active voice, no wording that
has me cause harm, no overstatement, no marketing phrases, no dash as
punctuation, no emojis, no exclamation marks.

Each section has one to three short paragraphs or one paragraph and a
short list, at most 450 characters including spaces per section. The whole
page body, head excluded, fits within about one screen at 1280px. The lead
is at most 200 characters.

### Links to the page

- **Start page, process section.** Below the four steps of
  "03 / zusammenarbeit" a link leads to the page in the page's language.
  **Flagged:** there is no design for this link; it follows the link to
  the knowledge overview at the end of the knowledge section (a button
  with label and `→`), in the variant that reads on the light background of
  the process section. The label says what the page holds, for example
  `So teste ich: Regeln für jeden Auftrag`.
- **Footer.** Every page that carries the footer links to the page, in the
  page's language, after `charemma.de` and before the legal notice:
  GitHub, charemma.de, how I test, legal notice, privacy, version. The
  footer label is the page title.
- **Not in the header.** The header navigation of the start page holds
  anchors to its sections; it gets no entry for this page. Subpages keep
  their header without navigation links.

### Texts and keys

All texts live in the interface texts (`src/i18n/<lang>.json`, type
`content`) under the key `conduct`, with the same structure as `privacy`:
`link` (footer label), `meta_title`, `meta_description`, `back`, `title`,
`lead`, `sections` (each `heading` and `paragraphs`), plus
`process_link` for the start page link. The implementation adds them on
the user's explicit instruction.

### Languages

German and English are published (spec 009); the page goes live in both at
once, the English text a translation of the German one that follows this
spec, the tone rules included. Greek gets its text when Greek is published;
until then `el.json` needs no `conduct` texts, because the generator does
not render unpublished languages. The Greek path is configured now, because
spec 013 requires a path per key for every configured language.

## Constraints

- The facts on the page are those of this spec; no further facts are
  added without a change of this spec.
- The existing pages keep their addresses; the sitemap gains the new page.
- The order of the footer links in spec 014 is amended by this spec's
  footer entry; the legal notice still sits directly before the privacy
  link.
- Rendering stays deterministic.

## Out of scope

- Offer and contract terms: retention, data transfer, confidentiality,
  stop conditions, insurance sums.
- The process section's steps and texts and the approach section
  (specs 010, 012).
- A design for the page.
- The Greek text and Greek path segments of their own.

## Acceptance

Checked against the generator output and a local nginx serving the stamped
site.

1. `just build` renders `/so-teste-ich/` and `/en/how-i-test/`, and nothing
   under `html/el/`; `sitemap.xml` lists both with alternates `de`, `en`
   and `x-default`.
2. `/en/so-teste-ich/` answers `301` to `/en/how-i-test/` (spec 013).
3. The page has the privacy page's structure: light page, no navigation
   links in the header, back link, title, lead and four sections in the
   order authorization, during the test, AI in the penetration test,
   standards and credentials.
4. The German and English texts state the facts of *Content* and no others;
   the authorization section limits tests to systems the client owns or
   may have tested; the during-the-test section states that destructive
   tests are not performed, with no exception by agreement; the AI section
   names Anthropic Claude, written consent and work without
   cloud AI otherwise; the credentials section names BSI guideline, OWASP
   WSTG, OSCP, SCP Web Application Security and a professional liability
   insurance with exali, without a sum.
5. No text of the page contains a statute citation, a retention period, a
   sum insured, "–", "—", "!", "garantiert", "lückenlos", "100 %" or an
   emoji; no section exceeds 450 characters and the lead 200.
6. The start page's process section links to `/so-teste-ich/` in German
   and to `/en/how-i-test/` in English, below the four steps.
7. Every footer lists GitHub, charemma.de, the page, the legal notice,
   privacy and version in this order; the header navigation of the start
   page is unchanged.
8. At 390px no page scrolls sideways.
9. `just check-generated` passes.

## Touches

Orientation for the implementation, not an instruction: the site
configuration (`site.json`: page entry with key `conduct`, the path per
language), a new page template (`so-teste-ich.html.j2` or similar, to be
registered), the page skeleton (`base.html.j2` footer link), the start page
template (`index.html.j2` process section link), the stylesheet (`main.css`,
only if the link variant on the light background needs a rule), the
interface texts (`de.json`, `en.json`, key `conduct`, on the user's
instruction), the generated pages and sitemap, spec 014 (footer order
sentence), and the site registry rows of the touched templates and
`site.json`, whose Dependencies gain `015-how-i-test.md`.
