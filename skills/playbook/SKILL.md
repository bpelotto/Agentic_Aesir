---
name: playbook
description: How the Aesir team works. Use when deciding which Aesir agent fits a task, planning a multi-step or multi-agent workflow, estimating what a task will cost in tokens, or adding and overriding team agents.
---

# Aesir playbook

The main session is the orchestrator. Nine subagents do specialist work in their own context windows. This file says when to use them and how to keep the cost down.

## Delegate or do it yourself

Do it inline when:
- it is a handful of tool calls,
- you already hold the context (files read, decisions made),
- the user is iterating with you and wants to see each step.

Delegate when:
- the work fans out (review five modules, research three options),
- reading would flood your context (a large scan, long documents),
- you want an independent read (a review of your own change),
- the task needs a tool boundary (a read-only reviewer, an isolated worktree).

A subagent starts with no memory of this conversation. Its brief must carry the goal, the constraints, the files or paths that matter, and what done looks like. Run independent subagents in parallel; chain only where one needs another's output, and pass that output in the brief.

## The team

| Agent | Role | Model / effort | Writes |
|---|---|---|---|
| mimir | research, comparisons, digests, advisories | sonnet / medium | nothing |
| tyr | PRDs, stories, acceptance criteria | sonnet | docs/specs |
| vidar | architecture, API contracts, ADRs, risk | opus / high | docs/adr, docs/design |
| thor | implementation, any layer | sonnet | code |
| ull | test strategy and tests, all levels | sonnet | tests |
| baldur | code and security review | opus / high | nothing |
| aegir | infrastructure, CI/CD, releases | sonnet | infra, workflows |
| saga | docs, posts, release notes, editing | sonnet / low | docs, content |
| volva | prompts, agents, model choice, evals | sonnet | docs/ai |

Where the old roster went: Odin, Frigga, and Sigurd are the main session with plan mode. Loki is inside baldur. Magni and Njord are inside thor. Modi, Var, and Fenrir are inside ull. Heimdall is inside aegir. Kvasir, Bragi, Hermod, Idunn, Muninn, and Rán are inside saga. Huginn is inside mimir; Angrboda is split between mimir (advisories) and vidar (design risk). Jormungandr is inside vidar.

## Model and effort tiers

| Tier | Model | List price per MTok (in / out) | Use for |
|---|---|---|---|
| gather | haiku | $0.10 / $0.50 | file hunting, link checks, summarizing many small things (the built-in Explore agent) |
| build | sonnet | $2 / $10 | implementation, tests, writing, research |
| judge | opus | $4 / $20 | architecture, review, hard debugging |

Prices are the Anthropic API list as of October 2026; check current pricing before quoting.

- Each agent carries a default. Override per call (`model: opus`) when a task is genuinely hard; do not raise the default.
- Effort: lower for routine work (`low` for copy edits and digests), higher for design and review. The orchestrator's own effort is set by the session.
- Judge cost per completed task, not per call. A cheaper agent that needs a redo is not cheaper.
- Every agent's description is loaded into every session. Keep the roster lean.

## Pipelines

Skip any step that does not apply. Most work is one or two steps.

- Feature: tyr → vidar (only if structure changes) → thor → ull → baldur
- Bug fix: thor (failing test first) → baldur (if auth, data, money, or concurrency is involved)
- Content: mimir → saga
- New project: tyr → vidar → aegir → thor
- Dependency or security scare: mimir (advisory facts) → baldur (exposure in this code) → thor (fix)

## Overriding and extending

- Per project: `.claude/agents/<name>.md` with the same `name` replaces the plugin's agent for that project. Copy the plugin's file and edit it.
- New agent: one file in `.claude/agents/` (project) or `~/.claude/agents/` (all projects). Frontmatter `name`, `description` (under 250 characters; say when and when not), `tools`, `model`. Body under 60 lines: role, how to work, output shape, two or three reasoned constraints. No persona paragraphs; no roster.
- Shared rules belong in `AGENTS.md` (project) or `~/.claude/rules/` (all projects), not repeated in every agent.

## Copilot

VS Code Copilot reads Copilot-format agents from `.github/agents/` (project) or `~/.copilot/agents/` (user). Regenerate them from the plugin with `/aesir:setup --user` or `/aesir:setup --copilot`. Shared instructions live in `AGENTS.md`, which both tools read.
