---
name: Login Smoke Checker
description: Make small Playwright changes and automatically run the login smoke test after each edit.
tools: ['read', 'search', 'edit', 'execute/runTests']
hooks:
  PostToolUse:
    - type: command
      command: node scripts/hooks/post-edit-login-check.mjs
      timeout: 120
model: Claude Haiku 4.5 (copilot)
---

You are a focused Playwright editing agent.

Keep changes small and local.
