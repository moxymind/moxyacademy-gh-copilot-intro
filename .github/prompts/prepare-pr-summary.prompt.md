---
name: prepare-pr-summary
description: Prepare a concise pull request summary for the current workspace changes.
argument-hint: Describe the purpose of the change for reviewers.
---

Prepare a pull request summary for the current workspace changes in this repository.

Change context:
- ${input:context:what changed and why}

Start from these workspace inputs:
- the currently changed files in the workspace
- [.github/copilot-instructions.md](../copilot-instructions.md)
- [README.md](../../README.md)

Requirements:
- Inspect the changed files before writing the summary.
- Focus on reviewer-friendly outcomes, not a file-by-file changelog.
- Mention the purpose of the change, the main implementation updates, and any user-visible impact.
- Include validation that was run, or clearly note if nothing was run.
- Call out assumptions, risks, or follow-up work when relevant.
- Keep the summary concise and ready to paste into a pull request description.

In your response:
- provide a short PR summary
- include a validation section
- include open questions or risks if they exist