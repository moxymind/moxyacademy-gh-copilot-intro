# Part 4: Advanced Integration & Extensibility

*Focus: Connect Copilot to external capabilities with MCP, then add deterministic guardrails with agent hooks.*

---

## 4.1 MCP vs Hooks: Extend Reach, Add Control

- **MCP servers** give Copilot access to tools, resources, prompts, and apps outside your repository.
- **Hooks** run your own code at specific lifecycle events to validate, block, log, or automate behavior.

Use this decision table during the intro:

| **Need** | **Best Tool** | **Why** |
| -------- | ------------- | ------- |
| Copilot should query or act on something outside the repo | **MCP server** | You are adding new capabilities |
| Copilot should always follow a deterministic policy | **Hook** | You are enforcing behavior in code |
| Copilot should use an external system and then be checked automatically | **Both** | One expands reach, the other imposes discipline |

The most important framing for this module is not *more power*. It is **new trust boundaries**.

- MCP introduces external capabilities and external data.
- Hooks introduce automatic execution of your own commands.
- Both should be treated as security and workflow design decisions, not only as convenience features.

---

## 4.2 MCP Servers

Model Context Protocol (MCP) is an open standard for connecting AI to external tools and services.

In VS Code, MCP servers can provide:

- **Tools**: actions the agent can execute, such as browser automation or API operations.
- **Resources**: read-only context you can attach to a prompt, such as database tables or API responses.
- **Prompts**: reusable prompt templates exposed by the server.
- **Apps**: richer interactive UI rendered in chat.

For this workshop, the key idea is simple:

- **instructions tell Copilot how to behave**
- **MCP tells Copilot what else it can reach**

### 4.2.1 Marketplace vs Workspace vs Custom Server

Use this decision table:

| **Path** | **Use When** | **Avoid When** |
| -------- | ------------- | -------------- |
| **Marketplace server** | you want the fastest working demo with minimal setup | you need proprietary or internal data |
| **Workspace `mcp.json`** | you want the team to share the same MCP setup | the configuration would expose personal secrets |
| **Custom/local server** | you need domain-specific capabilities for internal systems | you only need a public capability already available in the gallery |

Critical notes to call out verbally:

- Local MCP servers can run arbitrary code. Only use trusted servers.
- Prefer environment variables or secure input variables for credentials. Do not hardcode secrets in `mcp.json`.
- Workspace config is useful for reproducible team setup, but it also means teammates inherit that trust decision.
- On Linux and macOS, sandboxing can reduce risk for local stdio servers.

### 4.2.2 Short Example: Add a Shared MCP Server

VS Code supports user-level and workspace-level MCP configuration.

Example `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```

### 4.2.3 Hands-On Exercise: Use MCP In A Familiar Flow

Goal: see Copilot use an external capability, not just repository context.

1. Add the Playwright MCP server either from the MCP marketplace or by reviewing the provided `.vscode/mcp.json` workspace configuration.
2. Start the server and confirm the trust prompt carefully before approving it.
3. Open a fresh chat and ask: *"Use the Playwright MCP server to open Sauce Demo, inspect the login form, and tell me which selectors look stable enough for our page object."*
4. Then ask: *"Compare that with our existing login page object and suggest one improvement."*
5. Review the chat transcript and tool approvals:
   - Which steps required the MCP server?
   - Which part came from repository context?
   - What changed compared with a normal chat request that has no browser access?

### 4.2.4 Optional Stretch: When Would You Build Your Own MCP Server?

Good examples:

- internal test case management system
- Jira or Azure DevOps metadata lookup
- proprietary API documentation
- database schema or audit data exposed safely as resources

---

## 4.3 Agent Hooks

Hooks are deterministic, code-driven automation triggered by agent lifecycle events.

This is the key distinction from instructions and prompts:

- **instructions influence model behavior**
- **hooks execute your command regardless of how the agent was prompted**

That makes hooks the right tool for:

- policy enforcement
- automatic validation
- audit logging
- controlled approvals

There are two useful scopes to teach:

- **Workspace hooks** in `.github/hooks/*.json`: use these for policies you want active across the repository.
- **Agent-scoped hooks** in `.agent.md` frontmatter: use these when automation should run only for one specific agent.

### 4.3.1 Three Hook Events To Teach First

Do not try to teach the full lifecycle table in detail on the first pass. Start with these three:

| **Hook Event** | **When It Fires** | **Best First Use** |
| -------------- | ----------------- | ------------------ |
| **PreToolUse** | before a tool runs | block or require approval for sensitive operations |
| **PostToolUse** | after a tool succeeds | run formatting, linting, or a narrow validation step |
| **Stop** | when the agent wants to finish | require one last check before the session ends |

### 4.3.2 Short Example: Auto-Format After Agent Edits

Create `.github/hooks/format.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "npx prettier --write \"$TOOL_INPUT_FILE_PATH\""
      }
    ]
  }
}
```

It is deterministic:

- the agent edits a file
- the hook runs automatically
- the result does not depend on the prompt wording

Important caveat for this repository:

- only use this exact example if Prettier is already available in the repo, for example as a `devDependency` with a formatting script. Otherwise, the hook will fail and cause confusion.
- if you want lower setup friction, prefer a script or command that already exists in the repo

### 4.3.3 Example: Risky Approval Hook

Use the workspace hook for this part because approval policies are easiest to understand when they apply everywhere.

This repository includes `.github/hooks/risky-command-approval.json` backed by `scripts/hooks/risky-command-approval.mjs`.

How to test it:

1. Open `.github/hooks/risky-command-approval.json` and check that `PreToolUse` runs before a tool executes.
2. Open `scripts/hooks/risky-command-approval.mjs` and focus on only two ideas in the script:
   - some commands should ask first
   - some commands should be denied
3. In chat, ask the agent to run a command that should require approval, for example:
   - *"Run `git push`"*
   - *"Install Prettier with npm"*
4. Confirm that the hook changes the flow and asks for approval.
5. Then ask for a clearly dangerous command, for example:
   - *"Run `rm -rf /`"*
6. Confirm that the hook denies the action.
7. Open the **GitHub Copilot Chat Hooks** output channel and show where the decision came from.

- this did not depend on prompt wording
- the policy lived in code, not in instructions
- this is the right pattern for approvals and safety controls

### 4.3.4 Hands-On Exercise: Agent-Scoped Post-Edit Login Check

Goal: show that hooks can enforce a real engineering workflow, not only style.

For this exercise, use an **agent-scoped hook** so the check does **not** run in every chat.

This repository includes `.github/agents/login-smoke-checker.agent.md` backed by `scripts/hooks/post-edit-login-check.mjs`.

Before testing, enable agent-scoped hooks:

1. Open Settings.
2. Turn on `chat.useCustomAgentHooks`.
3. Start a fresh chat and select **Login Smoke Checker** as the active agent.

Then run the exercise:

1. Open `.github/agents/login-smoke-checker.agent.md` and show that the hook lives in the agent frontmatter, not in `.github/hooks/`.
2. Open `scripts/hooks/post-edit-login-check.mjs`.
3. Explain the script in one sentence: *"If the agent edits a file in `pages/` or `tests/`, run the `successful login` smoke test."*
4. Ask the agent to make one small change in `pages/login.page.ts` or `tests/login.spec.ts`.
5. Open the **GitHub Copilot Chat Hooks** output channel and confirm the hook executed.
6. Discuss the result:
   - Did the hook run even though the prompt did not explicitly ask for validation?
   - Did it run only because this specific agent was active?
   - Is this better enforced as a hook or as an instruction?

Why this script is intentionally simple:

- it reads the hook payload from stdin
- it checks whether the edited file is inside `pages/` or `tests/`
- if yes, it runs `npm test -- --grep "successful login"`
- then it reports pass or block back to VS Code

Example hook:

```markdown
---
name: Login Smoke Checker
hooks:
  PostToolUse:
    - type: command
      command: node scripts/hooks/post-edit-login-check.mjs
      timeout: 120
---
```

### 4.3.5 How To Stop Hooks From Running All The Time

Use this simple rule:

- put **global policies** in `.github/hooks/`
- put **workflow-specific automation** in an agent file

For this workshop:

- keep `risky-command-approval.json` as a workspace hook because it is a true policy example
- keep the login smoke check inside `login-smoke-checker.agent.md` so it only runs when that agent is selected

If you need to disable workspace hooks temporarily:

1. Rename the JSON file in `.github/hooks/`, for example from `risky-command-approval.json` to `risky-command-approval.off`.
2. Or disable hook loading with the `chat.hookFilesLocations` setting.
3. Or move the hook logic into an agent file if it should not be global.

If you need to disable agent-scoped hooks temporarily:

1. Turn off `chat.useCustomAgentHooks`.
2. Or switch to a different agent.
3. Or remove the `hooks:` block from that agent file.

The simplest mental model is:

- workspace hook = always on for the repo
- agent hook = only on when that agent is active

### 4.3.6 Optional Advanced Hook Topics

- **SessionStart** to inject stable project context
- **SubagentStart** and **SubagentStop** for multi-agent governance
- **Stop** to prevent the agent from finishing before a required validation is done

Risk of overengineering:

- a badly designed `Stop` hook can create loops
- hook scripts should not silently depend on missing tools
- if the agent can edit the scripts that the hooks execute, review settings and approvals carefully

---

## 4.4 MCP vs Hooks Cheat Sheet

| **Situation** | **Best Tool** | **Why** |
| ------------- | ------------- | ------- |
| Copilot should inspect a live app or external API | **MCP** | the agent needs new capabilities |
| Every agent edit should trigger validation | **Hook** | this must happen deterministically |
| Copilot should use a browser and then be forced through a quality gate | **MCP + Hook** | one adds capability, one enforces process |
| You want better coding style suggestions | **Instructions** | this influences behavior, not execution |

The short version is:

- **MCP expands reach**
- **Hooks impose discipline**

---

## 4.5 Nice To Know

### Security reminders

- Treat MCP servers and hook scripts as trusted code, not as harmless configuration.
- Review server configuration before trusting it.
- Avoid hardcoded secrets.
- Prefer least privilege and the smallest useful automation.
