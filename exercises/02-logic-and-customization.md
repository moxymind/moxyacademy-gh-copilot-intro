# Part 2: Mastering Logic & Customization

*Focus: How to make Copilot follow your specific project rules.*

In this exercise, we will explore how to steer GitHub Copilot's behavior using model selection, custom instructions, and reusable prompt files.

---

## 2.1 Model Selection & Reasoning

Copilot allows you to choose different AI models based on the task at hand. 

| **Model Type**    | **Best For**                                           | **Benefit**                               |
| ----------------- | ------------------------------------------------------ | ----------------------------------------- |
| **Non-Reasoning** | Boilerplate, simple explanations, quick fixes.         | Low latency, faster response.             |
| **Reasoning**     | Complex logic, architectural planning, deep debugging. | High accuracy, handles edge cases better. |

To view all models and manage them. Even add local model through Ollama follow:
1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Type Chat: Manage language models
3. In modal check all available models, add new, or hide some from quick menu

### Hands-on Exercises:
1. **Toggle Models:** Open the Copilot Chat view. Use the model dropdown (usually near the top or input box) to switch between a Non-Reasoning model (like GPT-4.1 ) and a Reasoning model (like GPT-5.4 or Claude Sonnet 4.6).
2. **Compare Outputs:** Ask both models (GPT 4.1 and GPT 5.4) a complex architectural question (e.g., *"How should I structure a data-driven Playwright test framework?"*). Notice the difference in the "Thinking Effort" and detail provided.
3. **Multi-modal Input:** Take a screenshot of a login UI. Drag and drop the image into Copilot Chat and ask: *"Write a Playwright test to verify the elements in this image."*
4. Optional: **Add local models**: If you have access to local AI models through tools like Ollama, you can add them to your Copilot model list for even more customization and control. This is especially useful for teams with specific data privacy requirements or those who want to fine-tune models on their own codebase.

---

## 2.2 Custom Instructions (The Rulebook)

Custom instructions are for rules Copilot should remember automatically. Think of them as the repository rulebook, not as a way to describe one specific task.

Use this decision rule:

- If the guidance should apply automatically in most chats, use instructions.
- If the guidance is only for one repeated task you want to run on demand, use a prompt file instead.

There are two instruction patterns you should know:

1. **Always-on instructions:** use `.github/copilot-instructions.md` for rules that should apply across the whole workspace.
2. **File-based instructions:** use `.instructions.md` files in `.github/instructions/` when rules should only apply to matching files, such as `tests/**/*.spec.ts` or `pages/**/*.ts`.

> Important: custom instructions influence Copilot Chat requests automatically. You do not manually invoke them each time.

### 2.2.1 When To Use Instructions And When Not To

| **Use instructions when...** | **Do not use instructions when...** |
| ---------------------------- | ----------------------------------- |
| you want stable project rules to apply in most chats | you are describing a one-off task |
| you want workflow expectations to be automatic | you only need the guidance occasionally |
| you need file-type-specific conventions | you are packaging a reusable slash command |
| you want team standards to stay consistent | the prompt needs task-specific input every time |

### 2.2.2 Short Example: Layer Global And Scoped Rules

1. **Repo-wide example:** `.github/copilot-instructions.md`
   ```markdown
   - After implementing a code change, run the affected Playwright tests before finishing.
   - Do not use `waitForTimeout`; rely on Playwright auto-waiting and explicit assertions.
   - Prefer strict TypeScript-friendly code and avoid `any`.
   ```
2. **Test-specific example:** `.github/instructions/tests.instructions.md`
   ```markdown
   ---
   name: Playwright Spec Rules
   description: Conventions for Playwright spec files.
   applyTo: "tests/**/*.spec.ts"
   ---

   - ALL new tests MUST be named following this pattern `[US-XXXX] <feature>: <expected behavior>`. If User story ID is not provided use '[US-XXXX]' placeholder and add TODO comment above test
   - Group related tests with `test.describe`.
   - Treat spec files as orchestration only. If new selectors or interactions are needed, extend a page object instead of placing raw selectors in the spec.
   ```
3. **Page-object-specific example:** `.github/instructions/pages.instructions.md`
   ```markdown
   ---
   name: Page Object Rules
   description: Conventions for files in the pages directory.
   applyTo: "pages/**/*.ts"
   ---

   - Define selectors as `readonly Locator` properties on the page object class.
   - Use behavior-oriented helper names such as `sortByNameDescending` or `expectCartBadgeCount`.
   - Keep selectors and page-specific assertions centralized in the page object.
   ```

Why instructions are the right tool here:

- these rules are meant to shape many future chats, not only one task
- the rules depend on repository structure and file type
- you do not want to repeat them manually in every request

### 2.2.3 Hands-On Exercise: See Instructions Change The Result

Use a task that naturally touches both `tests/` and `pages/`.

Suggested prompt:

*"Add coverage proving inventory can be sorted from Z to A and that adding the backpack updates the cart badge."*

1. Temporarily move or rename the instruction files if you want to observe a true baseline.
2. Start a fresh chat and run the prompt with **no instructions**.
3. Record what Copilot does in `tests/inventory.spec.ts` and `pages/inventory.page.ts`.
4. Restore only `.github/copilot-instructions.md` and rerun the same prompt in a fresh chat.
5. Check whether Copilot now follows the repo-wide workflow rules, especially test execution and stronger Playwright patterns.
6. Restore the two file-based instruction files and rerun the same prompt again.
7. Compare the three runs and answer:
   - Did new selectors stay in the page object?
   - Did the spec stay focused on orchestration?
   - Did helper names describe behavior clearly?
   - Did Copilot run the affected test before finishing?

The goal of this exercise is not only to see a different answer. It is to see *which part of the answer changed because the rule became automatic*.

> Example solution is on the branch `solution/module-02-logic-customization`

### 2.2.4 How To Verify Instructions Were Applied

If the behavior is unclear, verify it directly instead of guessing.

1. Start a new chat after creating or editing instruction files.
2. Check the response references to see whether Copilot included your instruction files.
3. If needed, open **Chat: Open Chat Customizations** or use Chat Diagnostics to inspect which instruction files were loaded.
4. If a file-based instruction does not seem to apply, first verify that the `applyTo` glob matches the file you are working on.

---

## 2.3 Prompt Files (.prompt.md)

Prompt files are reusable, on-demand workflows. Unlike instructions, they do **not** run automatically. You invoke them when you want that specific task.

In VS Code, workspace prompt files usually live in `.github/prompts/` and appear as slash commands in chat.

Use this decision rule:

- If you want Copilot to remember a standing rule, use instructions.
- If you want a reusable task you can run with `/something`, use a prompt file.

### 2.3.1 When To Use Prompt Files And When Not To

| **Use prompt files when...** | **Do not use prompt files when...** |
| ---------------------------- | ----------------------------------- |
| you repeat the same multi-step request often | the behavior should happen in every chat automatically |
| you want a slash command for a known workflow | the rule only depends on file type or folder |
| you want consistent task wording and output shape | the request is truly one-off and easier to type directly |
| the task needs optional user input each time | you are defining baseline project standards |

Good prompt-file candidates in this repository would be:

- running and fixing a failing Playwright test
- generating a new Playwright test from the existing project patterns
- preparing a pull request summary from a finished change

Bad prompt-file candidates here would be:

- **never use `waitForTimeout`** because that should be automatic
- **all spec files should use `test.describe`** because that is a file-type rule
- **use `readonly Locator` properties in page objects** because that is a page-object convention, not a task

### 2.3.2 Short Example: A Repo-Specific Prompt File

This repository now includes a workspace prompt file at `.github/prompts/prepare-pr-summary.prompt.md`.

It packages one repeated workflow: inspect the current workspace changes and draft a concise pull request summary.

Shortened example:

```markdown
---
name: prepare-pr-summary
description: Prepare a concise pull request summary for the current workspace changes.
argument-hint: Describe the purpose of the change for reviewers.
---

Prepare a pull request summary for the current workspace changes.

- Inspect the changed files first.
- Summarize the purpose of the change and the main implementation updates.
- Mention validation that was run.
- Keep the final output concise and reviewer-friendly.
```

Why a prompt file is the right tool here:

- this is a reusable workflow, not a permanent repository rule
- the task benefits from fresh input each time, such as the goal of the change
- it is a common task you may want to run often, but not in every chat

### 2.3.3 Related Hands-On Exercise

1. Create `/prepare-pr-summary.prompt.md` in `.github/prompts/` with the content from the example above.
2. After making some code changes, open Copilot Chat and type `/prepare-pr-summary`.
3. When prompted, enter a short description of the change goal, such as *"clarify when to use prompt files versus instructions"*.
4. Review whether Copilot:
   - inspects the changed files first
   - summarizes the change clearly for a reviewer
   - mentions validation that was run, or notes that none was run
5. Run the same request again in a fresh chat, but write it manually instead of using the prompt file.
6. Compare the two runs:
   - Which one was faster to start?
   - Which one stayed more consistent?
   - Which behavior came from the prompt file, and which came from the instruction files?

Now compare that with a one-off question such as *"Why is the login page using `[data-test=\"error\"]` for the error message locator?"*

Do **not** use the prompt file for that question. It is not a reusable workflow.

> Example solution is on the branch `solution/module-02-logic-customization`

### 2.3.4 Instructions Vs Prompt Files Cheat Sheet

| **Situation** | **Best Tool** | **Why** |
| ------------- | ------------- | ------- |
| Every code change should avoid `waitForTimeout` | Instructions | The rule should apply automatically |
| Every page object should centralize selectors | Instructions | The rule is scoped by file type |
| You often ask Copilot to draft pull request summaries from current changes | Prompt file | The workflow repeats, but only when invoked |
| You have one unusual debugging question about a failing login assertion | Normal chat prompt | It is one-off and does not need reusable packaging |

The simplest mental model is this:

- **Instructions tell Copilot how to work in this repository.**
- **Prompt files tell Copilot what reusable workflow to run right now.**
