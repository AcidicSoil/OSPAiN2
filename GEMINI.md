# GEMINI.md — Configuration directives for gemini-cli

## 1. 🎯 Purpose
These directives define how Gemini CLI should behave in this codebase—what tools to use, what style to follow, and how to structure outputs. They override default behavior by providing explicit, project-level norms.

---

## 2. 🔧 Tool Usage
- **File lookup**: Do **not** use `glob` for name-based searches. Always use `rg --files` via `run_shell_command` for locating files.
- **Content search**: Use `rg <pattern>` (ripgrep) via `run_shell_command`.
- **Web grounding**: When needing external context, use the built-in `GoogleSearch` tool. Avoid output-only summarization: cite URLs when relevant.
- **Shell execution**: Gemini may propose shell commands; use `/yolo true` only if explicitly permitted. Default behavior: prompt me first.

---

## 3. 📚 Context and Memory
- Always include **README.md**, **ROADMAP.md**, and this **GEMINI.md** in the initial context load.
- Support nested contexts: if you reference `@path/to/defs.md`, auto-include it only if not inside a code block.
- For task-specific context, support an optional `task.md` via CLI: e.g., `gemini --addition_context=task.md`.

---

## 4. 🧠 Reasoning & ReAct Loop
- Use a full Reason-and-Act loop:
  - **Reason**: Clearly outline your plan in bullet steps.
  - **Act**: Execute one tool/action, then repeat: reason → act → repeat.
- Summarize results before proceeding to the next action.
- Do not batch multiple file edits or searches in a single step.

---

## 5. 🏗️ Code Style and Structure
- When generating or modifying code:
  - Follow project’s coding standards.
  - Insert comments **sparingly**, focusing on “why” not “what” :contentReference[oaicite:1]{index=1}.
  - Prefer JS/TS + React (Bootstrap or Material) for front‑end; Node.js + Express or Python + FastAPI for back‑end. :contentReference[oaicite:2]{index=2}
- Split large diffs into logically coherent commits.

---

## 6. ✅ Testing & Quality
- Autogenerate or improve tests using `pytest` or framework-appropriate test suite.
- Provide a test plan: list files, functions, test cases.
- After edits/tests, run CI/test runner; summarize success/errors.

---

## 7. 🗣️ Communication & Logging
- Briefly summarize each session’s goal at start and end.
- For pull request reviews:
  - Use `/review` mode.
  - Provide summary, highlight changed files, list suggestions.
- Always ask before performing irreversible tasks (delete files, force-push).

---

## 8. ⚙️ Config & Environment
- Expect `.env` or `settings.json` to provide API keys, model preferences.
- CLI must respect `--model`, `--prompt`, `--sandbox`, `--debug`, and `--yolo` flags per invocation. :contentReference[oaicite:3]{index=3}
- Default to `gemini-2.5-pro` if no model specified; fall back to `flash` only on quota limits. :contentReference[oaicite:4]{index=4}

---

## 9. 🧩 Session Behavior
- Gemini combines **all GEMINI.md** files discovered up to repo root. Local overrides global. :contentReference[oaicite:5]{index=5}
- If multiple directives contradict, the most deeply nested (closest to working directory) wins.

---

## 10. 🛡️ Safety & Permissions
- Never run file modifications without explicit permission. Provide diffs before writing.
- Sandbox mode should be used by default unless explicitly disabled.
- Respect `.gitignore` and project conventions when searching or modifying code. :contentReference[oaicite:6]{index=6}

---

## 🏁 Summary
These directives will guide gemini-cli to:
1. Follow project norms for tools, style, tests.
2. Use structured, step‑by‑step Reason‑Act loops.
3. Prompt for safety and break changes into logical units.
4. Load context consistently from this and related `.md` files.

---

# End of GEMINI.md
