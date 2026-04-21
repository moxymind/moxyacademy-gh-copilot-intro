# Part 5: Security & Governance

*Focus: keep AI-assisted development safe, observable, and bounded so hallucinations do not turn into damage.*

---

## 5.1 The Safety Toolkit

The key idea for this section is simple:

- **capability without boundaries creates risk**
- **good governance reduces blast radius when the model is wrong**

Use this decision table during the intro:

| **Need** | **Best Control** | **Why** |
| -------- | ---------------- | ------- |
| Limit what terminal commands can reach | **Sandboxing** | strongest technical boundary on macOS/Linux |
| Keep risky actions user-controlled | **Approval levels** | user must explicitly allow sensitive operations |
| Prevent access to secrets and sensitive files | **Protected file patterns** | blocks or requires approval for high-risk files |
| Reduce trust in unknown codebases | **Restricted Mode / Workspace Trust** | agents stay disabled until the workspace is trusted |

### 5.1.1 Recommended Safety Baseline

1. Open untrusted repositories in **Restricted Mode** until you have reviewed them.
2. On Linux and macOS, enable `chat.tools.terminal.sandbox.enabled`.
3. Keep the session on the default approval flow unless you have a good reason to relax it.
4. Protect sensitive files with patterns such as `"**/.env": false` in edit auto-approval settings.
5. Review proposed edits in the diff before accepting them.

Two framing points matter here:

- **Sandboxing is stronger than auto-approval rules** because it enforces real OS-level boundaries.
- **Approvals are about consent, not containment**. If something is approved without sandboxing, the command can still be powerful.

### 5.1.2 Approval Levels

Keep this explanation short in the workshop:

| **Mode** | **Use When** | **Risk** |
| -------- | ------------ | -------- |
| **Default Approvals** | normal day-to-day work | slower, but safest default |
| **Bypass Approvals** | you trust the session and want speed | fewer safety pauses |
| **Autopilot** | contained demos or very trusted environments only | highest autonomy and highest risk |

If you want one sentence for the room:

- **Default is the safe default**
- **Autopilot is a deliberate trust decision**

### 5.1.3 Protecting Secrets

The simplest useful reminder is:

- do not rely only on the model to avoid secrets
- explicitly protect sensitive files and folders
- prefer session-scoped approvals over broad permanent trust

Good examples to call out:

- `.env`
- `secrets.json`
- deployment credentials
- internal config files with tokens or private endpoints

---

## 5.2 Debugging The AI

When the agent does something unexpected, do not start by assuming the model is confused. First check which boundary blocked it.

Common failure modes:

- the agent did not have the right file or context
- a tool needed approval and was blocked
- a hook or MCP server was not enabled or trusted
- the agent chose a poor path and got stuck

### 5.2.1 First Debugging Surfaces To Teach


| **If you need to know...** | **Check** |
| ------------------------- | --------- |
| what the agent tried to do and where it stalled | `github.copilot.chat.agentDebugLog.enabled` |
| why a tool did not run | approval prompts, trust banners, and tool permissions |
| why a hook did not fire | **Agent debug logs** output channel |
| why an MCP capability was missing | MCP server trust, startup status, and configuration |

Practical debugging rule:

- **inspect the system state before rewriting the prompt**

### 5.2.2 Optional Hands-On Exercise: Trace A Blocked Action

Goal: show that debugging agent behavior is mostly about visibility.

2. Start a fresh chat.
3. Ask the agent to do something that will likely need approval, such as reading a protected file or running a terminal command.
4. Observe what happened:
   - was the action blocked by approvals?
   - was the file protected?
   - did the tool never become available?
5. Open the debug log and explain where the session stalled.

If you want a backup prompt for demo purposes:

*"Try to inspect a protected config file and explain why you can or cannot proceed."*

---

## 5.3 Safety vs Debugging Cheat Sheet

| **Situation** | **Best First Move** | **Why** |
| ------------- | ------------------- | ------- |
| You want to reduce command blast radius | **Enable sandboxing** | containment is stronger than intent matching |
| You want the agent to pause before risky actions | **Use Default Approvals** | user stays in the loop |
| You want to keep secrets out of reach | **Protect sensitive files** | do not depend on prompt wording |
| The agent ignored or failed a task | **Check debug logs and approvals** | the cause is often operational, not conceptual |
| A hook or MCP integration did not behave as expected | **Check trust, output channels, and configuration** | these features depend on explicit enablement |

The short version is:

- **security limits damage**
- **debugging explains behavior**

---

## 5.4 Nice To Know

- Trusting an MCP server is a real security decision, not just a convenience click.
- Session-scoped approvals are safer than broad persistent approvals.
- Sandboxing is especially valuable when prompt injection is a concern.
- The most dangerous hallucinations are the ones combined with broad execution rights.