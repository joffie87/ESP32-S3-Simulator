# PRD Title Here

Brief description of what this PRD accomplishes. This becomes the `project_description`
field in tasks.json and is included in every Ralph agent's prompt.

---

## Task 1: Example Task

id: 1
depends_on: []
test_command: python -c "t=open('src/example.js',encoding='utf-8').read(); assert 'expectedString' in t, 'Missing expectedString in example.js'"
acceptance:
  - First acceptance criterion (make these specific and testable)
  - Second acceptance criterion
  - Third acceptance criterion

Free-form description of what the agent should do for this task.
Include context, constraints, and any gotchas the agent needs to know.

---

## Task 2: Task With Dependencies

id: 2
depends_on: [1]
test_command: python -c "import json; d=json.load(open('package.json')); assert 'name' in d, 'Missing name field'"
acceptance:
  - Criterion that proves this task is done
  - Another criterion

This task depends on Task 1 — it won't run until Task 1 passes.
Ralph resolves dependencies automatically via DAG ordering.

---

## Task 3: Final Rollup Task

id: 3
depends_on: [1, 2]
test_command: python -c "pass"
acceptance:
  - All prior tasks verified
  - No regressions introduced

Use a rollup task when you need a final verification after all other work.

---

<!-- RALPH PRD FORMAT REFERENCE
=============================================================

STRUCTURE:
  - H1 (#) = project title (exactly one)
  - Text before first --- = project description
  - ## Task N: Title = task header (N must be a digit)
  - --- = task separator (required between tasks)
  - Last task ends at EOF

REQUIRED PER TASK:
  - id: N              (unique integer)
  - depends_on: [...]  (list of task IDs, [] if none)

OPTIONAL PER TASK:
  - test_command: ...  (shell command, exit 0 = pass)
  - acceptance:        (bullet list with "  - " prefix)
  - description        (free-form text after metadata)

TEST COMMAND RULES (WINDOWS):
  - Ralph runs test commands through cmd.exe on Windows
  - NEVER use Unix tools: grep, sed, awk, find, cat, head, tail
  - ALWAYS use: python -c "..." with assertions
  - Pattern: python -c "t=open('file',encoding='utf-8').read(); assert 'expected' in t, 'error msg'"
  - For JSON: python -c "import json; d=json.load(open('file')); assert d['key']=='val'"
  - For file existence: python -c "import os; assert os.path.exists('path'), 'missing'"

COMPLETION SIGNAL:
  - Agents must emit <promise>COMPLETE</promise> to mark task done
  - This is configured in ralph.json (completion_signal field)

AUTO-MAINTENANCE TASK:
  - If promote_on_complete is true in ralph.json (default),
    Ralph auto-appends a final task to review and promote
    ralph-scoped memory nodes to main scope.

COMPILATION:
  - Run from dashboard Ralph page or API: POST /api/ralph/compile
  - PRD → tasks.json (preserves existing task state on recompile)
  - SHA256 hash tracks PRD changes

CONFIGURATION:
  - .tvn/ralph/ralph.json controls loop behavior
  - max_attempts_per_task: 3 (default)
  - test_timeout_seconds: 300 (default)
  - default_test_command: null (falls back to task-level)

============================================================= -->
