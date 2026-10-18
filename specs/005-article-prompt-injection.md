# 005 Article prompt injection

Status: approved 2026-10-18

## Why

LLM01:2026 Prompt Injection is the first entry of the OWASP list and the
entry point of most LLM incidents on record: an attacker places text where a
model reads it, and the model does the rest with the privileges of the
application. The German article `prompt-injection-de.md` was the acceptance
run of spec 003 and the first article on the site. It was written before
`article-writing.md` existed and before any spec fixed its content, so it is
registered as `content` and cannot be revised or translated from a spec.

Measured against the rules it predates, the article has four gaps. It opens
with a definition instead of a scene. It has no neighbour section, although
the LLM02 and LLM03 articles both link to it and hand it the input side. It
knows direct and indirect injection but nothing of the two properties that
make OWASP's 2026 entry wider than its predecessors: injections that persist
in memory and retrieval corpora, and injections through surfaces the team
trusts, such as its own issue tracker read by an agent under the developer's
credentials. And its lead uses dashes as punctuation.

The 2026 OWASP text is also the one that argues, with NIST and NCSC behind
it, that no reliable prevention exists and defence has to be architectural.
That is the position the existing article already takes. This spec keeps it,
decides which of OWASP's eight forms and nine scenarios make it into 600 to
900 words, which case is told as a report and where the neighbours take over,
so the article follows from the spec the way the supply chain article follows
from spec 004.

A documented, publicly linked research demonstration opens the article so
readers can check the attack and its outcome against a primary source.

The reader is someone who runs Linux systems and has never built an LLM
application. For that reader an article that describes properties of the
model stays abstract, however correct it is. The attack becomes visible
when the reader can watch it: the text the attacker wrote, where it hides,
and the model acting on it with the developer's rights. So this spec fixes
the reader and, in place of a static sketch, places the chaptered animation
of spec 006 at the `[animation]` line, which replays the RoguePilot case on
familiar surfaces at the reader's own pace.

The lists of variants and source passages in this spec are the writer's
research, gathered once so the article does not have to gather it again.
Read as text, they are a trap: an article that reproduces them reads like a
spec, with lists, source names and identifiers in place of explanation. So
this spec separates what the writer reads from what the reader gets, and
sets a budget for checks and countermeasures that leaves the words to
explaining.

## What

### Topic and files

The article covers topic `LLM01:2026` of the `llm` group, slug
`prompt-injection`, with the title and summary from `topics.json`. The German
article `prompt-injection-de.md` exists and is revised to this spec; the
revision is the acceptance run. An English or Greek article on the topic is a
translation of the German one with the same structure, case and sources, on
a later instruction.

Front matter, page and publication follow spec 003; the text follows
`article-writing.md`. This spec fixes only what those leave open: the angle,
the opening scene, the introduction, the forms, the case, the neighbours,
the checks and the countermeasures.

### Reading this spec

The lists in this spec are research notes for the writer, not text to
reproduce. A list of variants under a form says what the writer may draw
on; the form picks what its explanation needs. A pointer to an OWASP
example, scenario or mitigation, or to a passage of a book, says where the
writer reads; it does not say that the body names that source. How the body
names sources is fixed under **Sources in the body**.

### Reader

The article is written for someone who runs Linux systems and has never
built an LLM application. Every term that reader does not have is
explained in the sentence it first appears in, or left out. In the German
article that concerns Kontextfenster, Systemprompt, Agent, MCP and
Wissensbestand, and every other term of LLM application building by the
same test.

Concrete before abstract: where the article explains, it shows first. Each
form shows, in quotes, the text the attacker placed, before it says what
happens. The body contains no sentence that only describes a property of
the model; a property is shown through what the model does with a text.

One idea per paragraph. A paragraph that carries two ideas is split.

### Angle

The article holds one line of argument: a language model receives
instructions and data in one channel, so there is no equivalent of a
parameterized query, and a defence that tries to recognise the attack at the
input will be bypassed. What holds is the architecture around the model:
what the model is allowed to do, under which identity, and what its output
is allowed to reach. OWASP, Wilson and Kimmerle and Okeyode all end at this
point; the article starts there.

The point of view is the host and the agent: where text enters the context
(the chat, a fetched page, a mail, a ticket, a tool result, a memory store),
under which identity the process that acts on the model's output runs, what
that identity reaches (shell, file system, cloud API, MCP servers) and where
an injected instruction stays after the session ends. The article owns the
input boundary; what the model may do with its tools is LLM03.

### Opening scene

The body opens with the RoguePilot case as a short hook, not as the
step-by-step account: the animation carries the steps. The hook is a few
sentences that name what happened, in this order and no more: the developer
clicks "Code with agent mode" in a GitHub issue; Copilot reads the issue
text as instructions and acts with the developer's rights; the developer's
token leaves the machine. Its last sentence names the attack class the
reader is about to watch: a prompt injection. The reader must come away
understanding the trick, that Copilot read text that sat in the issue as
instructions, and knowing that the animation below shows it step by step.
The symbolic link to the token file, the schema address that carried the
token out and the takeover are not told; the sentence that the token leaves
is enough. The case section below keeps that detail for the writer.

Identify the case as Orca Security's research demonstration and link the
report directly in the hook, so the source stands next to the animation.
The hook is not followed by a one-line paragraph with the publication date
and the report to GitHub; those facts stay in the case section of this spec
and in the sources list, and the body may leave them out.

Do not frame the case as a hypothetical scene, a zero-click attack, or a
reported compromise of a customer's repository.

### Introduction

After the hook, the section headed "Worum es geht" explains the mechanism
in two paragraphs with the animation of spec 006 between them, at a line
that consists only of `[animation]`.

The first paragraph: a language model receives instructions and data in one
channel. The system prompt, the user's question and the content of a
fetched document arrive as the same kind of text, and the model cannot tell
where a sentence comes from. A sentence that reads like an instruction is
one, whoever wrote it. The paragraph hands the reader to the animation.

The animation replays the RoguePilot case the hook told, now step by step,
so the reader sees where the instruction hides and how the model cannot
separate it from its task. Its scene, chapters, interactive moment and
switch are fixed under **Animation** below; its format and mechanics are
spec 006. The prose does not repeat the chapters; it orders the animation
into the article.

The second paragraph argues from what the animation shows: what the model
does with the attacker's line is what it does with the developer's line,
because following instructions found in text is what the model is trained
for. This is not a defect that a later model version fixes; the attack uses
the trained behaviour, not a bug beside it. So there is no prepared
statement, no syntax that would separate command from data, and nothing at
the input that can tell the two apart with certainty. The comparison with
SQL or shell injection may serve as the reader's anchor, but the section
explains the mechanism of the model, not the one of the database.

The section ends where the angle starts: because the attack cannot be
recognised at the input, the defence is the architecture around the model.
It does not list what that architecture consists of; the countermeasures
do.

### Animation

The article carries one animation of spec 006 at the `[animation]` line in
"Worum es geht". Its scene file is `src/articles/prompt-injection-de-scene.j2`,
in German, built as the design component `PromptInjectionPlayer.dc.html`
shows it. Spec 006 fixes the format, the player, the cues, the storyboard
and the checks; this section fixes what 006 delegates to the article spec.

**Audience and core statement.** The animation is for the reader of this
article: someone who runs Linux systems and has never built an LLM
application. Its one sentence: an agent reads a text that carries a hidden
instruction and acts on it with the developer's rights, so the attacker
needs only to write an issue.

**Case and source.** The animation shows the RoguePilot case as a
documented case per `article-writing.md`, not a constructed scenario, so no
marker sentence precedes the first caption. The sole source for its facts is
Orca Security's report, named and linked in the hook and listed in
`sources`; the prose next to the animation names Orca Security. The scene
states no fact the report does not, adds no actors or numbers, and carries
the symbolic link and the schema address no more than the hook does: the
agent reads a credentials file and a request carries the token out, and
that is as far as the scene goes.

**Surfaces.** Three surface kinds, reused from spec 006's style vocabulary:
the issue editor and the rendered issue page (light, the greys and greens
of a code host), one prompt surface (light, centred) where two blocks merge
into one, and an agent log (dark, the colours of a log). Chapters five and
six use the agent log, not the CI run log of the design component. The
design component shows an automated Actions job; RoguePilot's point is the
opposite: the agent runs interactively in the developer's own Codespace,
under the developer's token, not under a separate workflow identity. The
agent log shows the agent reading the issue, requesting a tool and the
request leaving, each attributed to the agent acting as the developer. A
bare terminal would show the commands but not whose rights ran them, which
is the whole case. The surfaces carry generic invented names (`example/app`,
a generic developer account, a generically named agent), no brand name, no
logo; tokens are masked as `ghs_••••3fA`; issue numbers and timestamps are
visibly generic props.

**Chapters.** Six chapters. The design component packs the writing and the
sending of the issue into one chapter with two captions; spec 006 allows a
chapter only one caption, so this is split into two chapters. The switch
(below) changes chapters five and six; chapters one to four are identical in
both variants.

| # | `data-label` | `data-address` | `data-duration` | Surface | Caption (core statement in bold, then one or two sentences) |
| - | ------------ | -------------- | --------------- | ------- | ----------------------------------------------------------- |
| 1 | `Issue` | `example/app · Issues · Neu` | 11000 | issue editor | **Der Angreifer schreibt ein Issue.** Ein plausibler Bug-Report, und mitten darin ein HTML-Kommentar mit einer Anweisung an den Agenten. |
| 2 | `Abgeschickt` | `example/app · Issues · #482` | 7000 | rendered issue page | **Danach ein ganz normales Issue.** Der Code-Host zeigt HTML-Kommentare nicht an. Wer das Issue liest, sieht nur einen höflichen Bug-Report. |
| 3 | `Versteckt` | `example/app · Issues · #482` | 9000 | rendered issue page, lens | **Unsichtbar, aber da.** Die Lupe zeigt den Quelltext unter der Oberfläche. Für ein Modell ist der Kommentar ganz normaler Text. Ziehen Sie die Lupe selbst darüber. |
| 4 | `Ein Text` | `example/app · Codespace` | 8000 | prompt surface | **Aus Auftrag und Issue wird ein Text.** Der Entwickler öffnet den Agenten auf dem Issue. Seine Anweisung und der Issue-Text stehen im selben Prompt, das Modell trennt beide nicht. |
| 5 | `Agent` | `example/app · Codespace · Agent` | 8500 | agent log | two captions, per variant (below) |
| 6 | `Verlässt` | `example/app · Codespace · Agent` | 7000 | agent log | two captions, per variant (below) |

**Cues**, from the vocabulary of spec 006 only:

- Chapter 1: `type` on the issue body, the hidden-comment part marked up as it is typed; `press` on the submit control.
- Chapter 2: `swap` from the editor to the rendered page; `show` on a small note that the HTML comment is not displayed.
- Chapter 3: the lens as the interactive moment (below); no other cue.
- Chapter 4: `merge` of the developer's instruction block and the issue block into one prompt.
- Chapter 5: `lines` on the agent log up to the read of the credentials file.
- Chapter 6: `lines` on the further log entries; `show` on the outbound-request indicator.

**Interactive moment.** The lens, in chapter three, on the rendered issue
comment: the rendered layer shows the polite bug report, the `data-raw`
layer shows the same text with the hidden HTML comment revealed and marked
in the alarm colour. This is the one place the reader discovers something by
hand, as in the design component.

**Switch.** Two variants, `exposed` (`ohne Schutz`) and `protected`
(`mit getrennten Rechten`). It changes chapters five and six; selecting a
variant takes the player to chapter five. The countermeasure is separation
of agent and credentials, least privilege: in `exposed` the agent holds the
developer's full token, read and write on the repository; in `protected` it
holds a short-lived token scoped to read only what its task needs. The
change is visible as configuration on the surface itself, the identity line
at the top of the agent log:

- `exposed`: `token: Entwicklerkonto · Lesen+Schreiben`
- `protected`: `token: repo:read · läuft in 10 min ab`

The `exposed` panels of chapters five and six carry `data-harm`. Captions:

| # | Variant | Caption |
| - | ------- | ------- |
| 5 | exposed | **Der Agent handelt mit den Rechten des Entwicklers.** Er läuft im Codespace unter dem Token des Entwicklers, folgt der versteckten Anweisung und liest eine Datei mit Zugangsdaten. |
| 5 | protected | **Dieselbe Anweisung, getrennte Rechte.** Der Agent hat nur ein kurzlebiges, nur lesendes Token, nicht das volle Konto des Entwicklers. Er liest die Datei weiter, der Token taugt aber kaum. |
| 6 | exposed | **Der Token verlässt die Maschine.** Eine Anfrage trägt ihn an einen fremden Host. Damit hat der Angreifer vollen Zugriff auf das Repository, ohne je ein System angegriffen zu haben. |
| 6 | protected | **Er verlässt die Maschine, bewirkt aber wenig.** Dieselbe Anfrage geht hinaus, der nur lesende Token gibt kaum etwas her. Das Restrisiko bleibt: der private Code ist lesbar, begrenzt, nicht null. |

The protected variant shows what the protection does honestly: it removes
the repository takeover, not the read of private code, and the injection
still ran. No claim a specialist can refute.

**Relation to the prose.** The text around the animation orders it into the
article and does not repeat the chapters. The hook tells the case as
narrative; the animation shows its steps; the forms section places it in the
class of indirect injection without retelling it.

### Forms of the risk

The article presents four forms, in this order. Each form shows first and
explains second: it opens with the text the attacker placed, in quotes,
inside one scene of two to three sentences from the host or agent point of
view; then it says what happens; then two to four sentences say why it
works. A form does not enumerate variants; where a variant appears, it
appears inside the scene or the explanation. The entries below give the
mechanism before the scene as material for the writer, not in the order
the body uses them. Each form rests on the OWASP text; the entries note
where OWASP and the books cover it.

1. **Direct injection.** Mechanism: the attacker writes into the input
   field, and the model weighs the attacker's sentence against the system
   prompt as two pieces of text, not as an order and a request. Pressure
   over several turns, invented roles and fake delimiters are ways of
   tipping that weighing; a user who pastes content that carries
   instructions tips it without meaning to. Scene: an internal operations
   chatbot that answers from runbooks is told, in the attacker's quoted
   words, that it is now in maintenance mode. Material: OWASP common
   example 1 and scenario 1; Wilson on forceful suggestion and misdirection;
   Kimmerle and Okeyode on delimiter confusion and context stuffing.
2. **Indirect injection, graded by trust.** Mechanism: the instruction sits
   in content the application reads in normal operation, and the
   application reads it with its own rights, not with the rights of whoever
   wrote it. OWASP grades the surface: untrusted (web pages, mail from
   strangers), semi-trusted (issue titles, package READMEs, third-party API
   responses) and trusted (the team's own repositories, databases, tickets
   and documents, where an attacker placed text through a low-privilege
   channel). The last grade is the one classic input validation misses,
   because the agent reads it with the developer's credentials. Scene: a
   coding assistant with an MCP connection to the code host works through
   open issues under the developer's token, and one issue carries the
   attacker's quoted sentence where the developer does not see it. This
   form places the opening scene in its class without retelling it.
   Material: OWASP common examples 2 and 3 and scenario 9; Wilson on the
   confused deputy, a term the body explains in the sentence (a process
   that carries out a stranger's instruction with its own, higher rights)
   or leaves out.
3. **Persistence.** Mechanism: an injection that writes to long-term
   memory, a RAG corpus or a vector store taints every later session that
   reads from it; the attacker is gone, the instruction stays, and the
   model reads it as part of its own context. Scene: a knowledge base
   indexed from a wiki that every employee can edit, with the attacker's
   quoted sentence on one page, and a memory store that is a file on the
   agent host that nobody reviews. Material: OWASP common example 6,
   scenario 4 and mitigation 9; Kimmerle and Okeyode on RAG poisoning as a
   persistent delivery path.
4. **Encodings, and why filters fail.** The form keeps one contrast: the
   instruction is not a string one could escape or block, but a meaning the
   model understands in any wording. Mechanism: a filter matches strings,
   the model reads meaning, so every wording the filter does not know
   (synonyms, Base64, invisible Unicode, a low-resource language, fragments
   spread over several fields) reaches the model intact; a guard model
   reads meaning too and inherits the weakness of the model it guards; and
   the same sentence is a command in the mail client and an attack inside a
   mail. Scene: a filter in front of the model drops "ignore previous
   instructions" and passes the same request in Base64 in a commit
   message; both the dropped sentence and the passed one are quoted.
   Material: OWASP common examples 5 and 8 and mitigation 11 on adaptive
   attackers; Wilson on rule-based filtering and special-purpose LLMs;
   Kimmerle and Okeyode on the keyword filtering illusion.

Not covered: multimodal and steganographic injection in images and audio
(OWASP common example 4 and scenario 6), the fine-tuning interface as a
gradient oracle (common example 7) and jailbreaking as a model-level problem
the provider owns. The article may name them in one sentence as out of its
scope, no more.

### Case from practice

The article tells one documented case: Orca Security's RoguePilot research,
published in February 2026. Starting a Codespace from an issue gives Copilot
the issue description, including hidden HTML comments. Injected instructions
make it check out a prepared pull request, read a privileged `GITHUB_TOKEN`
through a symbolic link, and place the token in a remote JSON schema URL.
The automatic schema fetch exfiltrates it, enabling repository takeover.
Orca reported the vulnerability to GitHub.

The sole source for these case facts is Orca Security's report,
[RoguePilot: Exploiting GitHub Copilot for a Repository Takeover](https://orca.security/resources/blog/roguepilot-github-copilot-vulnerability/).
Name Orca Security in the sentence and list the report with its URL in
`sources`. The opening is the complete case; the indirect injection section
explains its class without retelling it. No second case is told as a report.

### Neighbours

The German article introduces these relationships under "Welche Folgen ein
Angriff haben kann". Explain the connections through consequences and
controls, rather than describing an editorial division between articles or
calling the subjects "Nachbarthemen".

- Excessive Agency (LLM03:2026) owns the consequences: the tools, rights and
  autonomy that turn a successful injection into an incident outside the
  chat. This article owns the input boundary and says that the consequences
  are decided there; how to bound them is LLM03. OWASP draws the line the
  same way.
- Sensitive Information Disclosure (LLM02:2026) owns what the model leaks
  through its output, including the system prompt. This article names
  exfiltration as an outcome and points there.
- Improper Output Handling (LLM10:2026) owns the validation of model output
  before downstream components act on it. The article names schema
  validation as a countermeasure and hands the rest over.
- Vector and Embedding Weaknesses (LLM09:2026) owns the mechanics of
  retrieval stores. Form 3 says that a poisoned corpus persists; how a
  corpus is poisoned and isolated is LLM09.
- Supply Chain (LLM04:2026) and Agenten & Tool-Anbindung (INFRA·03) own MCP
  servers and tool descriptions as a supply chain surface, which OWASP
  delegates to the supply chain entry and to the agentic list.

The body names a neighbour by its title from `topics.json`, without the
identifier; the identifiers above are for the writer. A neighbour is linked
as a relative link only when it has a published article in the article's
language at the time of writing. The two with an article get their own
sentence each, with the link. The three entries without an article (Improper
Output Handling; Vector and Embedding Weaknesses; Supply Chain together with
Agenten & Tool-Anbindung) share one sentence, without links. At the time of
writing that means links to `../excessive-agency/` and
`../sensitive-information-disclosure/`, and none to the others.

### Pentest checks

Four checks, written as what the author does. Each check says what I look
at and what a finding looks like; it does not list every artefact I touch.

1. **Trust boundaries.** Which content reaches the context from which
   source: user, fetched documents, databases, tool and MCP server results,
   memory. How they are composed with the system instructions: separate
   system role, labels on foreign content, the task repeated after the data.
2. **Injection on every surface.** I attack through the chat (instruction
   override, invented roles, fake delimiters, encoded variants, several
   turns) and through the content the application reads: the uploaded PDF
   and the fetched page, and also the issue title, the README of a
   dependency and the support ticket. I document what gets through, not
   only what is blocked, and I test with the deployed defence known to me,
   because a defence that only holds against an attacker who has not read
   it does not hold. Then I watch whether the model calls tools the user
   never asked for.
3. **Blast radius.** Under which identity the agent acts, which tools it
   holds, whether tokens are scoped to the current user and operation,
   whether a human confirms before deleting, sending or paying. An agent
   that reads untrusted content, reaches private data and can communicate
   outward at the same time is a finding on its own; OWASP states this
   combination as a rule, and the body explains the three capabilities
   instead of naming the rule.
4. **Persistence and visibility.** Who can write to the memory store and the
   retrieval corpus, whether memory writes are logged with the prompt that
   caused them, whether outputs are checked against a schema before they
   are acted on, and whether a successful attack lands in the log with
   input, source, answer and triggered action.

### Countermeasures

Architecture first, filters last, per `article-writing.md`. The section
opens with its premise in one or two sentences: the most reliable measure
does not prevent the attack; it removes its effect. Assume an injection will
succeed and build so that the attacker gains little. That is OWASP's
position and Wilson's pessimistic trust boundary. Then six countermeasures,
each explained in two to three sentences that say what it changes for the
attacker, in this order:

1. Least privilege for the acting process: credentials and state changes
   stay in application code, not in the model; one token per session and
   operation, scoped to the current user; no delete API means "delete all
   customer data" has nowhere to go. OWASP mitigation 4.
2. Capability budget with a human in the loop: untrusted input, private
   data and outward communication are not held by one agent at once without
   a human confirming the action. The confirmation shows the exact action
   to be executed next to the original user request, so the contradiction
   is visible and an invisible-character payload cannot make the shown
   action differ from the executed one. OWASP mitigations 7 and 8.
3. Isolation: generated code runs in a container without network; database
   access goes through a read replica or predefined queries where user
   input fills parameters only.
4. Memory writes as privileged operations: logged, classified, approved
   before an instruction-bearing memory persists; write access to the
   corpus restricted and reviewed. OWASP mitigation 9.
5. Prompt structure: system role separated from user text, foreign content
   fenced and labelled as data, the task repeated after the data. Cheap,
   stops simple attacks, remains probabilistic and is bypassed by an
   attacker who knows the scheme. Wilson on adding structure; Kimmerle and
   Okeyode's defensive pattern; OWASP mitigations 1 and 6.
6. Output schema validated in trusted code, invisible characters stripped
   at ingest and render boundaries, every interaction logged with source
   and follow-up action, so an invisible attack becomes a visible event.
   OWASP mitigations 2 and 5; Kimmerle and Okeyode on runtime detection.

The section closes with one or two sentences on input filters and guard
models: they lower the noise and yield telemetry on attempts, and they are
not a load-bearing wall. OWASP mitigation 3; Wilson; Kimmerle and Okeyode.

### Sources in the body

The body names a source by surname only: Wilson; Kimmerle and Okeyode; Orca
Security for the case. It names a book's authors only where a statement
rests on that book beyond what OWASP says; a statement OWASP already makes
names nobody. Book titles do not appear in the body; the sources list
carries them.

OWASP is named at most twice in the body. The risk classification and the
general controls rest on the OWASP entry listed in `sources`, so sentences
that restate it do not name it again; the two mentions go where the article
relies on OWASP's position as such, for example on the grading of surfaces
or on the architectural premise of the countermeasures.

A term taken from a source, such as confused deputy or Rule of Two, is
explained in the sentence it appears in or left out. The body does not use
it as a label the reader has to look up.

### Lead

The lead keeps its point, that instructions and data travel in one channel
and whoever gets text into it has a say, and is reworded without dashes as
punctuation, per `article-writing.md`.

### Sources

The sources list holds the sources the text rests on, in the form
`article-writing.md` prescribes: OWASP LLM01:2026 with the resource page
URL, Wilson, Kimmerle and Okeyode, and Orca Security's RoguePilot report with
its URL. Farlow is listed only if the text uses her; her prompt injection
passages are a tactic list and a lab and may be left out.

## Constraints

- Everything `article-writing.md` requires applies unchanged: file name,
  front matter, section order, voice, word count, sources, rewrite pass and
  workflow. This spec does not restate it.
- The existing German article is the starting point of the revision.
  Passages that satisfy this spec are kept; passages this spec changes or
  adds are rewritten. The revision is not a new article from scratch.
- `updated` is set to the date of the revision.
- The animation does not count toward the 600 to 900 words; it is a figure
  per spec 006, not prose. The counted prose is the body without the figure.
- The animation follows spec 006 for its format and mechanics and this spec
  for its content. The scene file is the German one; an English or Greek
  translation gets its own scene file with the same chapters and cues and
  translated texts, on a later instruction.
- Title and summary of the topic stay as in `topics.json`. The name of this
  spec is not the topic's title.
- The only case told as a report is the one above. Everything else is
  mechanism, or a hypothetical scenario worded as such.
- Facts about the case come from the Orca Security report specified above;
  the article adds no detail from memory. The OWASP text under `2026/final/`
  remains the source for the risk classification and general controls.
- The article is a file of type `article`, generated from this spec per
  `article-writing.md`. It changes neither the generator, nor the templates,
  nor the publication logic.

## Out of scope

- The English and Greek articles. They follow as translations of the German
  one on later instructions, under this spec.
- Rule changes this spec suggests for every article, such as a reciprocal
  link rule between neighbours. They go into `article-writing.md` through a
  rule change, not through this spec.
- The content the article hands to its neighbours and the three OWASP forms
  it does not cover.
- Images and diagrams, as in spec 003. The animation is the exception spec
  003 and spec 006 name, not an image.
- The player, its template, the player module, the stylesheet and the
  interface texts the animation needs. They are built with the first scene
  per spec 006, not by this spec.

## Acceptance

1. `prompt-injection-de.md` is registered as `article` with this spec in
   Dependencies and `article-writing.md` in Instructions, with front matter
   per spec 003 and a body of 600 to 900 words.
2. The body contains, in this order: the opening hook, the introduction
   in two paragraphs with the animation of spec 006 between them at the
   `[animation]` line, the four forms, each as one scene of two to three
   sentences followed by one explained mechanism, the neighbour section,
   four checks, and the countermeasures with the premise first, six
   measures and filters last.
3. RoguePilot is the only case told as a report and opens the body, as a
   short hook. The hook names Orca Security, links its report, identifies
   the case as a research demonstration, and tells the developer's
   initiating click, Copilot reading the issue text as instructions and
   acting with the developer's rights, and the token leaving. It does not
   tell the steps the animation carries, and it tells neither the symbolic
   link, nor the schema address, nor the takeover. Its last sentence names
   the attack class. No paragraph with the publication date and the report
   to GitHub follows it. It contains neither the constructed mailbox scene
   nor the Invariant Labs case.
4. `../excessive-agency/` and `../sensitive-information-disclosure/` are the
   only neighbour links. Neighbours are named by title without identifier.
   Improper Output Handling, Vector and Embedding Weaknesses, Supply Chain
   and Agenten & Tool-Anbindung are named in one sentence without a link,
   unless a German article on one of them exists by then. Their section is
   headed "Welche Folgen ein Angriff haben kann" and explains the practical
   connections without the term "Nachbarthemen".
5. The lead contains no dash used as punctuation.
6. The body names sources by surname only, contains no book title, names
   OWASP at most twice, and uses no term from a source without explaining
   it in the sentence.
7. The sources list holds OWASP LLM01:2026 with the resource page URL,
   Wilson, Kimmerle and Okeyode, Orca Security's RoguePilot report with its
   URL, and Farlow only if the text uses her; no chapters, years or publishers.
8. `just build` renders `/wissen/ki-sicherheit/prompt-injection/` with the
   eyebrow `LLM-Anwendungen · LLM01:2026`, the German overview links the
   card, `sitemap.xml` has the German entry, and `just check-generated`
   passes.
9. The rewrite pass has been done and the two weakest passages have been
   named with their reasons.
10. "Worum es geht" contains the `[animation]` line, and no fenced code
    block in place of it. At the line the generator renders the animation
    of spec 006; the prose before and after it does not repeat the
    chapters. The 600 to 900 words are counted without the animation.
11. Each form opens with the attacker's text in quotes, before the form
    says what happens.
12. Kontextfenster, Systemprompt, Agent, MCP and Wissensbestand, where they
    appear, are explained in the sentence of their first appearance. No
    sentence only describes a property of the model. Each paragraph
    carries one idea.
13. The scene `src/articles/prompt-injection-de-scene.j2` exists and
    renders per spec 006: six chapters with the labels, addresses,
    durations and captions fixed under **Animation**; the lens in chapter
    three; the switch with variants `exposed` and `protected` changing
    chapters five and six; the RoguePilot surfaces with generic names and
    masked tokens; no marker sentence, because the case is documented.
14. Chapters five and six show the agent in the Codespace under the
    developer's identity, not a CI job; the protected variant shows a
    read-only short-lived token as the visible configuration change and
    names the residual risk in its caption.

## Touches

Orientation for the implementation, not an instruction: the registry rows
of `prompt-injection-de.md` and the scene file
`prompt-injection-de-scene.j2` (type, protocol, Dependencies, Instructions),
the article file and the scene file themselves, the generated pages under
`html/wissen/ki-sicherheit/prompt-injection/` and `sitemap.xml`, and the
player and styles spec 006 builds with the first scene. The article prose
itself touches no code file.
