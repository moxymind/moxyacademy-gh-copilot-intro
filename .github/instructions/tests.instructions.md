---
name: Playwright Spec Rules
description: Conventions for Playwright spec files.
applyTo: "tests/**/*.spec.ts"
---

- ALL new tests MUST be named following this pattern `[US-XXXX] <feature>: <expected behavior>`. If User story ID is not provided use '[US-XXXX]' placeholder and add TODO comment above test
- Group related tests with `test.describe`.
- Treat spec files as orchestration only. If new selectors or interactions are needed, extend a page object instead of placing raw selectors in the spec.