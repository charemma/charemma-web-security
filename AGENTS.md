> Parts of this file are adapted from Anatoly Volkhover's book _Agentic Spec-Driven Development_ (https://agentic-spec.com).

## Project Intent

This project specifies security.charemma.de, the website for Charalambos Emmanouilidis' penetration testing services with a focus on Linux infrastructure. It presents the services, the engagement approach as an animated walkthrough, and a knowledge section on AI security, as static pages in German, English and Greek. The specification is the source of truth; the pages, styles, scripts, container image and deployment are built from it. The visual design in `docs/design/` is the input the specification was derived from.

## Rule Management

A durable rule is a rule that is part of the project's persistent rule set — recorded in AGENTS.md or in any `rules`-type file AGENTS.md references — and applied either on every turn (when always loaded) or when a specific trigger fires (when conditionally loaded). It is distinct from a one-off instruction that applies only to the current request, and distinct from any project-domain meaning of "rule" (business rule, validation rule, parsing rule, and the like).

- Durable rules MUST be recorded either in the `AGENTS.md` file at the project root or in a `rules`-type file that the project-root `AGENTS.md` references. Do not record durable rules in the user-global `AGENTS.md` or in any nested `AGENTS.md` inside a subfolder.

- For any work involving durable rules — creating a new durable rule, editing an existing one, removing one, or analyzing them — AI MUST read `rule-analysis.md` and MUST follow the protocol stated there.

- Changes to any file containing durable rules (additions, edits, deletions) MUST be recorded only after explicit user approval.

## Referenced Files

- When this `AGENTS.md` file references another file by name, AI MUST verify that the file exists before relying on its content. If a referenced file is missing, AI MUST report this to the user and ask whether to stop or to ignore the reference and continue.

## Input Relevance

- When a user input does not appear to align with the intent stated in the Project Intent section of this AGENTS.md file, AI MUST ask the user how the input relates to the project, and MUST continue asking until the relevance is established or the user issues a blind override — an explicit instruction to proceed without further inquiry.

## Rule Conflicts at Runtime

- A runtime rule conflict exists when two or more durable rules require incompatible behavior for the current operation and AI cannot satisfy both. Mere overlap — multiple rules applying to the same operation without incompatibility — does not constitute a conflict and MUST NOT trigger this protocol.

- On detecting a runtime rule conflict, AI MUST stop before producing or modifying any output that depends on the conflicting rules, append a log entry to `rule-conflict-log.md`, and follow the procedure in `rule-conflict-protocol.md`.

- AI MUST NOT guess a resolution, silently apply one rule over another, or proceed by inferring user intent — instead, present the conflict to the user with at least three options (drop one of the conflicting rules, propose a custom resolution, or stop) and resume work only as the user's decision permits.

- Writing an entry to `rule-conflict-log.md` is itself exempt from this rule.

## Undefined References

- When AI, while applying a rule, encounters a reference to another rule, a section, or a named entity that does not resolve to a definition in the `AGENTS.md` file, any `rules`-type file the `AGENTS.md` file references, or `glossary.md`, AI MUST stop and ask the user to define the reference before proceeding. Do not infer the meaning of an undefined reference.

## Terminology

- When a term in a user input, rule, or spec is unclear, AI MUST look it up in `glossary.md` before asking the user; ask the user only if `glossary.md` does not define the term.

## Scratch Directory

The project root contains a single reserved directory named `.tmp/` for AI's transient working files.

- AI MUST place transient working files — one-off scripts, intermediate tool outputs, comparison drafts, anything not intended for the user to read as part of normal project work — in `.tmp/`.

- AI MAY create, modify, and delete files in `.tmp/` at any time without seeking approval from this rule.

- Files inside `.tmp/` MUST NOT be referenced from any registered file or any rule. Anything that needs to persist or be referred to MUST be promoted out of `.tmp/` and registered first.

- Exactly one scratch directory exists, at the project root. AI MUST NOT create additional scratch directories elsewhere in the project.

## Version Control

- AI MAY create git commits in this repository without a separate request for each commit.

- A commit MUST be created only after the change it contains has been approved by the user and fully written to disk, including any required File Registry update.

- Each commit MUST contain exactly one logical step; unrelated changes MUST be split into separate commits.

- Commit messages MUST follow Conventional Commits (https://www.conventionalcommits.org/en/v1.0.0/) in the form `type(scope): description`.

- Commit messages MUST NOT contain AI attribution lines; write the message as plain project history instead.

- Files in `.tmp/` MUST NOT be staged or committed; leave them untracked.

- AI MUST NOT push; leave pushing to the user and report which branch is ready.

- AI MUST NOT merge into `main`; leave merging to the user.

- AI MUST NOT run force operations; ask the user to run them instead.

- AI MUST NOT rebase, reset, or amend; record corrections as new commits (for example fixup commits) instead.

- Corrections to a commit not yet on `main` MUST be committed with `git commit --fixup=<commit>`; do not create a standalone fix commit for them.

- A commit is on `main` when it is reachable from `main` or from `origin/main`.

- A correction touching content from several commits MUST be split into one fixup commit per target commit.

- Fixup commits are exempt from the Conventional Commits rule; their message is the `fixup! <subject>` line that git generates.

- AI MUST NOT squash fixup commits; leave squashing to the user before merging.

- AI MUST NOT discard uncommitted work (`git restore <path>`, `git checkout -- <path>`, `git clean`, `git stash drop`, `git stash clear`) without asking the user first; ask and proceed only after explicit approval.

- To unstage changes, AI MUST use `git restore --staged <path>` instead of `git reset`.

- AI MUST NOT delete branches; leave branch cleanup to the user.

- AI MUST NOT commit directly to `main`; commit on a feature branch instead.

- When the current branch is `main`, AI MUST ask the user for a branch name before the first commit, then create and switch to that branch.

## File Registry

The File Registry is the project's index of every file in it, structured as a table where each row represents one registered file. Every change to the file inventory MUST be reflected here before the file system is touched. Subfolders are not registered separately — they are derived from the Subfolder column of registered files, and exist on disk by virtue of having at least one file placed in them.

### Structure

This section interprets the columns of the **Registered Files** table below — what each column holds and what values are valid — and the extension that is derived from the File column.

#### Type

The Type column carries a categorical label describing what the file is. The set of permitted types is closed. Only the following type values are allowed:

- `rules` — a file containing durable rules in the project's rule format.
- `log` — a file accumulating timestamped entries.
- `spec` — a file specifying a feature's intended behavior and the reasons for it; the source of truth that implementation is built from.
  - Files of type `spec` MUST be named `NNN-<name>.md`, where `NNN` is a three-digit number and `<name>` is a short souvlaki-case name (e.g. `001-landing-page.md`).
  - A new spec MUST take the number following the highest number ever assigned to a spec in the git history of `main` or of the current branch, including specs since removed; do not reuse a freed number.
  - The number of an existing spec MUST NOT change; when renaming a spec, change only the `<name>` part.
- `code`: a source, test, or build-configuration file of the implementation.
  - Files of type `code` MUST carry the `generated` or the `spec-maintained` protocol.
- `config`: a file configuring a development tool for the repository itself, not for the implementation.
- `glossary`: a file defining project terms, each with its meaning and anti-meaning.
- `docs`: a file for human readers explaining the project, its purpose and provenance; not rules, specs, or glossary entries.
- `design`: a visual design source produced by a design tool (handoff notes, design components, theme values) that specs are derived from.
  - Files of type `design` MUST carry the `read-only` protocol.
  - When writing or changing a spec on a topic no other spec covers, the `design` files MUST be treated as the ground truth for that topic's layout, colors and texts.
  - When writing or changing a spec on a topic another spec already covers, the existing spec MUST be followed; do not fall back to the `design` files for that topic.
  - When it is unclear whether a spec covers a topic, AI MUST ask the user instead of choosing a source.
  - Files of type `design` MUST NOT be used as a source for `generated` or `spec-maintained` files; derive `generated` files from their Dependencies and Instructions only, derive changes to `spec-maintained` files from their Dependencies only, and close design gaps with a spec first.
- `content`: a data or text file the user maintains by hand and `build.py` reads as input (topic lists, interface texts per language, step and tool lists); not program logic and not generator configuration.
  - Files of type `content` MUST carry the `editable` protocol.
  - Changes by AI to a file of type `content` MUST follow an explicit user instruction naming the change; do not derive such changes from specs or `design` files.
  - Files under `src/articles/` MUST be written and revised per `article-writing.md`.

AI MAY propose new types; AI MUST NOT introduce them silently. Adding a type requires explicit user approval and an entry here.

#### Protocol

The Protocol column carries a behavioral discipline applied to the file. The set of permitted protocols is closed. Only the following protocol values are allowed:

- `read-only` — AI MUST NOT modify or delete the file; the user MAY edit it directly. The `Dependencies` and `Instructions` columns MUST be left empty for this protocol.
- `append-only` — AI MAY only append new entries. AI MUST NOT delete or modify the file or any past entries; corrections MUST be added as new entries that reference the prior entry by its identifier. The user MAY still edit or delete the file directly. The `Dependencies` and `Instructions` columns MUST be left empty for this protocol.
- `editable` — no protocol-level restrictions on modification; AI MAY modify the file as needed. Deletion requires user approval per the **Inventory change** rule. The `Dependencies` and `Instructions` columns MUST be left empty for this protocol.
- `generated`: the file is a build artifact derived from the files in its Dependencies column, following the file in its Instructions column.
  - AI MUST NOT edit a `generated` file directly; change a file listed in its Dependencies or Instructions and regenerate instead.
  - The user SHOULD NOT edit a `generated` file directly; regeneration overwrites such edits.
  - AI MUST derive the file's content only from its Dependencies and its Instructions file.
  - The Dependencies column MUST list at least one registered file: the specs the file implements and any other `generated` files whose interfaces it uses.
  - The Instructions column MUST name a registered `rules` file holding the generation instructions.
  - When a file listed in Dependencies or Instructions changes, AI MUST flag the dependent `generated` files as stale and regenerate them only after user approval.
- `spec-maintained`: the file is implementation code written before the spec process, whose behavior is not yet fully specified; it is kept current by targeted edits that implement approved specs.
  - AI MUST NOT change a `spec-maintained` file except to implement an approved spec; for any other change, write or change a spec first.
  - AI MUST apply such changes as targeted edits to the existing content; do not regenerate the file.
  - Every change to a `spec-maintained` file MUST be traceable to a spec listed in its Dependencies column.
  - The Dependencies column MUST list every registered spec that concerns the file; it MAY be empty while no spec concerns the file.
  - The Instructions column MUST name the registered `rules` file holding the generation instructions once that file exists; it MUST be left empty until then.
  - When a spec listed in Dependencies changes, AI MUST flag the `spec-maintained` file as out of date and edit it only after user approval.
  - A `spec-maintained` file MUST switch to the `generated` protocol only when its entire behavior is specified, and only after explicit user approval.

Every registered file MUST carry an explicit protocol value. AI MAY propose new protocols; AI MUST NOT introduce them silently. Adding a protocol requires explicit user approval and an entry here.

#### Extension

Registered file names use one extension separated by a single period, except dot-files without an extension per the **Dot-file extension** rule and files of type `design` per the **Design-tool exemption** rule.

The extension MUST be derived from the File column as the part of the file name after its last period, including that period (e.g. `.md` for `AGENTS.md`). A leading dot per the **Leading dot** rule is not an extension separator; a dot-file without a further period has no extension (e.g. `.gitignore`).

The Registered Files table MUST NOT carry an Extension column; derive the extension from the File column instead.

The set of permitted extensions is closed. Only the following extensions are allowed:

- `.txt`
- `.md`
- `.pdf`
- `.html`
- `.xlsx`
- `.docx`
- `.pptx`
- `.css`
- `.j2`
- `.json`
- `.yml`
- `.conf`
- `.py`

AI MAY propose new extensions; AI MUST NOT introduce them silently. Adding an extension requires explicit user approval and an entry here.

#### Subfolder

The Subfolder column holds a path relative to the project root, expressed without leading or trailing slashes. A single-level subfolder appears as `name`; nested subfolders appear as `name1/name2`. The cell is empty when the file lives at the project root. Subfolder path segments MUST consist only of lowercase English letters (a–z), digits (0–9), dashes (`-`), and underscores (`_`); path segments MUST NOT contain a period, except a single leading dot per the **Leading dot** rule.

Placement conventions:

- Files of type `log` SHOULD be placed in the `.ai/logs/` subdirectory unless a specific reason exists otherwise.

#### Description

Every registered file MUST have a non-empty Description.

The Description column carries a short free-text statement of what _kind_ of information the file holds and what role that kind of information plays in the project. A Description names the file's contents by category - the rule by which what goes into the file is determined - rather than summarizing what the file currently says. It determines routing when deciding where new information should go, and where to read the desired information from; it is an invitation to read the file when needed, not a replacement for reading it.

The rules that govern Description content - abstraction, non-overlap, and the enforcement check - are stated in the **Discipline** subsection below.

#### Dependencies

The Dependencies column lists other registered files that this file depends on. The value is a comma-separated list of registered file names, or empty when the file has no dependencies. Every entry MUST resolve to a registered file via the **Reference resolution** rule.

The use of this column — whether a file requires it, and what its entries signify — MUST be explicitly governed by the file's Protocol. Every Protocol MUST state how it uses or does not use this column.

#### Instructions

The Instructions column holds the registered name of a single file containing instructions associated with this file, or is empty. When non-empty, the value MUST resolve to a registered file via the **Reference resolution** rule, and the referenced file MUST have type `rules`.

The use of this column — whether a file requires it, and what the referenced file signifies — MUST be explicitly governed by the file's Protocol. Every Protocol MUST state how it uses or does not use this column.

### Discipline

- Inventory change. Any change to the project's file inventory — creation, deletion, rename, or move — MUST be reflected in the File Registry. AI MUST propose the registry update (a complete row for additions; the affected row for changes; the deletion target for removals) and obtain explicit user approval. Only after approval MAY AI write the registry update or perform the file-system operation.

- Naming convention. Registered file names and subfolder path segments MUST consist only of lowercase English letters (a–z), digits (0–9), dashes (`-`), and underscores (`_`), except as allowed by the **Leading dot** rule. File extensions MUST follow the same restriction. AI MUST NOT register a non-conforming name and MUST propose a conforming alternative.

- Leading dot. A file name or subfolder path segment MAY start with a single leading dot (e.g. `.gitignore`, `.ai`, `.python-version`); the dot is part of the name, not an extension separator, and the rest of the name MUST follow the **Naming convention** rule.

- Dot-file extension. A file whose name starts with a dot MAY have no extension.

- Name uniqueness. No two entries in the File Registry MAY share the same value in the File column, compared case-insensitively, regardless of subfolder. When a proposed file name collides with an existing entry, AI MUST flag the collision and propose a distinct name before registration.

- Path discipline. AI MUST place every registered file at the path recorded in its registry row (subfolder plus file name). Moving a file requires updating the row first; loose files outside their registered path MUST be flagged when detected.

- User-facing placement. AI MUST place files intended for the user to read or use as part of the project in their registered location, registering them first. Such files MUST NOT be placed in the scratch directory `.tmp/`.

- Registration tie-break. When uncertain whether a new file is transient or for human consumption, AI MUST treat it as for human consumption: propose a registry row and ask.

- Type-discipline lookup. Before reading or writing a registered file, AI MUST consult the file's Type and Protocol entries and apply the discipline they carry.

- Unregistered-file edits. AI MUST NOT modify an unregistered file; propose its registry row per the **Inventory change** rule first and change the file only after the row is approved. Reading an unregistered file remains allowed, so that a Description can be proposed. Files in `.tmp/` and paths matched by a pattern in `.gitignore` are exempt per the **Scratch exemption** and **Ignored-path exemption** rules.

- Reference resolution. When a rule references a file by name, AI MUST resolve the reference against the File Registry's file rows. AI MUST NOT check disk presence for the purposes of reference resolution. Unresolved file references MUST trigger the **Undefined References** rule.

- Agent-imposed exemption. The file `AGENTS.md` is exempt from the Naming Convention, Name Uniqueness, Path Discipline, and Subfolder Convention rules — its name and location are dictated by the AI agent. The registry's Description field for `AGENTS.md` MUST note this agent-imposed nature.

- Platform-imposed exemption. The file `README.md` is exempt from the Naming Convention rule; its uppercase name follows the convention by which code hosting platforms display a repository's front page.

- Platform-imposed note. The registry's Description field for `README.md` MUST note its platform-imposed name.

- Build-tool exemption. The files `Dockerfile` and `justfile` are exempt from the Naming convention rule and from the single-extension requirement of the Extension section; their names are dictated by the build tools that read them. The registry's Description field for both MUST note this tool-imposed nature.

- Design-tool exemption. Files of type `design` are exempt from the Naming convention rule and from the single-extension requirement of the Extension section; keep the names the design tool assigned, because the handoff refers to the files by those names. Their extension is derived per the **Extension** section (e.g. `.html` for `Main.dc.html`) and MUST be a permitted extension.

- Design-tool note. The registry's Description field for every file of type `design` MUST note its tool-imposed name.

- Scratch exemption. Files inside `.tmp/` are exempt from all File Registry rules — registration, naming, uniqueness, path discipline, type and protocol assignment. The scratch directory is governed by the **Scratch Directory** section above.

- Ignored-path exemption. Paths matched by a pattern in `.gitignore` are exempt from all File Registry rules; they are tool-managed transient paths, not scratch directories.

- Ignore-pattern scope. Patterns in `.gitignore` MUST cover only transient paths created by tools (virtual environments, bytecode, tool caches) and `.tmp/`; do not add a pattern to keep a file out of the File Registry, register the file instead. A pattern in `.gitignore` is not a reference in the sense of the Scratch Directory rules.

- Generator-output exemption. Files written by `build.py` are exempt from the **Inventory change**, **Name uniqueness** and **Unregistered-file edits** rules and are not registered individually; the set of exempt files is derived from the writes in `build.py`, not from a path pattern. Files under `html/` that the generator does not write remain registered individually.

- Generator-output edits. AI MUST NOT edit a file written by `build.py` by hand; change the files the generator reads and run the generator instead.

- Description abstraction. A Description MUST state what kind of information the file holds and what role that kind plays in the project. A Description MUST NOT summarize, paraphrase, or restate the file's current contents; it MUST describe the file by category, not by content snapshot. When a proposed Description summarizes content, AI MUST rewrite it to name the kind of information instead and present the rewrite to the user before the registry change proceeds.

- Description non-overlap. No two Descriptions in the File Registry MAY cover overlapping kinds of information. When a proposed Description's scope intersects an existing Description's scope, AI MUST flag the overlap, identify the overlapping rows, and offer resolution options - narrow the proposed Description, narrow the existing Description, narrow both descriptions, or consolidate the files under one Description - before the registry change proceeds.

- Description compliance check. Before AI proposes any addition or modification to the File Registry that introduces or changes a Description, AI MUST verify the proposed Description against the **Description abstraction** and **Description non-overlap** rules. If either check fails, AI MUST present the failure and the available resolution options, accept the user's choice, apply it without changing File Registry on disk, and re-run both checks. AI MUST repeat this loop until both checks pass; only then MAY AI present the proposed row to the user for approval under the **Inventory change** rule. This check has no override.

- Acyclicity. The Dependencies column entries of `generated` files MUST NOT form a chain that loops back on itself. A registry change that would introduce such a loop MUST be refused.

### Registered Files

| Subfolder                                    | File                        | Type  | Protocol    | Dependencies | Instructions | Description                                                                                                                                             |
| -------------------------------------------- | --------------------------- | ----- | ----------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                                              | `AGENTS.md`                 | rules | editable    |              |              | Durable project rules and the index of all project files. \_Agent-imposed name and location (AGENTS.md convention, read by Claude Code and other coding agents); see Agent-imposed exemption rule.\_ |
| `.ai`                                        | `rule-analysis.md`          | rules | editable    |              |              | Rule analysis protocol — applies when creating or editing durable rules                                                                                 |
| `.ai`                                        | `rule-conflict-protocol.md` | rules | editable    |              |              | Runtime rule conflict procedure — applies when a conflict is detected during request processing                                                         |
| `.ai` | `article-writing.md` | rules | editable |  |  | Article writing rules: apply when writing or revising a knowledge article text under `src/articles/` (structure, voice, permitted sources, rewrite pass, commit workflow) |
| `.ai`                                        | `glossary.md`               | glossary | editable |              |              | Project vocabulary: meaning and anti-meaning of terms used in rules, specs and conversation; normative definitions stay in the defining file, which each entry names. |
|                                              | `.gitignore`                | config | editable   |              |              | Version control ignore patterns: declare which tool-managed transient paths stay out of git and out of the File Registry.                              |
| `.ai/logs`                                   | `rule-conflict-log.md`      | log   | append-only |              |              | Audit log of runtime rule conflicts and their resolutions                                                                                               |
|  | `README.md` | docs | editable |  |  | Public project overview for human readers: what the project is, how its material is organized, and where that material comes from. _Platform-imposed name (README convention); see Platform-imposed exemption rule._ |
| `docs/design` | `HANDOFF.md` | design | read-only |  |  | Design handoff guidance: how the design sources are meant to be turned into the site. _Tool-imposed name; see Design-tool exemption rule._ |
| `docs/design` | `themes.security.dark.css` | design | read-only |  |  | Theme values as CSS rules: the colors the theme applies to page elements, in machine-readable form. _Tool-imposed name; see Design-tool exemption rule._ |
| `docs/design/design` | `Main.dc.html` | design | read-only |  |  | Design component for the start page: reference layout, styles, texts and behavior of the landing page sections. _Tool-imposed name; see Design-tool exemption rule._ |
| `docs/design/design` | `Wissen.dc.html` | design | read-only |  |  | Design component for the knowledge section: reference layout and texts of the AI-security topic overview. _Tool-imposed name; see Design-tool exemption rule._ |
| `docs/design/design` | `Theme.dc.html` | design | read-only |  |  | Design component for the color roles: which role each theme color plays, as a visual reference sheet. _Tool-imposed name; see Design-tool exemption rule._ |
| `specs` | `001-version-display.md` | spec | editable |  |  | Spec for the deployed-version display: intended behavior of the version identifier on pages and at the version endpoint, and the reasons for it. |
| `specs` | `002-knowledge-topics.md` | spec | editable |  |  | Spec for the knowledge topic list: identifiers, grouping, order and start page selection of the topics, and the reasons for them. |
| `specs` | `003-knowledge-articles.md` | spec | editable |  |  | Spec for the knowledge articles: how an article file becomes a page per language, the page structure and what overview, sitemap and language links derive from it, and the reasons for it. |
|  | `Dockerfile` | code | spec-maintained | `001-version-display.md` |  | Container image recipe: how the delivered site is packaged into the web server image and which build-time values it takes. _Tool-imposed name; see Build-tool exemption rule._ |
|  | `justfile` | code | spec-maintained | `001-version-display.md` |  | Task runner recipes: the local and CI entry points for rendering, checking, stamping, serving and building the site. _Tool-imposed name; see Build-tool exemption rule._ |
| `.github/workflows` | `build.yml` | code | spec-maintained | `001-version-display.md` |  | CI pipeline definition: which checks run on a push and how the image is built and published. |
| `nginx` | `default.conf` | code | spec-maintained | `001-version-display.md` |  | Web server configuration: how requests are routed and which content types and cache rules apply. |
| `src/templates` | `base.html.j2` | code | spec-maintained | `001-version-display.md` |  | Page skeleton template: the markup shared by every page (head, header, footer) that the page templates extend. |
| `src/templates` | `index.html.j2` | code | spec-maintained | `003-knowledge-articles.md` |  | Start page template: the markup of the landing page sections, built on the page skeleton. |
| `src/templates` | `wissen.html.j2` | code | spec-maintained | `003-knowledge-articles.md` |  | Knowledge overview template: the markup of the topic overview page, built on the page skeleton. |
| `src/templates` | `article.html.j2` | code | spec-maintained | `003-knowledge-articles.md` |  | Article page template: the markup of one knowledge article page, built on the page skeleton. |
| `src/templates` | `cta.html.j2` | code | spec-maintained | `003-knowledge-articles.md` |  | Call-to-action fragment: the contact block included by the pages that end with it. |
| `src` | `site.json` | code | spec-maintained | `001-version-display.md`, `002-knowledge-topics.md` |  | Site configuration: languages, pages, base URL and external links the generator renders from. |
| `src` | `build.py` | code | spec-maintained | `001-version-display.md`, `003-knowledge-articles.md` |  | Site generator: the program that renders the committed pages and the sitemap from the sources in `src/`. |
| `html/assets/css` | `main.css` | code | spec-maintained | `001-version-display.md`, `003-knowledge-articles.md` |  | Stylesheet: the visual rules for all pages, in the form the browser loads. |
| `src` | `topics.json` | content | editable |  |  | Knowledge topic list: which topics the knowledge section offers, in which group, under which identifier and address, with their short texts per language. |
| `src/i18n` | `de.json` | content | editable |  |  | Interface texts, German: all page copy outside the topic list, the walkthrough steps and the tool list, keyed for the templates. |
| `src/i18n` | `en.json` | content | editable |  |  | Interface texts, English: all page copy outside the topic list, the walkthrough steps and the tool list, keyed for the templates. |
| `src/i18n` | `el.json` | content | editable |  |  | Interface texts, Greek: all page copy outside the topic list, the walkthrough steps and the tool list, keyed for the templates. |
| `src` | `engagement.json` | content | editable |  |  | Engagement walkthrough steps: the sequence of animated terminal steps on the start page, each with its mode, command, log line and agent set. |
| `src` | `tools.json` | content | editable |  |  | Tool list: the tool groups shown on the start page, each with its label per language, emphasis flag and tool names. |
| `src/articles` | `prompt-injection-de.md` | content | editable |  |  | Knowledge article text, German, for the topic prompt-injection. |
| `src/articles` | `excessive-agency-de.md` | content | editable |  |  | Knowledge article text, German, for the topic excessive-agency. |
