# Part 3: The World of Agents

*Focus: Create practical custom agents, add one reusable skill, and orchestrate multiple agents with subagents.*

This module is designed for a short live session. You can deliver the core content in about 15 minutes and then run hands-on exercises.

---

## 3.1 Agents vs Skills vs Prompt Files

Use this simple decision table during your intro:

| **Feature** | **When to Use** |
| ----------- | --------------- |
| **Prompt Files** | Lightweight, reusable task templates you invoke on demand (`/command`). |
| **Custom Agents** | Persistent personas with their own instructions, tools, and model preferences. |
| **Agent Skills** | Portable capability folders (`SKILL.md` + optional scripts/examples) that can be reused across agents. |

Quick mental model:

- **Prompt file = task shortcut**
- **Agent = role/persona**
- **Skill = reusable capability package**

---

## 3.2 Simple Custom Agent

In VS Code, create a workspace custom agent file in `.github/agents/`.

Example: `.github/agents/qa-reviewer.agent.md`

```markdown
---
name: QA Reviewer
description: Review test quality and identify high-risk gaps before merge.
argument-hint: What should I review? (file, diff, or feature)
tools: ['read', 'search', 'execute/runTests']
model: Gemini 3 Flash (Preview) (copilot)
---

You are a QA-focused reviewer.

When reviewing code:
1. Prioritize correctness and regression risks.
2. Identify missing or weak tests.
3. If the `qa-test-checklist` skill is available and the request is test-related, apply that skill automatically.
4. Keep recommendations concrete and test-focused.
5. Return findings ordered by severity.

Output format:
- Strengths
- Risks
- Missing tests
- Suggested next test case
```

### The 5 frontmatter fields to remember first

1. `name`: agent label in the UI.
2. `description`: what this agent is for.
3. `argument-hint`: what input user should provide.
4. `tools`: what this agent is allowed to do (principle of least privilege).
5. `model`: preferred model for this role.

Optional later:

- `agents`: which subagents this agent may call.
- `user-invocable`: if `false`, hide from chat dropdown (subagent-only workers).
- `disable-model-invocation`: block this agent from being used as subagent.

### Hands-on Exercise: Create Your First Agent

1. Create `.github/agents/qa-reviewer.agent.md` with the example above.
2. Open a fresh chat and switch to **QA Reviewer** in the agent selector.
3. Ask: *"Review `tests/inventory.spec.ts` for missing negative-path coverage."*
4. Check whether output includes:
   - risk-ranked findings
   - missing test suggestions
   - concrete next test ideas

---

## 3.3 One Simple Skill and How Agent Uses It

A skill is a folder with `SKILL.md` and optional resources.

Create this structure:

```text
.github/skills/qa-test-checklist/
├── SKILL.md
└── output-template.md
```

SKILL.md content:

```markdown
---
name: qa-test-checklist
description: Checklist for QA-oriented test review in Playwright projects.
argument-hint: Scope to review (test file, feature, or diff)
---

# QA Test Checklist Skill

Use this skill when reviewing automated tests for quality and risk.

Before formatting the final answer, read the file `.github/skills/qa-test-checklist/output-template.md` using the read_file tool and follow its structure exactly.
Adapt the wording to the current review. Do not copy placeholder text literally.

Checklist:
1. Verify happy path and at least one negative path.
2. Verify assertions are behavior-focused, not implementation-coupled.
3. Verify selectors are stable and avoid brittle CSS chains.
4. Verify edge cases for input and state transitions are covered.
5. Suggest one additional high-value test if coverage is weak.
```

output-template.md:

```markdown
# QA Review Output Template

## Strengths
- What is already solid in the current tests?

## Risks
- Severity:
- Risk:
- Why it matters:

## Missing tests
- Scenario:
- Why it is missing:

## Suggested next test case
- Name:
- Intent:
- Steps:
  1. ...
  2. ...
  3. ...
- Expected result:
```
How to use it:

1. **Manual slash command:** type `/qa-test-checklist` in chat.
2. **Automatic loading:** if prompt matches skill description, Copilot can load it automatically.
3. **Enhanced existing agent flow (recommended):** update your existing `QA Reviewer` instructions so test-review requests automatically apply this skill.

### 3.3.1 Enhance Existing Agent To Use The Skill By Default

You do not attach a skill in agent frontmatter. Instead, you make the agent *ask for that capability in its instructions*.

Add this block to your existing `.github/agents/qa-reviewer.agent.md` body:

```markdown
Skill usage rule:
- For any test review or test design request, apply the `qa-test-checklist` skill if available.
```

Why this works:

- the agent persona provides role + tool boundaries
- the skill provides reusable domain workflow
- together, calling the agent is enough for consistent behavior

### Hands-on Exercise: Skill + Agent Together

1. Create the skill folder and `SKILL.md` file.
2. Update your existing `QA Reviewer` agent with the **Skill usage rule** block above.
3. Start a fresh chat, select **QA Reviewer**, and ask: *"Review `tests/inventory.spec.ts`"*
4. Confirm that the response follows the skill's structure and checklist logic, even without typing `/qa-test-checklist`.
5. Optional verification: open Chat Diagnostics and check that the skill was loaded for this response.
6. Compare result quality:
   - agent before enhancement
   - agent after enhancement
   - direct slash command `/qa-test-checklist`

Goal: see that skills package reusable know-how, while agents control role and tool boundaries.

---

## 3.4 Orchestrate Multiple Agents (Coordinator + Workers)

For multi-step or multi-perspective tasks, use coordinator/worker orchestration.

Important rule:

- To invoke subagents, the main agent must have the `agent` tool (runSubagent capability).

### Example Agent Set

Coordinator: `.github/agents/qa-coordinator.agent.md`

```markdown
---
name: QA Coordinator
description: Coordinate specialized QA reviews and merge findings.
tools: ['agent', 'read', 'search']
agents: ['Correctness Reviewer', 'Coverage Reviewer']
model: Claude Haiku 4.5 (copilot)
---

You are a coordinator.

For each review request:
1. Run Correctness Reviewer as a subagent.
2. Run Coverage Reviewer as a subagent.
3. Prefer parallel subagent execution when independent.
4. Merge results into one prioritized summary: Critical, Important, Nice-to-have.
```

Worker 1: `.github/agents/correctness-reviewer.agent.md`

```markdown
---
name: Correctness Reviewer
user-invocable: false
tools: ['read', 'search']
---

Focus only on correctness and regression risk.
```

Worker 2: `.github/agents/coverage-reviewer.agent.md`

```markdown
---
name: Coverage Reviewer
user-invocable: false
tools: ['read', 'search']
---

Focus only on test coverage gaps and missing edge cases.
```

### Hands-on Exercise: Multi-agent Orchestration

1. Create all three agent files.
2. Start chat with **QA Coordinator**.
3. Ask: *"Review login and inventory tests and provide one combined QA report."*
4. Confirm that coordinator delegates to both workers and returns merged output.
5. Bonus: ask for separate sections per worker, then a final unified recommendation.

Notes:

- By default, subagents do not invoke further subagents.
- Recursive nesting can be enabled with `chat.subagents.allowInvocationsFromSubagents` when needed.

---

## 3.5 Nice To Know

### Memory (quick overview)

- **User memory (`/memories/`)**: preferences across all workspaces.
- **Repository memory (`/memories/repo/`)**: project-specific conventions.
- **Session memory (`/memories/session/`)**: short-lived context for current conversation.

Practical script line for demo:

- "Remember that we use conventional commits with max 50 chars."

Then ask later:

- "What is our commit message style?"

### Where to run agents (quick overview)

- **Local agent**: interactive editor work, immediate feedback.
- **Copilot CLI**: autonomous/background local execution.
- **Cloud agent**: remote execution + PR collaboration.
- **Third-party agents**: provider-specific stacks (Anthropic/OpenAI).

### Approval modes (quick overview)

- **Default approvals**: safer baseline.
- **Bypass approvals**: faster, less friction.
- **Autopilot (Preview)**: highest autonomy.

Use this rule of thumb:

- More autonomy = more speed, but also higher governance and review requirements.
