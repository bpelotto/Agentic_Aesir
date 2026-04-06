---
description: "Agent roster and capability directory. Load this file when you need to know which specialist agents are available, what each one does, when to delegate to them, or how to compose a multi-agent plan. Use when: selecting which agent to delegate a task to, building a delegation plan, understanding who owns what domain, describing team capabilities to another agent, figuring out who to ask for something."
---

# Agent Roster  Quick Reference

All agents live at `.github/agents/`. Invoke by name in the agent picker or reference by name when delegating from another agent. Provide task context and expected output scope when delegating.

---

## Full Agent Directory

| Agent | Role | Delegate when you need... |
|-------|------|--------------------------|
| **Odin** | Chief Orchestrator | Complex or unclear requests; synthesis across multiple agents; unsure which specialist to use |
| **Frigga** | Project Manager | Task tracking, sprint planning, backlog management, status reports, dependency mapping |
| **Tyr** | Product Owner | Requirements, user stories, acceptance criteria, PRDs, backlog prioritization, scope decisions |
| **Mimir** | Research Analyst | Deep research, technology evaluation, "how does X work?", comparing tools or frameworks |
| **Skadi** | Data Analyst | Metrics, dashboards, SQL/KQL queries, KPI tracking, pattern analysis, data reporting |
| **Vidar** | Software Architect | System design, ADRs, tech stack decisions, architecture diagrams, patterns and conventions |
| **Sigurd** | Engineering Manager | Breaking work into tasks, coordinating engineers, effort estimates, removing blockers |
| **Thor** | C# / Backend Engineer | C# code, .NET APIs, Azure Functions, Entity Framework, backend services, CLI tools |
| **Magni** | Frontend / UI Engineer | React/TypeScript/Blazor components, CSS/Tailwind, accessibility, browser-side logic |
| **Njord** | Database Engineer | SQL schemas, EF Core migrations, query optimization, Cosmos DB design, data pipelines |
| **Aegir** | DevOps / Infrastructure | Bicep/Terraform IaC, Docker, Azure environments, Key Vault, networking, RBAC |
| **Heimdall** | CI/CD Expert | GitHub Actions pipelines, deployment gates, branch protection, release automation |
| **Baldur** | Code Reviewer | PR reviews, code quality, naming, maintainability, test coverage, error handling |
| **Loki** | Security Expert | OWASP reviews, auth/authz, injection vulnerabilities, threat modeling, secrets management |
| **Var** | QA Lead | Test strategy, test plans, release readiness, coverage gaps, go/no-go decisions |
| **Ull** | Unit Test Creator | xUnit C# tests, Vitest TypeScript tests, mock/stub setup, edge case and boundary coverage |
| **Modi** | Integration Test Creator | API integration tests, WebApplicationFactory, Playwright E2E, service boundary tests |
| **Fenrir** | Performance Engineer | k6/NBomber load tests, BenchmarkDotNet benchmarks, chaos experiments, resilience testing |
| **Bragi** | Copywriter | Landing page copy, CTAs, product descriptions, taglines, email copy, ad copy |
| **Saga** | Blogger / Content Creator | Blog posts, dev diaries, tutorials, tech deep-dives, building-in-public narratives |
| **Idunn** | Editor | Reviewing and editing any written content  clarity, flow, grammar, voice consistency |
| **Rán** | SEO Expert | Keyword research, meta titles/descriptions, content briefs, on-page SEO optimization |
| **Freya** | Graphic Designer | Brand palette, typography specs, visual asset specs, design system tokens |
| **Eir** | UX Designer | User flows, wireframes, interaction design, accessibility audits, usability reviews |
| **Kvasir** | Technical Writer | READMEs, API docs, developer guides, tutorials, contributing guides, changelogs |
| **Huginn** | News & Trend Gatherer | Latest AI/tech/science news, trend digests, "what's new in X this week", story ideas |
| **Muninn** | Content Strategist | Blog topic ideas, editorial calendars, content series planning, repurposing strategies |
| **Hermod** | Social Media & Comms | LinkedIn/Twitter/Bluesky post copy, launch announcements, thread writing, distribution |
| **Jormungandr** | API / Integration Specialist | OpenAPI specs, REST/GraphQL design, webhook contracts, third-party integration planning |
| **Angrboda** | Risk & Dependency Analyst | Risk registers, dependency audits, vendor lock-in assessment, "what could go wrong" |
| **Völva** | AI / ML Specialist | LLM selection, prompt engineering, agentic workflow design, RAG pipelines, AI evals |

---

## Standard Pipelines

**Engineering feature:**
Tyr  Vidar  Sigurd  Thor/Magni/Njord  Baldur  Ull/Modi  Loki  Heimdall  Var

**Content piece:**
Huginn  Muninn  Saga/Bragi  Idunn  Rán  Hermod

**New project kick-off:**
Odin  Frigga  Tyr  Mimir  Angrboda  Vidar