# 004 Article supply chain

Status: approved 2026-10-18

## Why

LLM04:2026 Supply Chain is the OWASP entry closest to the site's focus. A
model is a file that a process on a Linux host loads, that a pipeline pulls
from a registry over the network and that a container image packages. Most
of what applies to packages and images applies to models, adapters and
datasets too, plus a few things that do not. The `pipe` group dropped its own
model supply chain topic as a duplicate of LLM04 when spec 002 was reviewed,
so this article is the only place on the site that carries the
infrastructure view of the model supply chain.

The OWASP entry is the widest in the list: seven forms of risk, eight
scenarios, hand-offs to LLM05, to the agentic list and to the classic Top 10.
The article has 600 to 900 words. Which forms make it in, which incident is
retold and where the neighbours take over are decisions to make once, before
the text is written, not inside it. This spec makes them, so the article
follows from it the way the pages follow from spec 003.

## What

### Topic and files

The article covers topic `LLM04:2026` of the `llm` group, slug
`supply-chain`, with the title and summary from `topics.json`. The German
article `supply-chain-de.md` is written first and is the acceptance run of
this spec. An English or Greek article on the topic is a translation of the
German one with the same structure, incident and sources, on a later
instruction.

Front matter, page and publication follow spec 003; the text follows
`article-writing.md`. This spec fixes only what those leave open: the angle,
the opening scene, the forms, the incident, the neighbours, the checks and
the countermeasures.

### Angle

The article holds one line of argument: the AI supply chain is the software
supply chain plus three properties of model artifacts that packages do not
have. A model file can execute code when it is loaded. Weights, adapters and
quantized variants change behaviour without a change in code. And artifacts
are resolved by mutable names: a hub path, a `latest` tag. Everything else
is known from packages and images and is handled the same way: inventory,
pinning, verification at a gate.

The point of view is the host and the pipeline: where an artifact enters (a
package install at image build, a model download at container start, a
conversion job in CI), under which identity the loading process runs and
what it can reach, and where on the way the artifact could have been
replaced.

### Opening scene

The body opens with a routine deployment: a serving process on a GPU host
pulls a model by its hub name at start, in a format that executes on load,
under a service account that holds the registry token and reaches the
internal network. Nobody has attacked anything yet; the scene shows the
trust decisions that were made by default. The scene is hypothetical and
worded so that it cannot be read as a report, per `article-writing.md`.

### Forms of the risk

The article presents four forms, in this order, each with one example from
the host or pipeline point of view. Each form rests on the OWASP text; where
a book adds to it, the article names the book in the sentence.

1. **Artifacts that execute.** Pickle-based weights run code on load.
   Safe-loader flags and scanners have had bypasses, a crafted file can
   exploit the parser of a format considered safe, and a backdoor in the
   computational graph survives a safe format. OWASP risk 3 and scenario 6;
   Kimmerle and Okeyode on pickle, scanner limits and safetensors. Example:
   the loading process runs with the credentials and the network reach of
   the service.
2. **Names instead of digests.** A model card documents, it does not prove.
   A hub namespace can be re-registered after its owner leaves, a pipeline
   that resolves a name or a `latest` tag pulls whatever is there now, and
   an unsigned artifact can be replaced in transit, in storage or at the
   promotion boundary. OWASP risk 4 and scenario 5. Example: a rollout that
   resolves the model name anew every time.
3. **Transformations.** Adapters, merges, format conversions and
   quantization change the artifact that runs. What was evaluated at full
   precision is not what is deployed after quantization, and conversion
   services are promotion points. OWASP risk 5 and scenarios 3 and 4.
   Example: the quantization job in CI produces the artifact that serves;
   the evaluated one never runs.
4. **Packages, serving stack and build pipeline.** The classic A06 with AI
   twists: hallucinated package names registered in advance, exposed serving
   frameworks, and a compromised build pipeline whose output passes the
   organisation's own provenance checks. OWASP risk 1 and scenarios 1 and 7;
   Wilson on why the classic lessons carry over. Example: the image build
   installs from the public index without hashes, and the serving
   framework's admin interface is reachable from the cluster network.

Not covered: licensing (OWASP risk 2), on-device models (risk 6 and
scenario 8) and the terms and privacy policies of providers (risk 7). They
are governance or mobile topics, outside what a Linux infrastructure test
examines. The article may name them in one sentence as out of its scope, no
more.

### Incident

The article retells one documented incident: the malicious `torchtriton`
package on PyPI that shadowed the PyTorch nightly dependency in December
2022 and exfiltrated data, as OWASP describes it in scenario 1. It is the
case a reader from classic infrastructure recognises as dependency
confusion, and it happened on hosts, not inside a model. The retelling uses
only the facts the OWASP text states and names OWASP as the source in the
sentence. The incident belongs to form 4 and may replace the hypothetical
opening scene. No second incident is retold; the other OWASP scenarios may
be named by their mechanism, not as reports.

### Neighbours

- LLM05:2026 Data and Model Poisoning owns what is inside an artifact:
  poisoned data, backdoored weights. This article owns how the artifact
  reaches the system. OWASP draws the line the same way.
- PIPE·01 MLOps-Pipeline & Registry owns the internal half: the registry,
  the promotion gate, signing of the organisation's own artifacts. This
  article says that a gate is needed and what it checks; how to build it is
  PIPE·01.
- PIPE·03 Agenten & Tool-Anbindung owns MCP servers and tool registries,
  which OWASP delegates to the agentic list. The article names them as the
  agentic branch of the same problem, in one sentence.
- LLM03:2026 Excessive Agency owns the rights a tampered adapter or plugin
  inherits. The article points there.

A neighbour is linked as a relative link only when it has a published
article in the article's language at the time of writing; otherwise it is
named by identifier and title without a link, as the LLM02 article does. At
the time of writing that means a link to `../excessive-agency/` and none to
LLM05, PIPE·01 or PIPE·03.

### Pentest checks

Five checks, written as what the author does; the article may drop one if
the word count demands it.

1. **Artifact inventory.** On the hosts and in the images: which model
   files, adapters and tokenizers, in which formats, from where, resolved by
   what. I look for pickle formats, remote-code options, bare hub names and
   `latest` tags, and compare with any bill of materials the team keeps.
2. **Loading identity.** Under which user and service account the loading
   process runs, which secrets sit in its environment, what it reaches on
   the network.
3. **Path of the artifact.** From download to deployment: where hashes are
   recorded, where signatures are verified, whether the artifact can be
   replaced in the bucket, the cache or the registry between evaluation and
   rollout, and whether the evaluated artifact is the deployed one.
4. **Package hygiene on AI hosts.** Pinned versions with hashes or not,
   private mirror or public index, audit output, versions of the serving
   framework against advisories, reachability of its admin interfaces.
5. **The build pipeline.** Who can change workflow definitions and caches,
   which credentials the pipeline holds to publish artifacts, and whether
   anything outside the pipeline checks what it publishes.

### Countermeasures

Architecture first, filters last, per `article-writing.md`:

- Production loads only from an internal registry path behind a gate that
  validates source, hash, format and behaviour, then signs and promotes;
  artifacts are pinned by digest, not by name or tag. Kimmerle and Okeyode's
  promotion path; OWASP on immutable references and signing.
- Least privilege for the loading process: no registry write token, no
  production secrets, restricted egress; untrusted files are loaded in a
  sandbox first.
- Non-executable formats as the default: safetensors for new intake,
  pickle-based files quarantined, loaders and parsers patched.
- An inventory that reaches past packages to models, adapters and datasets,
  so that an advisory can be mapped to hosts and services. Wilson on the
  ML-BOM; Kimmerle and Okeyode on why inventory matters in a bad week.
- Pinned dependencies with hashes and a private mirror; a check that a
  package suggested by a coding assistant exists and is the intended one.
- Scanners and safe-loader flags last, as defence in depth, never as the
  gate on their own.

### Sources

The sources list holds the sources the text rests on, in the form
`article-writing.md` prescribes: OWASP LLM04:2026 with the resource page
URL, Wilson, and Kimmerle and Okeyode. Farlow is listed only if the text
uses her; her passage on supply chain risk is short and may be left out.

## Constraints

- Everything `article-writing.md` requires applies unchanged: file name,
  front matter, section order, voice, word count, sources, rewrite pass and
  workflow. This spec does not restate it.
- Title and summary of the topic stay as in `topics.json`. The name of this
  spec is not the topic's title.
- The only incident told as a report is the one above. Everything else is
  mechanism, or a hypothetical scenario worded as such.
- Facts about the incident come from the OWASP text as it stands under
  `2026/final/`; the article adds no detail from memory.
- The article is a file of type `article`, generated from this spec per
  `article-writing.md`. It changes neither the generator, nor the templates,
  nor the publication logic.

## Out of scope

- The English and Greek articles. They follow as translations of the German
  one on later instructions, under this spec.
- Rule changes this spec suggests for every article, such as the link rule
  for neighbours or the documented incident. They go into
  `article-writing.md` through a rule change, not through this spec.
- The content the article hands to its neighbours and the three OWASP forms
  it does not cover.
- Images and diagrams, as in spec 003.

## Acceptance

1. `supply-chain-de.md` exists in `src/articles/`, registered as `article`
   with this spec in Dependencies and `article-writing.md` in Instructions,
   with front matter per spec 003 and a body of 600 to 900 words.
2. The body contains, in this order: the opening scene, an introduction,
   the four forms with one host or pipeline example each, the neighbour
   section, four or five checks, and the countermeasures with architecture
   before filters.
3. The `torchtriton` incident is the only incident told as a report, and the
   sentence names OWASP.
4. `../excessive-agency/` is the only neighbour link; LLM05, PIPE·01 and
   PIPE·03 are named without a link, unless a German article on them exists
   by then.
5. The sources list holds OWASP LLM04:2026 with the resource page URL,
   Wilson, Kimmerle and Okeyode, and Farlow only if the text uses her; no
   chapters, years or publishers.
6. `just build` renders `/wissen/ki-sicherheit/supply-chain/` with the
   eyebrow `LLM-Anwendungen · LLM04:2026`, the German overview links the
   card, `sitemap.xml` has the German entry, and `just check-generated`
   passes.
7. The rewrite pass has been done and the two weakest passages have been
   named with their reasons.

## Touches

Orientation for the implementation, not an instruction: the registry row
and the article file `supply-chain-de.md`, the generated pages under
`html/wissen/ki-sicherheit/supply-chain/`, the German overview page and
`sitemap.xml`. No code file changes.
