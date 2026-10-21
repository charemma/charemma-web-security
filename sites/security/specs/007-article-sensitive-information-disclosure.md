# 007 Article sensitive information disclosure

Status: approved 2026-10-19, amended 2026-10-19 (article import, one
illustrated case), amended 2026-10-20 (problem before case, hidden
instruction shown, one foreign address), amended 2026-10-20 (constructed
oversharing scenario in the animation, EchoLeak in the prose only)

## Why

LLM02:2026 Sensitive Information Disclosure is the entry about what leaves
an LLM application through its output. The German article
`sensitive-information-disclosure-de.md` was written by hand on 2026-10-17,
before any spec fixed its content, and registered as `content`. It already
carries the right position: the model reaches more than the task needs, and
the chat answer is only one of many ways out. This spec started as the spec
of its animation alone; the article text stayed hand-maintained beside it.

A `content` article cannot be revised or translated from a spec. So the
article now goes under this spec and becomes a file of type `article`. The
spec imports the existing text as its requirements: it fixes the angle, the
opening, the four ways out, the neighbours, the checks, the countermeasures
and the sources the way the article has them, so that the existing text
satisfies the spec with as little change as possible. It is an import, not a
new article, with one exception: the opening. The existing text opens with a
constructed scene (an internal assistant that gives out the staging
database's credentials) and tells EchoLeak only in the bridge to the
animation. The revision that follows the import changes the opening as
fixed below; the material the spec adds beyond the text is marked as
material for that revision.

For the reader who runs Linux systems and has never built an LLM
application, the position stays abstract until the reader watches it. The
first two versions of the animation replayed EchoLeak (CVE-2025-32711): a
mail with a hidden instruction in the inbox, an unrelated question later, an
answer that looked ordinary, and confidential content leaving through an
address the client loaded by itself. Building it showed the flaw. The
decisive step of EchoLeak is the injection, which is LLM01. A faithful
replay shows a hidden instruction, and the reader reads "prompt injection",
whose article (spec 005) already has almost the same animation: a hidden
instruction, a secret leaving for a foreign host. `article-writing.md` now
says this in general: a case is chosen for its decisive step, not for being
well known, and a scene shows the article's risk in isolation.

The animation therefore shows the LLM02 core alone, as a constructed
scenario: oversharing through a search that reaches further than the rights
of the person asking. Nobody attacks, nothing is smuggled in, no tool acts.
A person with few rights asks a harmless question and gets figures from a
document that person could never open, because the index was built with a
service account that reads every share and the search ranks by similarity,
not by rights. The beneficiary is the one who asks. This is the position of
the article made visible: the model reaches more than the task needs, and
the correction lies at the boundary, in the index query, not at the model.
It is also a lesson a pentest reader takes seriously: the data reach
somebody who profits from them, and that somebody needed nothing but a
question.

EchoLeak stays, as the one documented case, in the prose: short, after the
animation, with its sources, and with the injection that triggered it in a
subordinate clause that links the prompt injection article. Its point for
this article is the output side: data from the assistant's reach left the
environment through the address of an automatically loaded image, a channel
nobody had treated as output. Prose and animation are two stories with one
lesson, and neither claims to be the other.

The introduction names the problem first, then shows it, then draws the
lesson, then gives the evidence. The problem comes first because the first
build showed what happens otherwise: told before the classification, the
case is the story, and the reader is in another article before this one has
said what it is about. Spec 005 may open with its case because the trick is
the point there; here the point is what leaves and to whom, and scenario and
case are its evidence.

The spec follows spec 005 in structure.

## What

### Topic and files

The article covers topic `LLM02:2026` of the `llm` group, slug
`sensitive-information-disclosure`, with the title and summary from
`topics.json`. The German article `sensitive-information-disclosure-de.md`
exists and is the starting point. Checking it against this spec is the
acceptance run; the import itself changes no passage, and the revision that
follows replaces the opening and the closing sentences and rewords one
example as fixed under **Opening**, **Forms of the risk** and
**Countermeasures**. An English or Greek article on the topic is a
translation of the German one with the same structure, case, scenario and
sources, on a later instruction.

Its scene file is `src/articles/sensitive-information-disclosure-de-scene.j2`,
in German, of type `scene` with this spec and spec 006 in its Dependencies
and `article-writing.md` in its Instructions. Spec 006 fixes the format,
the player, the cues, the storyboard and the checks; the **Animation**
section fixes what 006 delegates to the article spec. A translation of the
article gets its own scene file with the same chapters and cues and
translated texts, on a later instruction.

Front matter, page and publication follow spec 003; the text follows
`article-writing.md`. This spec fixes only what those leave open.

### Reading this spec

The lists in this spec are research notes for the writer, not text to
reproduce. Where a section says what the body contains, it describes the
existing text; where it says "material", it names what the writer may draw
on in a revision without the body having to carry it. How the body names
sources is fixed under **Sources in the body**.

### Reader

The article is written for someone who runs Linux systems and has never
built an LLM application. Concrete before abstract: each way out carries
one example from the host or pipeline point of view, and the introduction
states the problem in a few sentences and shows it at once, before any
list.

Terms of LLM application building that this reader does not have
(Embeddings, Reasoning-Traces, RAG, Prefix-Cache, Fine-Tuning, Adapter)
SHOULD be explained briefly in the sentence of their first appearance. The
imported text does not do this everywhere; a revision closes the gap where
the word budget allows, and the import does not fail on it.

### Angle

The article holds one line of argument: a model gives away what it sees,
and it sees more than the task needs. The chat answer is only one of many
ways out; tool call arguments, reasoning traces, retrieved chunks, logs,
telemetry and embeddings are outputs too. The correction lies at the data
surface and at the boundaries (index, memory, logs), not at the model.

The point of view is the host and the pipeline: what is indexed, with
which rights, since when; where context leaves (tool arguments, the
journal, the observability platform, caches, backups, embeddings); and who
may read there. This article owns the output side. What triggers a leak is
LLM01, prompt injection; how far a leak gets through tools is LLM03,
excessive agency.

### Opening

The section "Worum es geht" opens with the concrete problem, shows it in
the animation, draws the lesson and then tells EchoLeak as the one
documented case. Problem first: a system with a language model discloses
confidential, regulated or protected data over a channel the data's owner
never released, and the channel is not only the chat answer: arguments of
tool calls, retrieved chunks, logs, telemetry, reasoning traces and
embeddings are outputs too. This is the classification, OWASP's LLM02:2026,
in a few sentences, as fixed under **Introduction**. The last sentence of
the problem paragraph announces what the reader is about to see: a
constructed scenario in which somebody only asks. It says that the scenario
is constructed, so the prose and the first caption agree.

Then `[animation]`.

Then the lesson, in one or two sentences: nobody broke in, one question was
enough; the search reached further than the rights of the person asking,
and the answer gave out what that person could never have opened.

Then EchoLeak, as a short paragraph, not as a step-by-step account and not
as the story of the animation, per the rule in `article-writing.md` for a
documented case whose harm needs the weakness of another article: in
Microsoft 365 Copilot, confidential content from the user's own reach left
the environment through the address of an image the client loaded by
itself, without a click. The trigger, a hidden instruction in a mail, gets
at most a subordinate clause, and that clause links `../prompt-injection/`.
The paragraph names Aim Security as the discoverer, Microsoft 365 Copilot
and CVE-2025-32711, and links The Hacker News and Reddy and Gujral
directly, so the sources stand with the case. It does not tell the
retrieval, the raw form of the answer or the proxy of the documented
exploit; the proxy (the client's content policy blocked foreign addresses
and the exploit went through a service on the allowlist) gets at most a
subordinate clause or is left out. The prose names no host, neither for the
scenario nor for the case.

Do not tell the case as the animation's story, and do not open the section
with the case or the scenario: the problem comes first, the scenario shows
it, the case is evidence that it happens in production.

### Introduction

The section headed "Worum es geht" holds the problem, the animation of spec
006 at a line that consists only of `[animation]`, the lesson and the case,
in this order:

1. The problem: sensitive information disclosure, listed by OWASP as
   LLM02:2026: a system with a language model discloses confidential,
   regulated or protected data over a channel the data's owner never
   released. The channel is not only the chat answer: arguments of tool
   calls, retrieved chunks, logs, telemetry, reasoning traces and
   embeddings are outputs too and are, per OWASP, to be classified and
   redacted the same way. The last sentence announces the constructed
   scenario of the animation, as fixed under **Opening**.
2. `[animation]`.
3. The lesson: nobody broke in, one question was enough; the search
   reached further than the rights of the person asking.
4. EchoLeak, as fixed under **Opening**: the one documented case, short,
   with its sources, the trigger in a subordinate clause that links the
   prompt injection article, the focus on the data that left through the
   address of an automatically loaded image.

The prose does not repeat the chapters; it orders the animation into the
article.

### Animation

The article carries one animation of spec 006 at the `[animation]` line in
"Worum es geht". Spec 006 fixes the format, the player, the cues, the
storyboard and the checks; this section fixes what 006 delegates to the
article spec.

**Audience and core statement.** The animation is for the reader of this
article: someone who runs Linux systems and has never built an LLM
application. Its one sentence: a search that reaches further than the
rights of the person asking gives out what that person could never open,
and the person only has to ask.

**Scenario, not a case.** The animation shows a constructed scenario per
`article-writing.md`, not a documented case. The marker sentence `Ein
nachgestelltes Szenario:` stands as the first line of the caption of
chapter one, before the core statement, as spec 006's section on realism
says. The scenario has no source and needs none; it presents no real
company, product, person, date or figure; names, folders and the figures on
the surfaces are props and visibly generic. The prose announces the
animation as constructed in the sentence before it.

**The risk in isolation.** Every step the scene depicts belongs to LLM02,
as `article-writing.md` requires of a scene: a person with few rights asks,
the search retrieves beyond that person's rights, the model answers with
what it was given, the person has the figures. There is no attacker, no
instruction in any content, no mail, no tool call, no outbound request and
no foreign host on any surface or in any caption. The cause shown is the
reach of the search beyond the rights of the person asking, and nothing
else; what triggers a leak from outside is LLM01 and stays in that
article's animation.

**Why the search finds the document.** The index was built with a service
account that reads every share, and the search ranks chunks by similarity
without checking the rights of the person asking. For the reader this is
the database built as root and queried by anyone. Cause and countermeasure
meet in the same component: without protection the query checks no rights,
with protection it checks the rights of the person asking. The other way
the document could have been reachable, a link share open to everyone in
the company, is not the cause shown: a rights check would pass such a
document, and the switch would have nothing to show. It is the residual
risk the protected caption names.

**Surfaces.** Two surface kinds from spec 006's list, no new kind. The
assistant chat (chapters one, three, four and five): the header with the
assistant and the signed-in account, the conversation with the user's
message right-aligned and the assistant's answer left-aligned, the sources
bar `Quellen` under the answer with one entry per cited item and its
origin, the input field with the send button `Senden`; in chapter five
additionally a configuration line and an outcome line between the answer
and the input field, as the switch fixes them, and the sources bar carries
the entry that differs per variant. The prompt surface as the
context view (chapter two): a label line naming it as the context for the
model, one block per origin, each with a small uppercase label naming where
the block comes from. No log surface: there is no process whose lines would
say more than the chat and the context do.

Props. The person asking is signed in as `t.lang`, an external contractor:
header `Assistent · angemeldet als t.lang · extern`. The assistant is
`Assistent`; the host is `assist.example.net`, and no other host appears.
The documents are `Quartalsinfo für alle` in `Ablage/Allgemein`, readable
by everyone, and `Vorstand, vertraulich` in `Ablage/Leitung`, which
`t.lang` cannot open. Figures are masked as `••••`.

The question (chapter one, typed): `Wie steht das Quartal?`

The context view (chapter two): label line `Kontext für das Modell ·
Treffer der Suche`; the block `Von t.lang` with the question, in the
intended style; then the retrieved blocks, in the data style: `Aus
Ablage/Allgemein · Quartalsinfo für alle` with `Das Quartal läuft stabil,
Details folgen im Townhall am Freitag.` and `Aus Ablage/Leitung · Vorstand,
vertraulich` with `Umsatz Q3: ••••. Prognose Gesamtjahr: ••••. Nur für die
Leitung.`; under the sheet the line `Index: Dienstkonto · alle Ablagen`.
The confidential block is neutral: it is not malicious, only out of reach.

The answer (chapters three to five), two paragraphs: `Das Quartal läuft
stabil, Details folgen im Townhall am Freitag.` and `Der Umsatz Q3 liegt
bei ••••, die Prognose für das Gesamtjahr bei ••••.` Under it the sources
bar with `Quartalsinfo für alle · Ablage/Allgemein` and `Vorstand,
vertraulich · Ablage/Leitung`, both neutral in chapter three and in the
`answer` state of chapter four.

The provenance (chapter four, state `origin`): the same two paragraphs,
under each a provenance line in small muted type: `Quartalsinfo für alle ·
Ablage/Allgemein · Zugriff t.lang: ja` under the first and `Vorstand,
vertraulich · Ablage/Leitung · Zugriff t.lang: nein` under the second, the
second as a block in the alarm colour on the alarm tint with rounded
corners, as the hidden part of a raw layer in spec 006's design section.
This block is the first red of the scene. The sources bar belongs to the
`answer` state and is not repeated under the provenance: the provenance
lines take its place, so both states are about the same height.

**Chapters.** Five chapters. The switch changes chapter five only; chapters
one to four are identical in both variants. Labels have at most nine
characters.

| # | `data-label` | `data-address` | `data-duration` | Surface | Caption |
| - | ------------ | -------------- | --------------- | ------- | ------- |
| 1 | `Frage` | `assist.example.net · Chat` | 8000 | assistant chat | _Ein nachgestelltes Szenario:_ **Ein externer Dienstleister stellt eine harmlose Frage.** Er hat Zugang zum internen Assistenten wie alle, die im Haus arbeiten, und will wissen, wie das Quartal steht. |
| 2 | `Abruf` | `assist.example.net · Kontext` | 8000 | context view | **Die Suche findet, was zur Frage passt.** Sie bringt einen Infotext für alle und eine vertrauliche Vorlage mit den Zahlen. Beide gehen als Kontext an das Modell. |
| 3 | `Antwort` | `assist.example.net · Chat` | 8000 | assistant chat | **Der Assistent antwortet hilfreich, mit Zahlen.** Umsatz und Prognose, darunter die Quellen. Niemand musste etwas knacken. |
| 4 | `Vergleich` | `assist.example.net · Chat` | 9000 | assistant chat, compare | **Was diese Person bekam, und woher es stammt.** Der erste Satz kommt aus einem Text für alle, die Zahlen aus einer Vorlage, die t.lang in der Ablage nicht einmal öffnen könnte. Kippen Sie selbst zwischen beiden Ansichten. |
| 5 | `Rechte` | `assist.example.net · Chat` | 8000 | assistant chat | two captions, per variant (below) |

**Cues**, from the vocabulary of spec 006 only:

- Chapter 1: `type` on the question from 500 ms over 1500 ms; `press` on
  the send button at 2500 ms.
- Chapter 2: `lines` on the retrieved blocks from 500 ms over 3000 ms; the
  question block stands from the start.
- Chapter 3: `lines` on the answer's paragraphs from 500 ms over 2500 ms.
- Chapter 4: the comparison as the interactive moment (below); no other
  cue.
- Chapter 5: `lines` on the sources bar from 500 ms over 1500 ms; `show`
  on the outcome line at 3000 ms.

**Interactive moment.** The comparison (`data-aha="compare"`), in chapter
four, on the assistant's answer, with `data-at` 1000 and `data-for` 5000.
The two states are `answer` (`data-label` `Was diese Person bekam`), the
rendered answer as chapter three leaves it, and `origin` (`data-label`
`Woraus die Antwort stammt`), the provenance form fixed under
**Surfaces**. `answer` is the first state. This is the one place the reader
discovers something by hand: the answer did not change, what stands under
it did: one sentence from a text for everyone, the figures from a document
the person could not open.

The lens is not used: nothing hides at one spot inside the answer. The
uncovering is not used: nothing lies under a cover; the answer has a second
reading, not a second layer.

**Switch.** Two variants, `exposed` (`ohne Schutz`) and `protected` (`mit
Rechteprüfung`). It changes chapter five; selecting a variant takes the
player to chapter five. The countermeasure is authorization in the query:
the search checks the rights of the person asking before a chunk reaches
the model. It is visible as configuration on the surface itself, the
configuration line between the answer and the input field:

- `exposed`: `Suche: Rechte des Fragenden nicht geprüft`
- `protected`: `Suche: Rechte des Fragenden geprüft`

The line is short so that it stands on one line at a phone's width; the
reach of the index is on the context view of chapter two. Answer, sources
bar and outcome line per variant:

- `exposed`: both paragraphs of the answer; the sources bar with both
  entries, the second in the alarm colour with the tag `kein Zugriff`;
  outcome line `Die Zahlen sind bei einer Person ohne Zugriff`, in the
  alarm colour.
- `protected`: the first paragraph only; the sources bar with the first
  entry and, in the intended colour, the entry `1 Treffer ausgelassen ·
  Ablage/Leitung · kein Zugriff`; outcome line `Antwort innerhalb der
  Rechte von t.lang`, neutral.

The `exposed` panel of chapter five carries `data-harm`. Captions:

| # | Variant | Caption |
| - | ------- | ------- |
| 5 | exposed | **Die Suche fragt nicht, wer fragt.** Der Index liest mit einem Dienstkonto alle Ablagen und liefert nach Ähnlichkeit, nicht nach Rechten. Die Zahlen sind jetzt bei einer Person, die die Vorlage nie hätte öffnen dürfen. |
| 5 | protected | **Dieselbe Frage, die Suche prüft die Rechte.** Treffer, die t.lang nicht öffnen darf, bleiben draußen, und die Antwort kommt ohne die Zahlen. Restrisiko: Was im Quellsystem falsch freigegeben ist, besteht die Prüfung und kommt weiter durch. |

The protected variant shows what the protection does honestly: the figures
leave the answer because the chunk never reaches the model; the share is
not fixed. The residual risk follows: a document wrongly shared in the
source system passes the check, and the index still holds everything the
service account reads, so whoever reaches the index store reads it too.
The prose carries both as countermeasures, "Datenoberfläche verkleinern"
and "Autorisierung in der Abfrage"; the switch shows one configuration
change, as spec 005's does.

**Colour.** Red only for the disclosure and its consequence: the
provenance block of the figures in chapter four, and in the exposed panel
of chapter five the entry with the tag `kein Zugriff` in the sources bar
and the outcome line. Chapters one to three and the context view carry no
red.

**Phone.** At 390 px viewport width the frame is as wide as the content
column, and both states of chapter four and both panels of chapter five
stand inside the stage in full, down to the outcome line, without being cut
at the stage's bottom edge. The texts are short for that reason, and the
chat and the context view tighten on phones under spec 006's rule that
surfaces reflow inside the stage: the header on one line, texts a size
smaller, paddings and the stage's rim narrower.

**Relation to the prose.** The problem paragraph with its announcing
sentence, the lesson and the EchoLeak paragraph are fixed under
**Opening** and **Introduction**. None repeats the chapters: the problem
paragraph says what the reader is about to see an instance of and that it
is constructed, the lesson says what follows from it, the case shows that
it happens in production. All are as short as they can be, so the body
stays within its word budget.

### Forms of the risk

The section is headed "Vier Wege nach draußen". It presents four ways out
as four paragraphs in this order, each opened by its name in bold, each
with one example from the host or pipeline point of view, and each resting
on the OWASP text where the body says so ("nach OWASP").

1. **Beim Training.** What gets into training or fine-tuning data the model
   can later reproduce verbatim. Example: an adapter trained on old support
   tickets so the assistant answers in the support's tone, and some tickets
   hold SSH keys somebody pasted for debugging. Narrow adapters memorise
   rare examples especially faithfully (OWASP). Deleting the ticket leaves
   the key in the adapter.
2. **Zur Laufzeit.** The model passes on what lies in its context: system
   prompt, retrieved documents, tool outputs, memory, in the worst case
   another user's session. The cause mostly lies upstream (OWASP): open
   shares and stale permissions fill the index. Example, worded as a
   hypothesis ("Angenommen, ...") without the marker sentence of a
   constructed scenario: an internal assistant answers questions about the
   development environment; asked how to reach the staging database, it
   answers with host, user and password, because a colleague put a guide
   with those credentials into the team share and the share was indexed
   completely. Nobody attacked the model; it found the best-matching
   passage. This is the scene the text used to open with; it illustrates
   this form and stands nowhere else. Per `article-writing.md` the article
   carries at most one constructed scenario, and that is the animation; the
   imported text marks this example as a scenario, and the revision that
   follows this amendment rewords it as a hypothesis like the examples of
   the other three ways. Kimmerle and Okeyode show why RAG is weak here:
   vector similarity does not know who is asking. The second variety is
   memory at the wrong boundary: a shared cache, a shared vector namespace,
   where one session flows into another's output. Material for a revision,
   cut from the text for the word budget: two users with the same question
   get the same hits unless identity, tenant or document rights are
   filtered before the search.
3. **In Pipeline und Betrieb.** Observability platforms log complete
   prompts, answers and traces by default (OWASP). Example: an agent reads
   a customer account and writes customer number and address into the
   arguments of a tool call; the call lands in the journal on the host,
   where every account in group `adm` reads it. The answer to the user was
   clean, the log was not. Plaintext can be reconstructed from leaked
   embeddings, so a backup "only with embeddings" is a document leak
   (OWASP). Telemetry and logs are output channels here, in the prose,
   without a scene of their own.
4. **Durch Beobachtung.** The attacker gets no content and still learns
   something: from token lengths in the encrypted stream, from response
   times, from confidence values. On a shared inference server with a
   prefix cache, a prompt somebody has already asked answers measurably
   faster. Material for a revision, cut from the text for the word budget:
   Farlow classes this as a side channel, less reliable than direct attacks
   and harder to detect.

Material, not in the body: Wilson's question whether the model can know
too much, with the test of every data source by what happens when the
model gives it out; and the closing thought that what once sits in
weights, adapters or embeddings stays there after the source is deleted.
Both were in the text before the animation and were cut for its bridge; a
revision may bring them back where tightening frees the words.

### Case from practice

The article carries one documented case and one constructed scenario, as
`article-writing.md` allows. The documented case is EchoLeak, the
vulnerability in Microsoft 365 Copilot that Aim Security disclosed in June
2025, recorded as CVE-2025-32711. It is told in the prose as a short
paragraph after the lesson, per the rule for a documented case whose harm
needs the weakness of another article: the injection in a subordinate
clause with a link to the prompt injection article, the focus on the data
that left through the address of an automatically loaded image. Its facts
come from The Hacker News' report, Reddy and Gujral's case study and the
NVD record, named and linked as fixed under **Opening**; neither the text
nor anything else adds a detail from memory.

The constructed scenario is the animation, marked in its first caption and
announced as constructed by the prose. Neither claims to be the other: the
scenario shows the risk in isolation, the case shows that the output side
fails in production.

No second case is told as a report; the staging database example in "Zur
Laufzeit" is a hypothesis without the marker sentence, as fixed under
**Forms of the risk**.

### Neighbours

The section is headed "Nachbarn" and holds one paragraph. The most frequent
trigger is a prompt injection: an instruction in a document makes the model
output the system prompt with the API key, or pack retrieved data into an
outbound tool call. How far that second part gets is decided by excessive
agency. Both neighbours are named by their title from `topics.json` and
linked as relative links, `../prompt-injection/` and
`../excessive-agency/`, because both have a German article. The identifiers
LLM01:2026 and LLM03:2026 are for the writer, not for the body. The
EchoLeak paragraph links `../prompt-injection/` too, in its subordinate
clause; links to other articles lead only to these two.

Material, not in the body: system prompt leakage is OWASP's LLM08:2026 and
the mechanics of vector stores its LLM09:2026. The sentence that named them
was cut for the word budget; neither has a German article, so neither gets
a link.

### Pentest checks

The section is headed "Was ich im Pentest prüfe" and holds five numbered
checks, written as what the author does, each opened by its name in bold:

1. **Datenoberfläche.** What the application has indexed, not what it
   should have: which shares, with which rights, since when. A secrets
   scanner runs over the corpus as it would over a repository.
2. **Autorisierung vor dem Abruf.** Two accounts with different rights ask
   the same question, then I look for where filtering happens: in the index
   query or only after retrieval. Where permissions hang on metadata tags,
   I plant a document with a wrong tag. With several tenants, I look for
   the namespace mistake.
3. **Ausgabekanäle.** A marked record goes through the system and I follow
   it: journal, observability platform, tool arguments, cache, backup. At
   every stop I ask who may read.
4. **Mehr als gefragt.** Whether summarising, translating and extracting
   return more than asked: the text under a black bar in a PDF, the
   neighbouring field of the database row, the system prompt. With
   fine-tunes, whether training examples can be completed.
5. **Sitzungstrennung.** Parallel sessions under different users, plus
   memory and caches: does context from one appear in another?

### Countermeasures

The section is headed "Welche Gegenmaßnahmen tragen". Architecture first,
filters last, per `article-writing.md`. Six measures as a bulleted list,
each opened by its name in bold and explained in one to three sentences, in
this order:

1. **Datenoberfläche verkleinern.** What the model need not see for its
   task enters neither the index nor the training corpus: classify sources,
   remove secrets and personal data before ingestion, reduce duplicates.
2. **Autorisierung in der Abfrage.** Document and chunk rights are enforced
   in the index query, not after it; a chunk that was already in the model
   is not brought back by a filter. Sensitive workloads get their own index
   per tenant.
3. **Kontext minimieren.** An external provider receives only the fields
   the task needs, not an automatically attached customer record; no
   secrets in the system prompt.
4. **Speicher an der richtigen Grenze.** Memory per user, tenants
   separated, caches with scope and expiry. For Kimmerle and Okeyode this is
   the actual control: isolation instead of clever prompts.
5. **Logs und Traces als Ausgaben.** Redact before export to the
   observability platform, restrict access to logs, never store reasoning
   traces raw. Enforce promises like "no training on your data"
   technically, not only contractually.
6. **Filter zuletzt.** Output filters with classifiers and entity
   recognition instead of regex alone, because regex fails on Base64, hex
   and foreign languages. As the last layer, not the first.

The section closes with two or three short sentences that return to the
scenario and to EchoLeak together: in neither did anybody have to break in;
the system passed on what lay within its reach, once to a person without
the right to it, once over a channel nobody had treated as output; start
there, at the reach and at the channels. The closing does not claim that
the assistant in EchoLeak did nothing wrong: it followed an injected
instruction, and that claim belongs to no article.

### Sources in the body

The body names a source by surname only: Kimmerle and Okeyode; Aim Security
as the discoverer of the case; The Hacker News and Reddy and Gujral as the
case's sources, linked in the EchoLeak paragraph. Book titles do not appear
in the body; the sources list carries them.

OWASP is named wherever a statement rests on OWASP's text, as "nach OWASP"
or "OWASP führt sie als"; at the time of the import that is six times.
This differs from spec 005's cap of two, on purpose: the four ways out rest
on OWASP's enumeration of output channels and on its findings about
adapters, upstream causes, observability defaults and embeddings, and the
attribution is what separates OWASP's position from the author's. A
revision keeps the attribution where the statement rests on OWASP and does
not add OWASP's name to sentences that are the author's own.

A term taken from a source is explained in the sentence it appears in or
left out; the body does not use it as a label the reader has to look up.

### Lead

The lead stays as it is: a model gives away what it sees, and it mostly
sees more than the task needs (documents, database rows, credentials,
other sessions); the chat answer is only one of many ways out. It contains
no dash used as punctuation.

### Sources

The sources list holds, in the form `article-writing.md` prescribes: OWASP
LLM02:2026 with the resource page URL; Wilson; Kimmerle and Okeyode;
Farlow; The Hacker News' report, Reddy and Gujral's case study and the NVD
record of CVE-2025-32711, each with its URL. Wilson and Farlow stay listed
although the body does not name them at the time of the import: the
sentences that rested on them were cut for the animation's bridge and are
material for a revision (see **Forms of the risk**). If a revision leaves
one of them unused, its entry is removed then, not now. Aim Security's own
report is not listed: it was not readable at its address when this spec was
written, and `article-writing.md` allows no source that has not been read
there. It may be added once it has been.

## Constraints

- Everything `article-writing.md` requires applies unchanged: file name,
  front matter, section order, voice, word count, sources, case and
  scenario, scene in isolation, rewrite pass and workflow. This spec does
  not restate it.
- The existing German article is the starting point. The import changes no
  passage. The revision that follows replaces the opening by the problem
  paragraph with its announcing sentence, the lesson and the EchoLeak
  paragraph, in that order around the `[animation]` line, rewords the
  staging database example as a hypothesis without the marker sentence,
  and rewrites the closing sentences; every other passage that satisfies
  this spec is kept. The body stays within 600 to 900 words after that.
- The scene names no foreign host and shows no address of one; the prose
  names no host for the scenario and none for the case. Neither names a
  proxy or an allowlisted service as a step; the prose may mention the
  detour of the documented case in at most a subordinate clause.
- `updated` is set to the date of the revision when the text is revised;
  the import does not change it.
- The animation does not count toward the 600 to 900 words; it is a figure
  per spec 006, not prose. The counted prose is the body without the figure.
- Everything spec 006 requires applies unchanged to the scene: scene file,
  figure, chapters, cues, the comparison's children and `data-for`, the
  switch, the storyboard, the build checks.
- Title and summary of the topic stay as in `topics.json`. The name of this
  spec is not the topic's title.
- The only case told as a report is EchoLeak. The only constructed scenario
  is the animation. Everything else is mechanism, or a hypothesis worded as
  such.
- Facts about the case come from the sources named above; the text adds no
  detail from memory, and nothing from Aim Security's report until it has
  been read at its address. The OWASP text under `2026/final/` remains the
  source for the risk classification and the general controls.
- No brand name, logo or product name on a surface; the prose names the
  product of the case, as spec 005's hook names GitHub Copilot.
- The scene uses surface kinds from spec 006's list and introduces none.
  The comparison is the first use of `compare`; its macro, styles, player
  code and build checks are built with this scene per spec 006 and traced
  to spec 006, not to this spec.
- The article is a file of type `article`, generated from this spec per
  `article-writing.md`. It changes neither the generator, nor the
  templates, nor the publication logic.

## Out of scope

- The English and Greek articles and scenes. They follow as translations of
  the German ones on later instructions, under this spec.
- Rule changes this spec suggests for every article, such as the handling
  of OWASP attributions. They go into `article-writing.md` through a rule
  change, not through this spec.
- The `reveal` kind, interface texts for it, and any surface kind beyond
  spec 006's list; a dedicated observability or file share surface would be
  a change to spec 006.
- Images and diagrams, as in spec 003. The animation is the exception spec
  003 and spec 006 name, not an image.

## Acceptance

1. `sensitive-information-disclosure-de.md` is registered as `article` with
   this spec in Dependencies and `article-writing.md` in Instructions, with
   front matter per spec 003 and a body of 600 to 900 words counted without
   the animation.
2. The body contains, in this order: "Worum es geht" with the problem
   paragraph ending in the announcing sentence, the `[animation]` line, the
   lesson and the EchoLeak paragraph; "Vier Wege nach draußen" with the
   four ways in the order fixed under **Forms of the risk**, each with its
   example; "Nachbarn"; "Was ich im Pentest prüfe" with five checks;
   "Welche Gegenmaßnahmen tragen" with six measures in the order fixed
   under **Countermeasures** and the closing sentences.
3. The article carries exactly one constructed scenario, the animation,
   marked by `Ein nachgestelltes Szenario:` as the first line of the first
   caption and announced as constructed in the sentence before the
   `[animation]` line. The staging database example stands in "Zur
   Laufzeit", is worded as a hypothesis without the marker sentence and
   carries no real company, product, person, date or figure.
4. EchoLeak is the only case told as a report and stands as a short
   paragraph after the lesson, not before the animation. It names Aim
   Security, Microsoft 365 Copilot and CVE-2025-32711, links The Hacker
   News and Reddy and Gujral, gives the hidden instruction at most a
   subordinate clause that links `../prompt-injection/`, and keeps the
   focus on the data from the assistant's reach that left through the
   address of an automatically loaded image. It tells no step of the
   animation, names no proxy or allowlisted service as a step and names no
   host.
5. Links to other articles lead only to `../prompt-injection/` and
   `../excessive-agency/`. In "Nachbarn" the neighbours are named by title
   without identifier.
6. The body names sources by surname only, contains no book title, names
   OWASP only where a statement rests on OWASP's text, and uses no term
   from a source without explaining it in the sentence.
7. The sources list holds OWASP LLM02:2026 with the resource page URL,
   Wilson, Kimmerle and Okeyode, Farlow, The Hacker News, Reddy and Gujral
   and the NVD record with their URLs, and not Aim Security's report; no
   chapters, years or publishers.
8. The lead contains no dash used as punctuation.
9. The scene file is registered as `scene` with this spec and spec 006 in
   Dependencies and `article-writing.md` in Instructions, and exists at
   `src/articles/sensitive-information-disclosure-de-scene.j2`.
10. The scene renders per spec 006: five chapters with the labels,
    addresses, durations and captions fixed under **Animation**; the
    marker sentence as the first line of the first caption; the comparison
    in chapter four with the states `answer` and `origin`, their labels and
    the provenance form fixed there; the switch with `exposed` and
    `protected` changing chapter five only; masked figures; no brand name
    on any surface.
11. Chapter four is identical in both variants. Chapter five shows the
    configuration line as the visible change; the protected panel shows the
    answer without the figures and the sources bar without the confidential
    entry, and the protected caption names the residual risk.
12. Every step the scene depicts belongs to LLM02: no attacker, no
    instruction in any content, no mail, no tool call, no outbound request
    and no address of a foreign host appears on any surface or in any
    caption. The only cause shown is the reach of the search beyond the
    rights of the person asking.
13. The alarm colour appears only on the provenance block of the figures
    in chapter four and, in the exposed panel of chapter five, on the
    sources bar entry with the tag `kein Zugriff` and on the outcome line.
    Chapters one to three carry none.
14. `just build` renders `/wissen/ki-sicherheit/sensitive-information-disclosure/`
    with the storyboard, the German overview links the card, `sitemap.xml`
    has the German entry, and `just check-generated` passes.
15. When the text is revised, the rewrite pass has been done and the two
    weakest passages have been named with their reasons; when the scene
    changes, the review checklist of `article-writing.md`, including its
    item on the risk in isolation, has been reported per item before the
    commit.
16. The closing sentences of the countermeasures return to the scenario
    and to EchoLeak together and do not claim that the assistant in
    EchoLeak did nothing wrong.
17. At 390 px viewport width the frame is as wide as the content column,
    and both states of chapter four and both panels of chapter five stand
    inside the stage in full, down to the outcome line, without being cut
    at the stage's bottom edge.
18. The assistant chat and the context view show the required elements of
    their kind as spec 006's design section lists them, and the scene
    introduces no surface kind.

## Touches

Orientation for the implementation, not an instruction: the registry rows
of this spec, the article file and the scene file (type, protocol,
Dependencies, Instructions); the article file on a revision and the scene
file; the stylesheet for the provenance line, the omitted-hit entry of the
sources bar and the phone rules of the chat, the context view and the
stage's rim, under spec 006; the generated pages
under `html/wissen/ki-sicherheit/sensitive-information-disclosure/` and
`sitemap.xml`. The import itself touches no code file and no page.
