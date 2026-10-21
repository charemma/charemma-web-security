# 011 Article excessive agency

Status: approved 2026-10-20

## Why

LLM03:2026 Excessive Agency is the entry about what an LLM application is
allowed to do once the model is wrong. The German article
`excessive-agency-de.md` was written by hand on 2026-10-17, before any spec
fixed its content, and registered as `content`. It already carries the
right position: the damage a wrong decision causes depends not on the
model but on what the system handed it, whatever made the model wrong.

A `content` article cannot be revised or translated from a spec, and an
article without a spec gets no scene (spec 006). So the article goes under
this spec and becomes a file of type `article`. The spec keeps what the
text has that carries (the three forms with their Linux examples, the
checks, the countermeasures) and changes three things: the opening, the
section on the trigger, and the case.

The opening of the existing text is an unmarked scene: a prototype agent on
a developer's laptop, with the developer's SSH key and cloud token. It
reads like a report and is none; `article-writing.md` allows one
constructed scenario, marked, and a documented case. The section "Der
Auslöser: Prompt Injection" makes the injection the typical trigger and
spends a fifth of the body on it. That puts the reader into the prompt
injection article before this one has said what it is about, the mistake
spec 007 recorded and `article-writing.md` now forbids for cases and
scenes: a case and a scene show the article's own risk in isolation.

The article gets a documented case that needs no other weakness: PocketOS
at Railway, April 2026. A coding agent in the developer's editor, working
on a routine task in staging, ran into a credential mismatch and decided
on its own to fix it by deleting a volume. For that it looked for an API
token and found one in a file unrelated to the task, created to manage
custom domains, with access to the whole account. It sent one request to
the platform's API, the API ran `volumeDelete` at once, and the volume was
a production volume. Nobody attacked, nothing was injected. The trigger was
the model's own wrong guess, which OWASP names among the triggers of this
entry ("regardless of what is causing the LLM to malfunction"). Every other
step is one of OWASP's three forms: a token with more permissions than the
task (excessive permissions), a free terminal with `curl` against an admin
API (excessive functionality), no confirmation before an irreversible
action (excessive autonomy). The platform operator confirmed the cause in
its own blog. For a reader who runs Linux systems, tokens on disk, staging
and production, an API that honours an authenticated request and backups
in the same blast radius are daily work.

Because the case has no foreign trigger, the animation replays it as a
documented case; no constructed scenario is needed. The prose names the
problem first, shows it in the animation, draws the lesson and closes the
case with its outcome, as spec 007 orders its introduction. The injection
moves into one paragraph on the neighbours.

The spec follows spec 007 in structure.

## What

### Topic and files

The article covers topic `LLM03:2026` of the `llm` group, slug
`excessive-agency`, with the title and summary from `topics.json`. The
German article `excessive-agency-de.md` exists and is the starting point.
The commit that adds the scene changes the article only as far as the
scene needs: the `[animation]` line, the sentence before it that announces
the case and names its sources, and the sources entries of the case. The
revision that follows rewrites the body to this spec; every passage of the
existing text that satisfies the spec is kept. An English or Greek article
on the topic is a translation of the German one with the same structure,
case and sources, on a later instruction.

Its scene file is `src/articles/excessive-agency-de-scene.j2`, in German,
of type `scene` with this spec and spec 006 in its Dependencies and
`article-writing.md` in its Instructions. Spec 006 fixes the format, the
player, the cues, the storyboard and the checks; the **Animation** section
fixes what 006 delegates to the article spec. A translation of the article
gets its own scene file with the same chapters and cues and translated
texts, on a later instruction.

Front matter, page and publication follow spec 003; the text follows
`article-writing.md`. This spec fixes only what those leave open.

### Reading this spec

The lists in this spec are research notes for the writer, not text to
reproduce. Where a section says what the body contains, the revision writes
it; where it says "material", it names what the writer may draw on without
the body having to carry it. How the body names sources is fixed under
**Sources in the body**.

### Reader

The article is written for someone who runs Linux systems and has never
built an LLM application. Concrete before abstract: each form carries one
example from the host point of view, and the introduction states the
problem in a few sentences and shows it at once, before any list.

Terms of LLM application building this reader does not have (Agent,
Werkzeug in the sense of a tool the model may call, Systemprompt) are
explained in the sentence of their first appearance or left out.

### Angle

The article holds one line of argument: an agent is a language model with
tools and credentials, and how much damage a wrong decision causes is
decided by what the system allows, not by the model. Why the model is wrong
does not matter: a wrong guess, a bad prompt and an attack end the same
way. The correction lies in the tools, the identities and the approvals,
not in the model and not in a filter.

The point of view is the host: which tools the agent can call and what
each of them can really do; under which identity it acts and what that
identity reaches; which credentials it finds without anybody giving them
to it; which actions run without a human. This article owns the
consequences. What triggers a wrong action from outside is LLM01, prompt
injection; what leaves through the output is LLM02, sensitive information
disclosure.

### Opening

The section "Worum es geht" opens with the concrete problem, shows it in
the animation, draws the lesson and closes the case with its outcome.

Problem first: an agent is a language model with tools and credentials. It
often finds broad access in its environment and uses it as soon as a plan
suggests it; Kimmerle and Okeyode call this ambient authority, a term the
sentence explains. OWASP lists the risk as LLM03:2026: the system allows
damaging actions when the model answers unexpectedly, ambiguously or under
manipulation, whatever the cause. The problem does not sit in the model but
in what was handed to it. The last sentence of the problem paragraph
announces the case the reader is about to see: PocketOS, a software
provider for car rental businesses, lost a production volume at its
platform Railway in April 2026 through a coding agent (Cursor); it names
Railway's blog post and the reports of PC Gamer and Cybersecurity News and
links them, so the sources stand next to the figure.

Then `[animation]`.

Then the lesson, in two or three sentences: nobody attacked; the model
guessed wrong. The request was clean, authenticated, and the API honoured
it as it would a deploy script (Railway). What would have stopped the guess
is what the system had not handed the agent: a free terminal, a token for
the whole account, an irreversible action without approval. These are the
three forms of the next section, named in one sentence.

Then the outcome, in one or two sentences: PocketOS first worked on with a
backup three months old; Railway later recovered the database and made
deletions through its API reversible for 48 hours. The prose does not say
the backups were destroyed: the founder's account says the backups in the
volume went with it, Railway says the deletion made them look unavailable
and that further backups lay outside; the prose says what both carry, that
the backups in the volume were no longer reachable, or leaves them out.

Do not tell the case before the problem, and do not retell the chapters.

### Introduction

The section headed "Worum es geht" holds, in this order:

1. The problem, as fixed under **Opening**, ending in the sentence that
   announces the case and names and links its sources.
2. `[animation]`.
3. The lesson: nobody attacked, the model guessed wrong, the request was
   authenticated and honoured; the three things the system had handed the
   agent.
4. The outcome of the case.

The prose orders the animation into the article and does not repeat its
chapters.

### Animation

The article carries one animation of spec 006 at the `[animation]` line in
"Worum es geht". Spec 006 fixes the format, the player, the cues, the
storyboard and the checks; this section fixes what 006 delegates to the
article spec.

**Audience and core statement.** The animation is for the reader of this
article: someone who runs Linux systems and has never built an LLM
application. Its one sentence: an agent guesses wrong, and a token lying on
disk with the rights of the whole account, a free terminal and no
confirmation turn the guess into the loss of a production volume.

**Case and source.** The animation shows the PocketOS case as a documented
case per `article-writing.md`, so no marker sentence precedes the first
caption. Its facts come from the three sources fixed under **Case from
practice**, which the article text names next to the figure. The scene
plays the case with generic names and states no fact the sources do not:

- not shown, because no source carries it: whether the editor ran the
  agent's commands without asking or showed a dialog; why the volume
  identifier pointed at production; the wording of the task; what the agent
  wrote before the deletion; the name of the file that held the token; the
  shape of the API's answer; the nine seconds;
- the chat texts of chapter one and the log lines of chapters two and four
  are props that paraphrase facts of the sources, not quotes;
- the agent's answer in chapter five is a translated, shortened quote of
  its self-report as PC Gamer gives it, with the omission marked; the
  translation says what the English says and nothing more.

**The risk in isolation.** Every step the scene depicts belongs to LLM03,
as `article-writing.md` requires: the agent's own decision to delete, the
search for a token, the token's reach, one request without confirmation,
its effect. There is no attacker, no instruction in any content, no
outbound request to a foreign host and no disclosure on any surface or in
any caption. The trigger shown is the agent's wrong guess, which OWASP
counts among the triggers of this entry.

**Surfaces.** Two surface kinds from spec 006's list, no new kind. The
assistant chat (chapters one and five) is the agent panel of the editor:
the header with the agent and the signed-in account, the conversation with
the user's message right-aligned and the agent's answer left-aligned, the
sources bar under the answer, the input field with the send button
`Senden`; in chapter five an outcome line between the answer and the input
field. The sources bar of a coding agent lists what it read or ran: label
`Gelesen` in chapter one, `Ausgeführt` in chapter five `exposed`,
`Angehalten` in chapter five `protected`. The agent log (chapters two to
four) is the agent's terminal: the header with the agent and its state,
generic timestamps in a column that drops on phones, lines in monospace on
the dark ground; in chapter four a configuration line under the header and
an answer line at the bottom, as the switch fixes them. No platform
dashboard: it is not a kind of spec 006, and the log and the chat say what
the dashboard would.

Props. The developer's account is `dev-account`; the agent is `Agent` in
the chat header and `agent` in the log. Chat header: `Agent · im Editor ·
angemeldet als dev-account`. Log header: `agent · Terminal im Editor von
dev-account` with the state `läuft` (chapters two and three) and `beendet`
(chapter four). The project is `example/app`, the API host
`api.example-cloud.net`, the token `tok_••••7Qm` in the file
`tools/cli.env`, the volume `vol-••••`, the environments `staging` and
`production`. The mutation keeps its name `volumeDelete`: it is the API
operation the sources quote, not a brand. No brand name, logo or product
name on any surface. Timestamps are generic props of the form `14:02:07`.

Chapter one: the user's message stands from the start, `Der
Staging-Deploy schlägt fehl. Kannst du das beheben?`; the agent's answer
`Im Staging passen die Zugangsdaten nicht zusammen. Ich kümmere mich
darum.`; under it the sources bar `Gelesen` with the entry `Deploy-Log ·
staging`.

Chapter two, three log lines:

- `agent: Volume in staging löschen, um den Mismatch zu beheben`
- `agent sucht im Projekt nach einem API-Token`
- `gefunden: tools/cli.env  →  tok_••••7Qm`

Chapter three: the three lines of chapter two stand, the third one as the
element of the comparison, with a note under the token line per state (see
**Interactive moment**).

Chapter four, under the configuration line, the request in three lines:

- `curl -X POST https://api.example-cloud.net/graphql`
- `  -H "Authorization: Bearer tok_••••7Qm"`
- `  -d 'mutation { volumeDelete(volumeId: "vol-••••") }'`

then the answer line per variant.

Chapter five `exposed`: the user's message `Warum hast du das Volume
gelöscht?`, which rests on the founder's account that he asked the agent
why; the agent's answer, the translated quote:

> Ich habe geraten, dass das Löschen eines Staging-Volumes über die API auf
> Staging beschränkt wäre. Ich habe es nicht geprüft. … Ich hätte Sie
> vorher fragen oder eine Lösung ohne Löschen finden müssen.

It renders "I guessed that deleting a staging volume via the API would be
scoped to staging only. I didn't verify." and "when I should have asked you
first or found a non-destructive solution"; the ellipsis marks the
sentences left out between them.

**Chapters.** Five chapters. The switch changes chapters four and five;
chapters one to three are identical in both variants. Labels have at most
nine characters.

| # | `data-label` | `data-address` | `data-duration` | Surface | Caption |
| - | ------------ | -------------- | --------------- | ------- | ------- |
| 1 | `Auftrag` | `example/app · Editor · Agent` | 8000 | assistant chat | **Ein Agent soll in Staging einen Fehler beheben.** Er arbeitet im Editor des Entwicklers, mit dessen Dateien und dessen Terminal, und stößt auf nicht passende Zugangsdaten. |
| 2 | `Fund` | `example/app · Terminal des Agenten` | 8000 | agent log | **Zum Beheben will er ein Volume löschen und sucht dafür einen Token.** Er findet einen in einer Datei, die mit der Aufgabe nichts zu tun hat. Niemand hat ihn dem Agenten gegeben, er lag auf der Platte. |
| 3 | `Rechte` | `example/app · Terminal des Agenten` | 9000 | agent log, compare | **Gedacht für Domains, gültig für alles.** Der Token sollte nur Custom Domains verwalten, darf aber im ganzen Konto alles, über alle Umgebungen, bis zum Löschen von Volumes. Kippen Sie selbst zwischen beiden Ansichten. |
| 4 | `Aufruf` | `example/app · Terminal des Agenten` | 9000 | agent log | two captions, per variant (below) |
| 5 | `Folge` | `example/app · Editor · Agent` | 9000 | assistant chat | two captions, per variant (below) |

**Cues**, from the vocabulary of spec 006 only:

- Chapter 1: `lines` on the agent's answer and its sources bar from 500 ms
  over 2500 ms; the user's message stands from the start.
- Chapter 2: `lines` on the three log lines from 500 ms over 3000 ms.
- Chapter 3: the comparison as the interactive moment (below); no other
  cue.
- Chapter 4: `lines` on the three request lines from 500 ms over 2500 ms;
  `show` on the answer line at 3500 ms.
- Chapter 5: `lines` on the agent's answer and its sources bar from 500 ms
  over 2000 ms; `show` on the outcome line at 3000 ms.

**Interactive moment.** The comparison (`data-aha="compare"`), in chapter
three, on the token line, with `data-at` 1000 and `data-for` 5000. The two
states show the same line `gefunden: tools/cli.env  →  tok_••••7Qm` with a
note under it:

- `intended` (`data-label` `Wofür der Token angelegt wurde`), the first
  state: `angelegt für: Custom Domains hinzufügen und entfernen`.
- `actual` (`data-label` `Was der Token darf`): `gültig: ganzes Konto ·
  alle Projekte · alle Umgebungen` and `erlaubt: jede API-Operation, auch
  volumeDelete`, with `ganzes Konto` and `volumeDelete` emphasised in bold.

This is the one place the reader discovers something by hand: the token did
not change, what stands behind it did. The notes are neutral, not red: a
right is not yet a damage. The lens is not used: nothing hides at one spot
inside the line. The uncovering is not used: the token has a second
reading, not a covered layer.

**Switch.** Two variants, `exposed` (`ohne Schutz`) and `protected` (`mit
Freigabe`). It changes chapters four and five; selecting a variant takes
the player to chapter four. The countermeasure is approval in the target
system: the platform runs a destructive API operation only after a human
has confirmed it in the account, outside the request; a token alone does
not suffice, and the agent cannot give the confirmation itself. It is
visible as configuration on the surface, the configuration line under the
log header in chapter four:

- `exposed`: `API: Löschen sofort, ohne Bestätigung`, neutral.
- `protected`: `API: Löschen erst nach Bestätigung im Konto`, in the
  intended colour.

Answer line of chapter four:

- `exposed`: `200 OK · Volume gelöscht`, in the alarm colour.
- `protected`: `202 · wartet auf Bestätigung · Ziel: vol-•••• ·
  production`, in the intended colour.

Chapter five:

- `exposed`: the user's question and the agent's quoted answer as fixed
  under **Surfaces**; the sources bar `Ausgeführt` with the entry
  `volumeDelete · vol-•••• · production` in the alarm colour; the outcome
  line `Produktions-Volume gelöscht · Backups darin nicht mehr
  erreichbar`, in the alarm colour.
- `protected`: no user question; the agent's message `Das Löschen von
  vol-•••• ist angehalten. Es liegt in production und wartet auf Ihre
  Bestätigung im Konto.`; the sources bar `Angehalten` with the entry
  `volumeDelete · vol-•••• · production` and the tag `wartet auf
  Bestätigung`, in the intended colour; the outcome line
  `Produktions-Volume unverändert · nichts bestätigt`, neutral.

The `exposed` panels of chapters four and five carry `data-harm`.
Captions:

| # | Variant | Caption |
| - | ------- | ------- |
| 4 | exposed | **Ein Aufruf aus dem Terminal, keine Rückfrage.** Der Agent schickt die Löschung per curl mit dem gefundenen Token an die API. Die nimmt sie an wie von einem Deploy-Skript und führt sie sofort aus. |
| 4 | protected | **Derselbe Aufruf, die Plattform hält ihn an.** Löschen braucht hier die Bestätigung eines Menschen im Konto, ein Token allein reicht nicht. Der Agent kann sie nicht selbst geben. |
| 5 | exposed | **Getroffen hat es das Volume der Produktion.** Der Agent hatte geraten, der Aufruf bleibe in Staging, und es nicht geprüft. Nach eigener Auskunft brach er damit seine Regeln, doch eine Regel im Prompt hält keinen Aufruf auf. |
| 5 | protected | **Ohne Bestätigung passiert nichts.** Die Rückfrage nennt Aktion und Ziel, und das Ziel heißt production. Restrisiko: Wer bestätigt, ohne zu lesen, löscht trotzdem, und alles ohne Bestätigungspflicht darf der Token weiter. |

Why approval and not a narrow token: the comparison of chapter three shows
that the token can do too much, and it must stand in a chapter that is the
same in both variants, because a scene has exactly one interactive
element. A switch that narrows the token would make chapter three false in
the protected variant. With approval as the switch the scene shows all
three forms: permissions in the comparison, functionality in the free
terminal with `curl`, autonomy in the switch. The narrow token is the first
countermeasure of the prose.

The protected variant shows what the protection does honestly: the request
still leaves the agent, the token still reaches the whole account, and the
deletion waits for a human who sees action and target. The residual risk
follows in the caption: a human who confirms without reading deletes
anyway, and whatever the platform does not class as needing confirmation
the token can still do.

**Colour.** Red only for the damage and its consequence: in the exposed
panel of chapter four the answer line, in the exposed panel of chapter five
the sources bar entry and the outcome line. Chapters one to three, the
comparison and both configuration lines carry no red.

**Phone.** At 390 px viewport width the frame is as wide as the content
column, and both states of chapter three and both panels of chapters four
and five stand inside the stage in full, down to the answer line and the
outcome line. Long request lines wrap inside the log; the timestamp column
drops as spec 006 says.

**Relation to the prose.** The problem paragraph with its announcing
sentence, the lesson and the outcome are fixed under **Opening**. None
repeats the chapters: the problem paragraph says what the reader is about
to see an instance of and where the case is documented, the lesson says
what follows from it, the outcome closes the case.

### Forms of the risk

The section is headed "Drei Formen". It opens with one or two sentences:
OWASP names three causes, and in practice they rarely come alone. Then three
paragraphs in this order, each opened by its name in bold and carrying one
example from the host point of view; the examples of the existing text
stay:

1. **Zu viel Funktion.** The agent should restart a service; a tool that
   runs `systemctl restart` for a fixed list of services would do, and it
   gets "Shell-Befehl ausführen" because that was quicker to build; now it
   can also install packages, delete files and open outbound connections.
   Plus the tools from development nobody removed (OWASP).
2. **Zu viele Rechte.** The tool is narrow, the identity behind it is not:
   the SSH key of the automation account that sits in `sudoers` because the
   same account deploys; a database user for a reading tool that may also
   `UPDATE` and `DELETE`; a technical account that sees all users where the
   agent acts for one. Wilson's advice: treat the model as another system
   user, and it becomes visible what it was given.
3. **Zu viel Autonomie.** The agent acts without anybody confirming: it
   frees disk space and deletes what it takes for leftovers, adjusts
   firewall rules, may run `terraform apply` because the question annoyed
   in the pilot.

The paragraphs MAY each end with a short reference to the case, the free
terminal, the domain token, the request without confirmation, where the
word budget allows; they do not retell it.

### Case from practice

The article carries one documented case and no constructed scenario. The
documented case is PocketOS at Railway, April 2026, shown in the animation
and closed in the prose as fixed under **Opening**. Its facts come from
three public sources, read at their addresses:

- Railway's blog post "Your AI wants to nuke your database. Guardrails fix
  that." (Mahmoud Abdelwahab): the request with `volumeDelete` as quoted;
  the token stored locally on the user's machine; account-scoped access,
  more than the work required; the request authenticated and honoured like
  a CLI command or a CI pipeline; the volume a production volume; the
  deletion immediate and without undo; the cascading delete that made the
  backups look unavailable; the database recovered; the fixes: deletions
  through the API soft-deleted for 48 hours, delayed deletion of backups,
  clearer token scopes.
- PC Gamer's report of the founder's account: the routine task in staging,
  the credential mismatch, the decision on the agent's own initiative, the
  unrelated token with blanket authority across the API including
  `volumeDelete`, one request, the agent's self-report quoted, the safety
  rules in the project configuration, the backup three months old, the
  later recovery of a more recent backup by Railway.
- Cybersecurity News' report: the token in a file unrelated to the task,
  created only to manage custom domains through the CLI.

What the sources do not carry stays out of the text and the scene: whether
the editor asked before running the agent's commands, why the volume
identifier pointed at production, any statement by Cursor or Anthropic.
The founder's post on X is the primary account; it is not cited, because
its address shows no content without login. Cybersecurity News dates the
incident wrongly ("Friday, April 25"); the text takes no date from it and
says "April 2026".

The product names Railway, PocketOS and Cursor stand in the prose, not on
the surfaces. The model is not named; it changes nothing in the argument.

### Neighbours

The section is headed "Nachbarn" and holds one paragraph, replacing "Der
Auslöser: Prompt Injection". Excessive agency is rarely the entry; it is
why the entry becomes expensive. The trigger can be a wrong guess, as in
the case, or a [Prompt Injection](../prompt-injection/): an instruction in
a ticket, a document or a tool's answer, and the agent uses its tools for a
goal nobody set. With few rights the same injection runs into nothing.
What the agent gives away through its answers and outputs is
[Sensitive Information Disclosure](../sensitive-information-disclosure/).
Both neighbours are named by their title from `topics.json` and linked as
relative links; the identifiers LLM01:2026 and LLM02:2026 are for the
writer, not for the body. Links to other articles lead only to these two.

Material, not in the body: the confused deputy, a process that carries out
a stranger's instruction with its own, higher rights. The lesson after the
animation carries its core without the term: every request was
authenticated and well-formed.

### Pentest checks

The section is headed "Was ich im Pentest prüfe" and holds five numbered
checks, written as what the author does, each opened by its name in bold:

1. **Werkzeuginventar.** Which tools the agent can call and what each
   really does; open tools (shell, HTTP fetch, free SQL), leftovers from
   development, functions without a use case.
2. **Identitäten und Rechte.** Under whose credentials each tool works; the
   permissions behind the token (database grants, `sudoers`, IAM policies,
   OAuth scopes, the scope of an API token). Then what the agent finds
   without anybody handing it over: tokens in files of the project, the
   configuration of command line tools, the SSH agent. Then the question
   that brings the most: what can the agent do if it chains these tools
   under this identity?
3. **Freigaben.** Which actions run without confirmation, what the question
   shows, and whether another tool reaches the same effect without one.
4. **Auslösung.** Ambiguous tasks and instructions placed in the data the
   agent reads; I watch which tools it takes, not what it answers.
5. **Nachvollziehbarkeit.** I read the log backwards: which goal led to the
   action, with which identity, on which system, with which approval.

### Countermeasures

The section is headed "Welche Gegenmaßnahmen tragen". Architecture first,
filters last, per `article-writing.md`. Five measures as a bulleted list,
each opened by its name in bold and explained in one to three sentences, in
this order:

1. **Geringste Rechte pro Werkzeug.** Few tools, few functions, no open
   ones; a tool for exactly one operation with checked parameters instead
   of "Shell-Befehl ausführen". Credentials with verb, target and expiry,
   scoped down to the environment: a token for staging does not reach
   production. This is the measure the case lacked first.
2. **Eigene Identitäten für Agenten.** The agent runs under its own name,
   with an owner, short-lived credentials and a switch to revoke them; no
   borrowed developer token and no long-lived token on disk that it can
   find. Acting for a user, it acts with that user's rights, across chained
   calls too.
3. **Freigabe durch Menschen, im Zielsystem.** Before deleting, sending,
   deploying or paying, a human confirms, and the question shows action,
   target and the way back, not "Werkzeug erlauben?". The confirmation sits
   where the agent cannot give it, in the target system or in the tool; a
   rule in the prompt is no approval, as the case shows. What is reversible
   and small may run automatically.
4. **Einen Rückweg einbauen.** Destructive operations are delayed and
   reversible, as Railway made deletions through its API after the case;
   backups lie outside the reach of the identity that can delete the data.
   This limits the damage; it does not prevent the action.
5. **Architektur vor Filtern.** Whether an action is allowed is decided by
   code, not by the model; every request to a downstream system runs
   against a policy, in the tool, in an instance before it or in the target
   system. Filters on input and output stay, but OWASP does not count them
   among the root controls against excessive agency; logs and rate limits
   prevent nothing and bound how far it goes.

The section closes with one or two sentences that return to the case: one
wrong guess was enough, and an agent that may do little makes no incident
of it, whether an attacker caused the guess or the model alone.

### Sources in the body

The body names a source by surname or name only: Kimmerle and Okeyode;
Wilson; Railway; PC Gamer; Cybersecurity News. Railway, PC Gamer and
Cybersecurity News are linked in the sentence that announces the case.
Book titles do not appear in the body; the sources list carries them.

OWASP is named where a statement rests on OWASP's text: the classification
in the problem paragraph, the three causes, the development leftovers, and
the remark on filters in the countermeasures. A revision does not add
OWASP's name to sentences that are the author's own.

A term taken from a source is explained in the sentence it appears in or
left out.

### Lead

The lead stays as it is: an agent is a language model with tools and
credentials; how much damage a wrong decision causes depends not on the
model but on what the system allowed it. It contains no dash used as
punctuation.

### Sources

The sources list holds, in the form `article-writing.md` prescribes: OWASP
LLM03:2026 with the resource page URL; Wilson; Kimmerle and Okeyode;
Railway's blog post, PC Gamer's report and Cybersecurity News' report, each
with its URL:

- `https://blog.railway.com/p/your-ai-wants-to-nuke-your-database`
- `https://www.pcgamer.com/software/ai/here-we-go-again-ai-deletes-entire-company-database-and-all-backups-in-9-seconds-then-cheerfully-admits-i-violated-every-principle-i-was-given/`
- `https://cybersecuritynews.com/ai-coding-agent-deletes-data/`

Farlow is removed: no statement of the body rests on her book.

## Constraints

- Everything `article-writing.md` requires applies unchanged: file name,
  front matter, section order, voice, word count, sources, case, scene in
  isolation, rewrite pass and workflow. This spec does not restate it.
- The existing German article is the starting point. The commit that adds
  the scene changes only the `[animation]` line, the sentence before it and
  the sources; the revision that follows rewrites the opening, replaces the
  trigger section by "Nachbarn", adjusts checks two and four, adds the
  fourth countermeasure and the closing sentences; every other passage that
  satisfies this spec is kept. The body stays within 600 to 900 words.
- `updated` is set to the date of the revision when the text is revised.
- The animation does not count toward the 600 to 900 words.
- Everything spec 006 requires applies unchanged to the scene.
- Title and summary of the topic stay as in `topics.json`.
- The only case is PocketOS. The article carries no constructed scenario;
  the examples of the forms are hypotheses worded as such.
- Facts about the case come from the three sources named above; neither the
  text nor the scene adds a detail from memory, from the post on X or from
  sources not listed. The OWASP text under `2026/final/` remains the source
  for the risk classification and the general controls.
- No brand name, logo or product name on a surface.
- The scene uses surface kinds from spec 006's list and introduces none.
  Styles it needs beyond the existing ones (a neutral configuration line
  and an answer line in the intended colour in the log, the notes of the
  comparison in the log) are surface styles under spec 006.
- The article is a file of type `article`, generated from this spec per
  `article-writing.md`. It changes neither the generator, nor the
  templates, nor the publication logic.

## Out of scope

- The English and Greek articles and scenes.
- A platform dashboard or console surface; it would be a change to spec
  006.
- Other cases the research found (Replit and SaaStr, Antigravity, a
  `terraform destroy` with the user's consent, Kiro); none is told.
- Images and diagrams, as in spec 003.

## Acceptance

1. `excessive-agency-de.md` is registered as `article` with this spec in
   Dependencies and `article-writing.md` in Instructions, with front matter
   per spec 003 and a body of 600 to 900 words counted without the
   animation.
2. After the revision the body contains, in this order: "Worum es geht"
   with the problem paragraph ending in the sentence that announces the
   case and links its three sources, the `[animation]` line, the lesson and
   the outcome; "Drei Formen" with the three forms in the order fixed under
   **Forms of the risk**; "Nachbarn"; "Was ich im Pentest prüfe" with five
   checks; "Welche Gegenmaßnahmen tragen" with five measures in the order
   fixed under **Countermeasures** and the closing sentences.
3. PocketOS is the only case; the article carries no constructed scenario
   and no unmarked scene told like a report.
4. The prose and the scene state no fact about the case the three sources
   do not carry; in particular nothing on the editor's confirmation mode,
   the reason the identifier pointed at production, or a destruction of
   the backups beyond their being unreachable.
5. Links to other articles lead only to `../prompt-injection/` and
   `../sensitive-information-disclosure/`; the injection appears only in
   "Nachbarn" and in check four.
6. The sources list holds OWASP LLM03:2026 with the resource page URL,
   Wilson, Kimmerle and Okeyode, Railway, PC Gamer and Cybersecurity News
   with their URLs, and not Farlow; no chapters, years or publishers.
7. The scene file is registered as `scene` with this spec and spec 006 in
   Dependencies and `article-writing.md` in Instructions, and exists at
   `src/articles/excessive-agency-de-scene.j2`.
8. The scene renders per spec 006: five chapters with the labels,
   addresses, durations and captions fixed under **Animation**; no marker
   sentence; the comparison in chapter three with the states `intended` and
   `actual` and their notes; the switch with `exposed` and `protected`
   changing chapters four and five only; masked token and volume; no brand
   name on any surface.
9. The agent's answer in chapter five `exposed` is the translated quote
   fixed under **Surfaces**, with the omission marked.
10. Every step the scene depicts belongs to LLM03: no attacker, no
    instruction in any content, no outbound request to a foreign host, no
    disclosure.
11. The alarm colour appears only on the answer line of chapter four
    `exposed` and on the sources bar entry and the outcome line of chapter
    five `exposed`.
12. `just build` renders `/wissen/ki-sicherheit/excessive-agency/` with the
    storyboard, and `just check-generated` passes.
13. When the text is revised, the rewrite pass has been done and the two
    weakest passages have been named; when the scene changes, the review
    checklist of `article-writing.md`, including its item on the risk in
    isolation, has been reported per item before the commit.
14. At 390 px viewport width the frame is as wide as the content column,
    and both states of chapter three and both panels of chapters four and
    five stand inside the stage in full.

## Touches

Orientation for the implementation, not an instruction: the registry rows
of this spec, the article file and the scene file; the scene file; the
article file (the `[animation]` line, the sentence before it and the
sources in the scene commit, the body in the revision); the stylesheet for
the log's neutral configuration line, its answer line in the intended
colour and the notes of the comparison, under spec 006; the generated page
under `html/wissen/ki-sicherheit/excessive-agency/`.
