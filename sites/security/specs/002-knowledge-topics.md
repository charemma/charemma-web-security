# 002 Knowledge topics

Status: approved 2026-10-17, amended 2026-10-18, 2026-10-20

## Why

The knowledge section lists the risks the site explains: ten taken from the
OWASP Top 10 for LLM Applications and five of our own that cover the
infrastructure a model runs on. The list is the skeleton the later topic
pages hang on, so its identifiers, order and selection for the start page need
one agreed source instead of being re-decided with every page.

The second group was first called AI pipelines. Its five topics describe
operation and hosts, though: the training pipeline and registry, the
inference servers, the tool servers agents call, the secrets that connect
them and the logging that records them. They are not stations of a pipeline,
and a reader who expects one looks for stages that are not there. The group
is therefore called AI infrastructure, which also names what the site tests:
the Linux infrastructure a model runs on.

OWASP renumbers its list with every edition. LLM03 was Supply Chain in 2025
and is Excessive Agency in 2026. A bare `LLM03` on the page is therefore
ambiguous to anyone who knows an earlier edition.

## What

### Source of the list

`topics.json` is the only source of the topic list. Every topic appears there
once, with its identifier, group, slug and the title and summary in German,
English and Greek. Whether a topic has an article in a language follows from
the article files (spec 003), not from a field in the list. No other file
repeats a title or summary.

### Identifiers

Topics of the `llm` group carry the OWASP identifier with the edition year,
in the form OWASP itself uses: `LLM01:2026` to `LLM10:2026`. Names and order
follow that edition. When the site moves to a newer edition, every identifier
in the group changes at once; the group never mixes editions.

Topics of the `infra` group carry our own identifier `INFRA·01` to
`INFRA·05` without a year. The prefix repeats the group name so that an
identifier on a card says which group it belongs to without the group title.
The numbering follows the layers of operating a model: the pipeline and
registry that deliver it, the hosts that serve it, the agents and tool
servers that act on it, the secrets that connect everything and the logging
that records it. Renumbering is allowed as long as no topic of the group has
a published page; after that, a number stays with its topic.

### Groups and order

The overview shows the `llm` group first, then the `infra` group, each in
the order of `topics.json`. The group titles and subtitles live in the interface
texts, not in `topics.json`.

### Start page selection

The start page shows three topics per group. Their identifiers are listed in
`site.json` under `knowledge.featured`, in display order. Each listed
identifier must exist in `topics.json`; a build with a dangling identifier
fails rather than rendering an incomplete group.

The current selection is `LLM01:2026`, `LLM02:2026`, `LLM03:2026` for the
`llm` group and `INFRA·03`, `INFRA·01`, `INFRA·02` for the `infra` group.
The `llm` selection is the three topics that have an article, so every
featured card of the group leads to a page of its own instead of ending on
the overview. When a further topic of the group gets an article, the
selection is re-decided here; the group stays at three cards. The `infra`
selection is agents, the model pipeline and the inference infrastructure, the
topics closest to a Linux infrastructure test.

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

1. The overview page in every published language (spec 009) shows ten `llm` topics with the
   identifiers `LLM01:2026` to `LLM10:2026` in OWASP order, followed by five
   `infra` topics `INFRA·01` to `INFRA·05` under the group title AI
   infrastructure in the language of the page.
2. The start page in every published language shows the six topics named in
   `site.json`, in that order.
3. Removing a listed identifier from `topics.json` makes `just build` fail.
4. `just check-generated` passes after the list change.

## Touches

Orientation for the implementation, not an instruction: the topic list
(`topics.json`) and the start page selection in the site configuration
(`site.json`).
