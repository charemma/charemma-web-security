---
lead: "An agent is a language model with tools and credentials. How much damage a wrong decision does depends not on the model, but on what the system has allowed it to do."
updated: 2026-10-26
sources:
  - label: "OWASP Top 10 for LLM Applications, LLM03:2026 Excessive Agency"
    url: "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
  - label: "Steve Wilson: The Developer's Playbook for Large Language Model Security"
  - label: "Kris Kimmerle, David Okeyode: AI Under Attack"
  - label: "Railway: Your AI wants to nuke your database. Guardrails fix that."
    url: "https://blog.railway.com/p/your-ai-wants-to-nuke-your-database"
  - label: "PC Gamer: Here we go again: AI deletes entire company database and all backups in 9 seconds, then cheerfully admits 'I violated every principle I was given'"
    url: "https://www.pcgamer.com/software/ai/here-we-go-again-ai-deletes-entire-company-database-and-all-backups-in-9-seconds-then-cheerfully-admits-i-violated-every-principle-i-was-given/"
  - label: "Cybersecurity News: AI Coding Agent Powered by Claude Opus 4.6 Deletes Production Database in 9 Seconds"
    url: "https://cybersecuritynews.com/ai-coding-agent-deletes-data/"
---

## What this is about

An agent (a language model with callable functions and credentials) often finds broad access already in place and uses it as soon as a plan suggests it. Kimmerle and Okeyode call this ambient authority (access rights that come from the environment). OWASP lists it as LLM03:2026 Excessive Agency: the system allows harmful actions when the model responds in an unexpected, ambiguous or manipulated way, whatever the reason. What counts is what you allow it to do. [Railway](https://blog.railway.com/p/your-ai-wants-to-nuke-your-database) confirms on its blog that a coding agent deleted a production volume on its platform. In April 2026 it hit PocketOS, a software vendor for car rental companies, whose agent was working in Cursor. The animation shows this case, based on Railway and on the reports by [PC Gamer](https://www.pcgamer.com/software/ai/here-we-go-again-ai-deletes-entire-company-database-and-all-backups-in-9-seconds-then-cheerfully-admits-i-violated-every-principle-i-was-given/) and [Cybersecurity News](https://cybersecuritynews.com/ai-coding-agent-deletes-data/).

[animation]

Nobody attacked. The model had guessed wrong. Railway's API carried out the correctly built, authenticated request as it would a call from a deployment script. An unrestricted terminal, a token for the whole account and an irreversible action without approval let the mistake take effect: too much functionality, too many permissions, too much autonomy.

According to PC Gamer, PocketOS first carried on with a backup three months old. Railway later restored the database and made deletions through the API reversible for 48 hours.

## Three forms

OWASP names three causes. In practice I rarely find them alone.

**Too much functionality.** If the agent is meant to restart a service, one tool (a callable function) that runs `systemctl restart` for a fixed list of services is enough. If it gets "run shell command" instead, because that was quicker to build, it can also install packages, delete files and open outbound connections. OWASP also counts development tools that nobody removed.

**Too many permissions.** The tool is narrow, the identity behind it is not. If the agent analyzes logs over SSH, the key might belong to the automation account that sits in `sudoers` because of its deployment tasks. Or the read tool uses a database user that may run `UPDATE` and `DELETE` as well as `SELECT`. Or a technical account sees all users, although the agent acts for only one. Wilson advises treating the model like any other system user. Then you notice everything you have given it.

**Too much autonomy.** If the agent frees up disk space, it might delete what it takes for leftovers. It might change firewall rules or run `terraform apply`, because the confirmation prompt got annoying during the pilot.

## Neighbors

Excessive agency is rarely the way in. It is the reason the way in gets expensive. The trigger can be a wrong guess, as with PocketOS, or a [prompt injection](../prompt-injection/) (a smuggled-in instruction) in a ticket, a document or a tool response. The agent then uses its tools for a goal nobody assigned. With few permissions, the same instruction goes nowhere. What the agent gives away through answers and outputs belongs to [sensitive information disclosure](../sensitive-information-disclosure/).

## What I check in a pentest

1. **Tool inventory.** I check what each tool can really do: shell, HTTP fetch, free-form SQL. I look for development leftovers and functions without a use case.
2. **Identities and permissions.** I find out whose credentials each tool works with. I check database permissions, `sudoers`, IAM policies, OAuth scopes and the scope of the API tokens. I look for credentials in project files, in the configuration of command-line tools and in the SSH agent. What can the agent do if it chains tools under this identity?
3. **Approvals.** I check which actions run without confirmation, what the confirmation prompt shows, and whether another tool reaches the same effect without one.
4. **Triggering.** I set ambiguous tasks and place instructions in the data the agent reads. I watch which tools it uses, not just its answer.
5. **Traceability.** I read the log backwards: which goal led to the action, with which identity, on which system, with which approval?

## Countermeasures that hold

- **Least privilege per tool.** Few tools, few functions: instead of "run shell command", a tool for exactly one operation with validated parameters. Limit credentials to action, target, environment and lifetime. A token for staging does not reach production.
- **Separate identities for agents.** An agent runs under its own name, with an owner, short-lived credentials and a way to revoke them. No borrowed developer tokens, no long-lived tokens on disk. When it acts for a user, it acts with that user's permissions, across chained calls too.
- **Human approval, in the target system.** Before deleting, sending, deploying or paying, a human confirms and sees the action, the target and the way back. The target system or the tool enforces the approval outside the agent's reach; a rule in the prompt is not enough. Small, reversible actions may run automatically.
- **Build in a way back.** Delay deletions and make them reversible, as Railway did after the case. Keep backups out of reach of the identity that may delete data. This limits the damage, but it does not prevent the action.
- **Architecture before filters.** Code checks every request against a policy: in the tool, in an independent instance in front of it, or in the target system. Filters on inputs and outputs stay, but according to OWASP they are not among the basic measures. Logging and rate limiting do not prevent the wrong call, but they limit the damage.

With PocketOS, one wrong guess was enough. Limit what your agent may do, so that a guess does not become an incident, whether the model errs on its own or an attacker helps it along.
