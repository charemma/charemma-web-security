---
lead: "A model gives away what it sees. And it usually sees more than the task needs: documents, database rows, credentials, other people's sessions. The chat answer is only one of many ways out."
updated: 2026-10-26
sources:
  - label: "OWASP Top 10 for LLM Applications 2026, LLM02:2026 Sensitive Information Disclosure"
    url: "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
  - label: "Steve Wilson: The Developer's Playbook for Large Language Model Security"
  - label: "Kris Kimmerle, David Okeyode: AI Under Attack"
  - label: "Harriet Farlow: Practical AI Security"
  - label: "The Hacker News: Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction"
    url: "https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html"
  - label: "Pavan Reddy, Aditya Sanjay Gujral: EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System"
    url: "https://arxiv.org/abs/2509.10540"
  - label: "NIST NVD: CVE-2025-32711"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2025-32711"
---

## What this is about

A system with a language model discloses confidential, regulated or protected data over a channel its owner never approved. OWASP lists this risk as LLM02:2026 Sensitive Information Disclosure. Besides chat answers, it covers tool arguments, retrieved text chunks, logs, telemetry, reasoning traces (the intermediate steps a model writes out) and embeddings (numeric representations of text). According to OWASP, you must classify and redact all of these outputs. The animation shows a constructed scenario: someone just asks a question.

[animation]

Nobody had to break in. One question was enough. The search reached further than the rights of the person asking.

Aim Security found the EchoLeak vulnerability (CVE-2025-32711) in Microsoft 365 Copilot, as reported by [The Hacker News](https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html) and [Reddy and Gujral](https://arxiv.org/abs/2509.10540). Confidential data within the assistant's reach left the environment through the address of an automatically loaded image, after a [prompt injection](../prompt-injection/) (a smuggled-in instruction) in an email had set off the outflow. Nobody had treated this channel as an output.

## Four ways out

**During training.** What a model sees in training or fine-tuning (further training on your own data) it can later reproduce verbatim. Suppose you train an adapter, a small model extension, on old tickets so the assistant answers in your support team's tone. The tickets hold SSH keys from past debugging. According to OWASP, such narrow adapters memorize rare examples especially faithfully. Whatever ends up in the learned model parameters (weights), adapters or embeddings survives the deletion of its source.

**At runtime.** The model can pass on documents, system prompts, tool outputs, stored memories or other users' session data. Suppose you ask an internal assistant: "How do I get onto the staging database?" It names host, user and password from a guide a colleague left in the team share, fully indexed and readable for you. Nobody had to attack the model. According to OWASP, open shares and stale permissions are often the cause. With RAG, the application fetches matching passages before answering. How similar they are to the question says nothing about read rights, Kimmerle and Okeyode stress. Without filters for identity, tenant and document rights, users asking the same question get the same hits. A shared cache or search store can also mix sessions.

**In the pipeline and in operations.** According to OWASP, observability platforms log full model inputs, answers and traces by default. Suppose an assistant looks up a customer account. Customer number and address land in the host journal as tool arguments, readable by group `adm`. The chat answer was clean. The log holds the data. According to OWASP, leaked embeddings can be turned back into plaintext: even an "embeddings-only" backup can expose documents.

**Through observation.** Even without plaintext, the length of encrypted answers, response times and confidence values (the model's estimate of its own certainty) give something away. On a shared model server with a prefix cache, which keeps the already processed beginnings of inputs, repeated questions are answered measurably faster. Farlow describes such side channels as less reliable and harder to detect than direct attacks.

## Neighbors

The most frequent trigger is a [prompt injection](../prompt-injection/): an instruction in a document makes the model print its system prompt along with the access key, or send data out through a tool. How far that gets is decided by [excessive agency](../excessive-agency/).

## What I check in a pentest

1. **Data surface.** I check which shares are actually indexed, since when and with which rights. I run a secrets scanner over the text corpus, as I would over a repository.
2. **Authorization before retrieval.** I ask the same question from two accounts with different rights. I check whether the rights check happens in the search query or only afterwards. I test the filter with wrong permission tags on documents and check whether one tenant gets another's hits.
3. **Output channels.** I follow a marked record through the journal, the observability platform, tool arguments, cache and backup. At every stop I check who can read it.
4. **More than asked.** I test summarizing, translating and extracting: does hidden PDF text show up, or neighboring database fields, or the system prompt? With fine-tuned models, I try to make them complete training examples.
5. **Session separation.** I run parallel sessions under different users and check whether stored memories or caches carry content from one to another.

## Countermeasures that hold

- **Shrink the data surface.** Wilson asks of every source what happens if the model gives it out. Classify sources, and remove unneeded content, credentials, personal data and duplicates before ingestion.
- **Authorization in the query.** Enforce rights on documents and chunks during the search itself. A later filter cannot take back content once handed over. For sensitive data, use separate indexes per tenant.
- **Minimize the context.** Send external providers only the fields they need. Credentials do not belong in the system prompt.
- **Memory at the right boundary.** Separate memories by user and tenant, and limit the scope and lifetime of caches. Kimmerle and Okeyode rely on this isolation.
- **Logs and traces are outputs.** Redact before export and restrict read access. Never store reasoning steps raw. Enforce promises like "no training on your data" technically.
- **Filters last.** Combine regular expressions with filters that classify content and recognize sensitive details. Text patterns alone fail on encodings and other languages.

Neither in the scenario nor with EchoLeak did anyone have to break in. The system passed on what lay within its reach: once to a person with no right to it, once over an output channel nobody had noticed. Start there, with the reach and with the channels.
