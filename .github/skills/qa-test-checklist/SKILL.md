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