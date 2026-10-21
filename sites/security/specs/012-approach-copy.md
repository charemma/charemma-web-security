# 012 Approach copy

Status: approved 2026-10-20

## Why

The head of the section "02 / vorgehen" on the start page took its texts
from the design tool along with the animation (spec 010). The lead reads:

> KI-Agenten kartieren die Angriffsfläche Ihrer KI-Anwendung und feuern breit
> gestreute Testanfragen ab. Dann übernehme ich: die eine Kette, die wirklich
> Schaden anrichtet – vom präparierten Dokument bis in den Kubernetes-Cluster,
> manuell und reproduzierbar.

Two things in it are wrong for this site.

First, it reads as if I only test AI applications. The offer is broader:
penetration tests with a focus on Linux infrastructure (servers, containers
and Kubernetes, CI/CD), the web applications and APIs that run on it, the
external attack surface, and AI applications and pipelines as one field among
these. The hero and the services section say so; the approach section must
not narrow it again. The animation shows one engagement on an AI
application, and the lead copied that example into a general statement.

Second, "die eine Kette, die wirklich Schaden anrichtet" says I cause damage.
I do not. I prove which chain of weaknesses is exploitable and what an
attacker could reach with it, under control and within the agreed scope.
A client who reads the lead should come away trusting that, not worrying
about it.

Beyond the two errors the tone is off: "feuern ... ab" is a shooting
metaphor, and the dashes break the sentences. The head is the client's
first explanation of how an engagement runs, so it should read like a
professional describing their method.

This spec takes the head texts over from spec 010 and states what they say.
It does not write them; the texts are written from it into the interface
texts. The animation, its stage and every text on the stage stay with
spec 010.

## What

### Scope

The head of the approach section consists of four texts, keyed under
`approach` in the interface texts:

| Key | Place |
| --- | ----- |
| `eyebrow` | the small line above the heading |
| `title_a`, `title_b` | the heading, `title_b` in the accent colour |
| `lead` | the paragraph in the right column of the head |
| `note` | the line below the stage |

Layout, fonts and colours of these texts stay as spec 010 sets them. Every
other text of the section (phase titles, hit lines, rail labels, mode
labels, canvas labels, report, the canvas label for screen readers) belongs
to spec 010.

### Purpose of the head

The head tells a prospective client, before the animation starts, how I
work on an engagement: who does what, in which order, and what they get at
the end. The animation then shows one engagement as an example. The head
explains the method; the animation illustrates it.

### Eyebrow

`02 / vorgehen` stays. It follows the numbering of the other sections
(`01 / leistungen`) and is not part of the criticism.

### Title

`Agenten kartieren. Ich gehe rein.` stays as it is, split as today into
`title_a` `Agenten kartieren. ` (with the trailing space) and `title_b`
`Ich gehe rein.`

Reasons for keeping it:

- It states the division of labour in five words, which is the section's
  point: agents take the breadth, I take the depth.
- It applies to every kind of target, not only AI applications, so the
  first criticism does not touch it.
- "Ich gehe rein" is first person and active, in the voice of the hero
  ("Ich greife Ihre Systeme an, bevor es jemand anders tut."). It does not
  claim damage; it claims access, which is what a penetration test proves.
- It comes from the design tool and is laid out for the heading size of
  spec 010. Changing it would reopen the design for no gain the lead cannot
  deliver.

The lead carries what the title leaves open: that the access is controlled,
agreed and proven.

### Lead

The lead states the method in this order:

1. **Breadth by agents.** AI agents map the attack surface of the client's
   environment and run broad, automated tests against it. The environment
   is named in general terms (for example "Ihre Systeme" or "Ihre
   Umgebung"), or by a range of targets that includes infrastructure; it
   is never named as "Ihre KI-Anwendung" or any other single kind of
   target.
2. **Depth by me.** I take over the results, check by hand which findings
   combine into an exploitable chain, and follow that chain as far as an
   attacker could get. The lead makes clear that this happens in a
   controlled way and within the agreed scope, and that the result is a
   proof the client can retrace (reproducible).
3. **The report.** At the end the client gets a report their team can work
   with: findings with proof and concrete fixes.

The lead may name one example of such a chain. If it does, it marks it as
an example ("etwa", "zum Beispiel"), keeps it to one short phrase, and
picks it so that it does not suggest AI applications are the only target.
The chain of the animation (from a crafted document into the Kubernetes
cluster) is allowed, because it ends in infrastructure; an example from
Linux infrastructure alone is allowed as well. The lead does not retell the
six phases, names no phase titles and no tools.

The lead does not repeat the hero's lead word for word; in particular it
does not reuse the phrase "mit dem Ihr Team direkt arbeiten kann" verbatim.

### Note

The note says that the animation follows a real black-box assessment and is
simplified and anonymised, as today. It also says that this assessment was
of an AI application, so that the example is visibly one engagement among
the kinds the site offers. It is one sentence and contains no dash used as
punctuation.

### Tone

These rules apply to the lead and the note, and to the title should a later
spec change it:

- Factual and professional. Sentences describe what I do and what the
  client gets.
- First person for me ("ich"), formal address for the client ("Sie",
  "Ihre").
- Active voice; no Nominalstil ("die Durchführung erfolgt").
- No wording that has me cause harm: not "Schaden anrichten", not
  "zerstören", not "lahmlegen", no shooting or war metaphors such as
  "feuern", "abfeuern", "Waffe", "Arsenal".
- No overstatement and no promises the test cannot keep: no "alle Lücken",
  no "garantiert", no "100 %", no "lückenlos", no superlatives.
- No marketing phrases: no "ganzheitlich", "maßgeschneidert",
  "State of the Art", "Next Level", "einzigartig", "Mehrwert".
- No dash (`–` or `—`, nor a hyphen standing for one) as punctuation;
  hyphens inside compound words ("KI-Agenten", "Kubernetes-Cluster") are
  fine. No emojis, no exclamation marks.
- Technical terms as the rest of the site uses them: "KI-Agenten",
  "Angriffsfläche", "Penetrationstest", "Kubernetes". English terms only
  where the German site already uses them.

### Length

- Lead: two or three sentences, at most 260 characters including spaces.
  At 1280px width the lead column is about 510px wide and holds about 51
  characters per line; the lead takes at most five lines (144px), so it is
  no taller than the eyebrow and heading beside it (148px). The current lead
  has 256 characters and five lines. At 390px it takes at most eight lines.
  The limits keep the head compact above the stage, which is the section's
  real content.
- Note: one sentence, at most 130 characters including spaces, on one line
  at 1280px.

### Languages

Only German is published (spec 009). This spec applies to the German texts
now.

The English and Greek head texts stay as they are until they are
translated; they are not delivered and the generator does not read them.
When English or Greek is published again, its head texts are translations
of the German ones that follow this spec, including the tone rules in the
target language (no "real damage", no dash as punctuation). Publishing a
language without that translation does not meet this spec.

## Constraints

- The texts live in the interface texts (`src/i18n/<lang>.json`) under the
  keys above; no key is added, renamed or removed.
- No change to templates, stylesheet, script or generator.
- The animation and its texts stay as spec 010 sets them.

## Out of scope

- The animation, the stage, the phase rail and every text on them
  (spec 010).
- The other sections of the start page.
- The English and Greek translation (see *Languages*).

## Acceptance

1. `just build` and `just check-generated` pass.
2. `approach.eyebrow`, `approach.title_a` and `approach.title_b` in
   `de.json` read `02 / vorgehen`, `Agenten kartieren. ` and
   `Ich gehe rein.`
3. The German lead has two or three sentences and at most 260 characters,
   and states, in this order, the agents' mapping and broad testing, my
   manual check and pursuit of the exploitable chain, and the report.
4. The German lead says that my work is controlled and stays within the
   agreed scope, and that the proof is reproducible or retraceable.
5. The German lead does not name the client's target as an AI application
   alone; if it names an example, the example is marked as one and ends
   outside the AI application (in infrastructure).
6. The German lead and note contain none of: "Schaden", "zerstör",
   "feuer", "garantiert", "alle Lücken", "lückenlos", "100 %", "–", "—",
   "!", and no emoji.
7. The German lead does not contain "mit dem Ihr Team direkt arbeiten
   kann".
8. The German note is one sentence of at most 130 characters, says that the
   animation follows a real black-box assessment of an AI application and
   is simplified and anonymised.
9. At 1280px width the lead takes at most five lines and the note one line;
   at 390px the lead takes at most eight lines and no page scrolls sideways.
10. `en.json` and `el.json` are unchanged.

## Touches

Orientation for the implementation, not an instruction: `approach.lead` and
`approach.note` in `src/i18n/de.json`, and the committed start page the
generator renders from it.
