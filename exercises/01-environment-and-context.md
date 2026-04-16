# Chapter 1: Copilot Environment & Context Management

Welcome to Chapter 1! In this section, we will cover the core ecosystem of GitHub Copilot and how it "sees" your code to provide accurate suggestions.

## 1.1 Overview of the Environment

- **The Copilot Ecosystem:** It’s not just a chat box. It lives natively in the editor (Inline), the Sidebar (Chat), and even the Terminal (CLI).
- **Inline Suggestions:** The "ghost text" that appears as you type.
    - *Pro Tip:* You can disable these for specific file types via VS Code settings if they become noisy or distracting.
        1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
        2. Run **Preferences: Open User Settings (JSON)**.
        3. Add a language-specific block setting `editor.inlineSuggest.enabled` to `false` (e.g., `"[markdown]": { "editor.inlineSuggest.enabled": false }`).
- **Smart Actions:** Right-click context menus for common tasks:
    - Automatically generating commit messages (no more "fixed bug" or "WIP" messages).
    - Semantic search: Finding code by its meaning or intention, not just exact keywords.
- **Inline Chat (`Ctrl + I` / `Cmd + I`):** Quick code modifications without leaving your current line of code.

## 1.2 Chat & Context Management

- **The Context Window:** Understanding what Copilot exactly "sees."
    - **Implicit Context:** The currently selected text, the file you are actively editing, and other recently opened tabs.
    - **Explicit Context (`#`):** Use `#file` (e.g. `#file:login.page.ts`), `#folder` (e.g. `#file:tests`), or `#terminalLastCommand` in the chat to point the AI exactly where to look.
- **Workspace Indexing:** How Copilot builds a semantic map of your project to accurately answer cross-file and architectural questions. This is mostly done by copilot automatically.
- **Best Practices for Better Answers:**
    - Start a new session (`+` icon) for a completely new topic to avoid "context drift" (confusing Copilot with past topics).
    - Include explicitly files, folders or even web URLs or images if you need Copilot specifically work on them, it saves copilot from searching your codebase (eventhough with indexed repository he is quite good at it)

---

## 🛠️ Hands-on Exercises

Let's put this theory into practice using the Playwright framework in this repository!

### Exercise 1: Inline Chat (`Ctrl + I` / `Cmd + I`)
1. Open `tests/login.spec.ts`.
2. Click anywhere inside the `successful login` test, or highlight it.
3. Press `Ctrl + I` (Windows/Linux) or `Cmd + I` (Mac) to open the Inline Chat prompt.
4. Type: `Add a comment explaining what the inventory page assertion does` and press Enter.
5. Review the differences and Accept the suggestion.

### Exercise 2: Explicit Context in Sidebar Chat
1. Open the Copilot Chat Sidebar (Activity Bar -> Chat icon).
2. We want to ask Copilot about the inventory page, even if we don't have the file currently open.
3. Type the following prompt: `What locators are defined in #file:inventory.page.ts?`
4. Notice how using the `#inventory.page.ts` variable forces Copilot to read exactly that file to answer your question accurately.

### Exercise 3: Terminal Context
1. Open a new Terminal in VS Code.
2. Run the test command: `npm run test`
3. Once it finishes, go to the Copilot Chat Sidebar and type: `Explain the output of #terminalLastCommand`. Copilot will analyze your exact terminal output to summarize the test results.

### Exercise 4: Semantic Search
1. Open the standard VS Code **Search** view (Activity Bar -> Magnifying glass icon).
2. Imagine you want to find where login validation happens, but you don't know the exact code syntax.
3. Instead of a normal search, type: `where do we check for locked out users`
4. Click the **Sparkles icon** (✨) or `Search with AI` to "Search with GitHub Copilot". Copilot will semantically understand your intent and point you to the `locked out user login` test in `login.spec.ts`.

### Exercise 5: Commit Message Generation
1. Open the **Source Control** view in the Activity Bar (the branch network icon).
2. You should have some modified files from the previous exercises. Click the `+` icon next to the files to **Stage** them.
3. In the message input box, click the **Sparkles icon** (✨) to *Generate Commit Message*.
4. Copilot will analyze the actual code diffs and generate a concise, accurate commit message for you automatically.
    - *Pro Tip:* You can customize the style of generated commit messages (e.g., to use Conventional Commits like `feat:` or `fix:`). 
        1. Open User Settings JSON (`Ctrl+Shift+P` -> **Preferences: Open User Settings (JSON)**).
        2. Add the custom commit messsage configuration e.g.: `"github.copilot.chat.commitMessageGeneration.instructions": [{"text": "Use conventional commit message format. Maximum 40 chars"}],`
