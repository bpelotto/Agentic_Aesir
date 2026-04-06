# Agentic Aesir

A VS Code Copilot Chat workspace pre-configured with a full team of AI agents — each named after a Norse mythology figure, each with a single focused role. Together they operate as a company: Odin routes, specialists execute.

This repository is a **harness and playground**. Fork it, swap out agent definitions, extend the roster, or drop the agent files into your own project. It is also a personal learning environment and portfolio-building platform, documenting the journey of building with agentic AI from the ground up.

---

## Why This Exists

| Goal | What it means in practice |
|------|--------------------------|
| Learn AI | Explore agentic systems, LLMs, prompt engineering, and AI workflows hands-on |
| Build a portfolio | Create documented, working examples of agents, pipelines, and automation |
| Learn new technologies | Stay current with emerging concepts in software, AI, and science |
| Create software prototypes | Build real, usable tools and apps that could become products |
| Build a brand | Blog about the journey, share knowledge, and grow an audience |

---

## Getting Started

**Prerequisites:**
- [VS Code](https://code.visualstudio.com/)
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) extension with Copilot Chat enabled
- A GitHub Copilot subscription (Individual, Business, or Enterprise)

**Setup:**

1. Clone or fork this repository:
   ```bash
   git clone https://github.com/your-username/Agentic_Aesir.git
   cd Agentic_Aesir
   ```

2. Open the folder in VS Code:
   ```bash
   code .
   ```

3. Open Copilot Chat (`Ctrl+Alt+I` / `Cmd+Alt+I`) and switch to **Agent mode**.

4. Invoke an agent by selecting it from the agent picker, or start with Odin and describe your goal:
   ```
   @Odin I want to build a REST API for tracking blog posts. Where do we start?
   ```

Odin will assess the request, identify which specialists are needed, and produce a delegation plan.

---

## How It Works

### Agents as Files

Each agent is defined as a `.agent.md` file in `.github/agents/`. The file contains:
- A system prompt that defines the agent's role, scope, and behavior
- Instructions for when to delegate and what to produce
- Constraints that prevent scope creep into other agents' domains

To add a new agent, create a new `.agent.md` file in `.github/agents/` and define its role. It will be available in Copilot Chat immediately.

### Shared Team Context

`.github/copilot-instructions.md` provides workspace-level context visible to all agents: the company mission, the full roster, guiding principles, and cross-cutting conventions. Agents read this file as shared background knowledge.

### Delegation Model

Odin is the entry point for complex or multi-domain requests. He breaks tasks into sub-tasks and identifies which specialists to involve. Specialists execute within their domain and hand off to adjacent agents when the work crosses boundaries.

**Example pipelines:**

| Workflow | Agent sequence |
|----------|---------------|
| Engineering feature | Tyr → Vidar → Sigurd → Thor / Magni / Njord → Baldur → Ull / Modi → Loki → Heimdall → Var |
| Content piece | Huginn → Muninn → Saga / Bragi → Idunn → Rán → Hermod |
| New project kick-off | Odin → Frigga → Tyr → Mimir → Angrboda → Vidar |

---

## The Agent Roster

### Executive Layer

| Agent | Role |
|-------|------|
| **Odin** | Chief Orchestrator / Executive Assistant — primary entry point for any multi-faceted or unclear request |
| **Frigga** | Project Manager / Chief of Staff |

### Product & Strategy

| Agent | Role |
|-------|------|
| **Tyr** | Product Owner |
| **Mimir** | Research Analyst / Knowledge Gatherer |
| **Skadi** | Data Analyst |

### Engineering

| Agent | Role |
|-------|------|
| **Vidar** | Software Architect |
| **Sigurd** | Engineering Manager |
| **Thor** | C# / Backend Engineer |
| **Magni** | Frontend / UI Engineer |
| **Njord** | Database / Data Engineer |
| **Aegir** | DevOps / Infrastructure |
| **Heimdall** | CI/CD Expert |
| **Baldur** | Code Reviewer |
| **Loki** | Security Expert |

### QA

| Agent | Role |
|-------|------|
| **Var** | QA Lead / Test Strategist |
| **Ull** | Unit Test Creator |
| **Modi** | Integration Test Creator |
| **Fenrir** | Performance & Chaos Engineer |

### Content & Creative

| Agent | Role |
|-------|------|
| **Bragi** | Copywriter |
| **Saga** | Blogger / Content Creator |
| **Idunn** | Editor |
| **Rán** | SEO Expert |
| **Freya** | Graphic Designer |
| **Eir** | UX Designer |
| **Kvasir** | Technical Writer |

### Research & Growth

| Agent | Role |
|-------|------|
| **Huginn** | News & Trend Gatherer |
| **Muninn** | Content Strategist / Topic Generator |
| **Hermod** | Social Media & Communications |

### Specialized

| Agent | Role |
|-------|------|
| **Jormungandr** | API / Integration Specialist |
| **Angrboda** | Risk & Dependency Analyst |
| **Völva** | AI / ML Specialist |

---

## Project Structure

```
Agentic_Aesir/
├── .github/
│   ├── agents/                    # Agent definition files (.agent.md)
│   ├── instructions/              # Shared instruction files loaded by agents
│   │   └── agent-roster.instructions.md
│   └── copilot-instructions.md    # Workspace-level context for all agents
└── README.md
```

Agent files follow the naming convention `<agentname>.agent.md` and are stored in `.github/agents/`. Instruction files in `.github/instructions/` are referenced by agents that need shared domain knowledge (e.g., the full roster, coding conventions, deployment procedures).

---

## Using This as a Harness

This repository is designed to be forked and adapted. Common customizations:

**Add an agent:**
Create `.github/agents/myagent.agent.md` with a role-focused system prompt. Reference the existing agent files for structure and conventions.

**Modify an agent:**
Edit the `.agent.md` file for that agent. Changes take effect immediately in Copilot Chat.

**Use a subset of the team:**
Nothing requires using all agents. Take only the `.agent.md` files relevant to your project and drop them into your own `.github/agents/` directory.

**Plug into an existing project:**
Copy the `.github/agents/` directory and `.github/copilot-instructions.md` into any VS Code workspace. The agents become available in that project's Copilot Chat instance.

---

## Guiding Principles

- **Start with Odin** — for any multi-faceted or unclear request, invoke Odin to route to the right specialists.
- **Each agent has a single focus** — do not ask Thor to write blog posts; do not ask Bragi to write code.
- **Quality over speed** — prefer well-reasoned, well-structured output over quick and sloppy.
- **Everything feeds the portfolio** — code, blog posts, designs, and research are all portfolio artifacts.
- **Document the journey** — learning moments, mistakes, and discoveries are content opportunities.

---

## Contributing

This is a personal learning project, but ideas, agent definitions, and workflow patterns are welcome as discussions or pull requests.

If you build something interesting with the harness — a new agent, a multi-agent pipeline, a prompt pattern that works well — open a discussion and share it.

---

## License

[MIT](LICENSE)

