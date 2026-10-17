# 002 Knowledge topics

Status: approved 2026-10-17

## Why

The knowledge section lists the risks the site explains: ten taken from the
OWASP Top 10 for LLM Applications and five of our own that cover the pipeline
and infrastructure around a model. The list is the skeleton the later topic
pages hang on, so its identifiers, order and selection for the start page need
one agreed source instead of being re-decided with every page.

OWASP renumbers its list with every edition. LLM03 was Supply Chain in 2025
and is Excessive Agency in 2026. A bare `LLM03` on the page is therefore
ambiguous to anyone who knows an earlier edition.

## What

### Source of the list

`topics.json` is the only source of the topic list. Every topic appears there
once, with its identifier, group, slug, publication state and the title and
summary in German, English and Greek. No other file repeats a title or summary.

### Identifiers

Topics of the `llm` group carry the OWASP identifier with the edition year,
in the form OWASP itself uses: `LLM01:2026` to `LLM10:2026`. Names and order
follow that edition. When the site moves to a newer edition, every identifier
in the group changes at once; the group never mixes editions.

Topics of the `pipe` group carry our own identifier `PIPE·01` to `PIPE·05`
without a year. The numbering follows the path of a request through the
system, from the data and model pipeline to the inference endpoint and the
agents and logging around it. Renumbering is allowed as long as no topic of
the group has a published page; after that, a number stays with its topic.

### Groups and order

The overview shows the `llm` group first, then the `pipe` group, each in the
order of `topics.json`. The group titles and subtitles live in the interface
texts, not in `topics.json`.

### Start page selection

The start page shows three topics per group. Their identifiers are listed in
`site.json` under `knowledge.featured`, in display order. Each listed
identifier must exist in `topics.json`; a build with a dangling identifier
fails rather than rendering an incomplete group.

The current selection is `LLM01:2026`, `LLM03:2026`, `LLM05:2026` for the
`llm` group and `PIPE·03`, `PIPE·01`, `PIPE·02` for the `pipe` group: the
three OWASP entries with the widest reach, and agents, the model pipeline and
the inference infrastructure as the pipe topics closest to a Linux
infrastructure test.

## Constraints

- Slugs do not change once a topic page is published; they are the page
  address. Until then they may change with the title.
- The identifier is displayed as written in `topics.json`; the generator
  neither adds nor strips the year.

## Out of scope

- The topic pages themselves, their structure, texts and navigation. That is
  the next spec.
- The wording of the summaries. They are content, maintained by hand.

## Acceptance

1. The overview page in all three languages shows ten `llm` topics with the
   identifiers `LLM01:2026` to `LLM10:2026` in OWASP order, followed by five
   `pipe` topics `PIPE·01` to `PIPE·05`.
2. The start page in all three languages shows the six topics named in
   `site.json`, in that order.
3. Removing a listed identifier from `topics.json` makes `just build` fail.
4. `just check-generated` passes after the list change.

## Touches

Orientation for the implementation, not an instruction: the topic list
(`topics.json`) and the start page selection in the site configuration
(`site.json`).
