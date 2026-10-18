# Article Writing Rules

This file states the rules for writing and revising knowledge articles under `src/articles/`. It applies whenever a user instruction asks for a new article or a change to an existing one, and whenever a file of type `article` is written or regenerated from its spec. The page structure, the publication logic and the front matter fields are defined in `003-knowledge-articles.md`; this file governs the text.

## File and Front Matter

- An article MUST live at `src/articles/<slug>-<lang>.md`, where `<slug>` is a slug from `topics.json` and `<lang>` a language code from `site.json`, as specified in `003-knowledge-articles.md`.
- The front matter MUST carry `lead` and `updated`; it MAY carry `draft` and `sources`, with the meaning given in `003-knowledge-articles.md`.
- Each entry in `sources` MUST have a `label` and MAY have a `url`.
- The article file MUST NOT contain a title heading; the title comes from `topics.json`.

## Structure

- The body MUST open with a concrete moment or scene, not with a summary or a definition.
- The body SHOULD contain, in this order: an introductory section (what the risk is), the forms or mechanics of the risk, the relation to adjacent articles, the pentest checks, the countermeasures. Leave out a section the topic has no material for.
- The body MAY contain one case from practice, per the **Case from Practice** section; it MAY serve as the opening scene or stand in any section.
- Each form or mechanic of the risk SHOULD come with one example from a Linux or infrastructure point of view.
- A reference to another article MUST be a relative Markdown link to its directory (for example `../prompt-injection/`); do not link by absolute URL.
- The pentest section MUST list three to five checks, written as what the author does.
- The countermeasures section MUST put architecture before filters: permissions, identities and human approval first, input and output filters last.
- The sources list is rendered from the front matter; the body MUST NOT repeat it.

## Case from Practice

- Whether an article shows a case from practice, and which one, MUST be fixed by the spec of the article; do not choose a case the spec does not name.
- A case from practice MUST be either a documented case or a constructed scenario.
- A documented case MUST rest on a public source that describes it; the source MUST be named in the sentence and listed in `sources` with its `url`.
- A documented case MUST be retold only with the facts the source states; do not add actors, numbers, causes or consequences the source does not give.
- A constructed scenario MUST be marked where it begins, with "Ein nachgestelltes Szenario:" in German, "A constructed scenario:" in English and "Ένα υποθετικό σενάριο:" in Greek, so that no reader takes it for a report.
- A constructed scenario MUST NOT present real companies, products, people, dates or figures as its actors or facts; use generic roles (a team, a vendor, an agent) instead.
- The case counts toward the 600 to 900 words of the body; do not extend the word count for it.

## Voice

- The author MUST write in the first person singular; the reader MUST be addressed in the polite form: "Sie" in German, "you" in English, "εσείς" in Greek.
- Sentences SHOULD be short; one idea per sentence.
- The text MUST be direct and practical; delete every paragraph that only informs without changing what the reader does.
- The text MUST NOT contain marketing language, emojis or dashes used as punctuation; use a period, colon, comma or parentheses instead.
- The body MUST have 600 to 900 words, counted without the front matter.

## Sources

- Every checkable statement (a fact, an incident, a number, a finding, a quote) MUST rest on a source listed in `sources`: the OWASP text for the topic's identifier, one of the permitted books or a public source; do not rest such a statement on memory alone.
- Notes of the user MAY be used as a further source when the instruction names them explicitly; they are not listed in `sources`.
- A public source is a document reachable at a stable web address without login or payment at the time of writing: standards, advisories, CVE records, papers, documentation, write-ups by vendors or researchers, recordings of talks.
- A public source MUST be read at its address before it is cited; do not cite from memory or from a search snippet, and do not cite an address that does not resolve.
- Web search MAY be used to find public sources; it is not itself a source.
- For a topic of the `llm` group, the OWASP text for the topic's identifier MUST be one of the sources; read it from `github.com/GenAI-Security-Project/GenAI-LLM-Top10` under `2026/final/`, and keep the `url` of the OWASP source entry at the resource page `https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/`.
- The permitted books are: Steve Wilson, _The Developer's Playbook for Large Language Model Security_; Kris Kimmerle and David Okeyode, _AI Under Attack_; Harriet Farlow, _Practical AI Security_. Local copies are found under `~/Sync/Books/AI-Security/`.
- Books MUST be read from a copy unpacked into `.tmp/`; do not unpack them elsewhere in the project.
- The text MUST NOT contain invented quotes, numbers, incidents or anecdotes; where an example is hypothetical, word it so that it cannot be read as a report, or mark it as a constructed scenario per the **Case from Practice** section.
- The sources list MUST hold one entry per source, as short as possible: `Author: Title` for a book; `Author or organisation: Title` with `url` for a public source; list name and identifier with `url` for OWASP.
- A source entry MUST NOT name a chapter, a section, a year or, for a book, the publisher.
- The body MUST NOT use footnotes; a statement that rests on one source names that source in the sentence.

## Rewrite Pass

- Before the article is committed, the text MUST go through one rewrite pass along the principles of William Zinsser's _On Writing Well_: check the lead, check the unity of point, pronoun, tense and tone, and cut clutter.
- After the rewrite pass, the two weakest passages MUST be named to the user, with the reason, so the user can decide whether to change them.

## Workflow

- Each article MUST be written on its own branch, created from `main`.
- The registry row for the article file MUST be approved and written before the file is created, per the **Inventory change** rule in `AGENTS.md`.
- After writing or changing an article, `just build` MUST be run and the generated pages committed together with the article.
- A new article MUST be committed in two commits: `chore(registry)` for the registry row, `feat(articles)` for the article and the generated pages.
- A correction to an article not yet on `main` MUST be committed with `git commit --fixup=<commit>`; do not create a standalone fix commit.
