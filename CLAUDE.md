# ESP32-S3 Simulator — Agent Context

## Project
A Rhoades Institute of Technology project (https://rit-tech.org/, contact@rit-tech.org).
An in-browser 3D simulator for learning ESP32 microcontroller programming. Students write
real Python code (executed by Pyodide), wire up virtual components on a 3D workbench, and
see realistic visual feedback — with **zero hardware required**.

## Mission
Lower the barrier to embedded programming education. Anyone with a browser can learn ESP32
development without buying a board, installing toolchains, or setting up drivers. Built for
students, hobbyists, and educators who can't afford physical hardware.

## Stack
- **React 19** + **Vite 6**
- **React Three Fiber** + **drei** + **Three.js** (3D rendering, toon/cel-shaded)
- **Rapier** (physics — `@react-three/rapier`)
- **ecctrl** (FPS character controller)
- **Pyodide** (real Python / MicroPython execution in browser)
- **Monaco Editor** (in-browser code editor)
- **gh-pages** deploy → base path `/ESP32-S3-Simulator/`

## Key Files
- `src/main.jsx` — entry point
- `src/App.jsx` — main app with Canvas
- `src/Level.jsx` — the 3D world ⭐
- `src/CodingContext.jsx` — shared state for Python code & hardware
- `src/components/ESP32Board.jsx` — the board (must support multiple board profiles, see M11)
- `src/components/Breadboard.jsx` — connection board
- `src/components/ComponentLED.jsx`, `ComponentButton.jsx` — virtual hardware
- `src/components/Workbench.jsx` — clickable table that opens the editor
- `src/components/CodingOverlay.jsx` — Monaco editor UI
- `src/simulation/pyodide.worker.js` — Python execution worker
- `vite.config.js` — `base: '/ESP32-S3-Simulator/'` deploy invariant

## Source-of-Truth Docs
- `BEGINNERS_GUIDE.md` — learner-facing tour of the codebase
- `For Gemini.md` — authoritative technical architecture doc
- `docs/EDUCATIONAL_MISSION.md` — zero-hardware, zero-account policy
- `docs/SIMULATION_FIDELITY.md` — 1:1 MicroPython invariant
- `docs/ASSET_MODULARITY.md` — no hard-coded assets
- `docs/HARDWARE_FLASH_TARGET.md` — future flash-to-real-board path

## Clock-In Protocol (mandatory before any edits)
1. `tvn_clock_in` → memories + truth nodes + project info in one call
2. Read blockers, decisions, and the invariant docs in `docs/`
3. Use `tvn_get_relevant_files "your task"` for semantic search
4. Make edits
5. `tvn_manage_memory add` after each unit of work
6. `tvn_manage_memory clock_out` at session end → fill in debrief

## Memory Node Types
Always prefix content with a bold type:
- `**Decision:**` — chose A over B
- `**Blocker:**` — broken or unclear
- `**Status:**` — progress checkpoint
- `**Discovery:**` — future agents need this
- `**Plan:**` — design idea, not yet built
- `**Agent Lineage:**` — session handoff
- `**Debrief:**` — end-of-session summary

## Architecture Invariants (don't break these)
1. **Educational mission** — no paid accounts, no toolchains, no installs. Browser-only.
2. **1:1 MicroPython fidelity** — user's Python code must run unchanged on real hardware. Never simulator-only shortcuts.
3. **Asset modularity** — no hard-coded `.glb`/`.png`/etc. imports in component files. Use props or a manifest.
4. **Multi-board ready** — current generic ESP32-S3 is one profile of many. Real target hardware on hand is the **ESP32-S3-Sense**.
5. **Hardware flash path preserved** — every change must keep the future WebSerial flash feature possible.

## TVN Bridge Protocol

This project is governed by TVN Bridge. Read this before editing anything.
Section maintained by TVN — edit the prose around it, not the heading.

### 1. Clock in — required before any edit

Call **`tvn_clock_in`**. One call returns pinned memories, truth nodes,
project info, and your authorization status. Workflow constraints block
Edit/Write until you have clocked in.

### 2. Check your authorization

`tvn_clock_in` returns a `sudo` block. Act on its `state`:

| state | what it means | what to do |
|---|---|---|
| `active` | session valid, firewall hook sees it | nothing — proceed |
| `needs_arming` | a session IS active but the hook cannot see it yet | call **`tvn_get_session_token`** now, then proceed |
| `none` | no session granted | use `tvn_edit_file` for edits; ask your human if you need more |

**Only a human can grant a session.** Never run `tvn agent-session session
start` yourself — it is a security invariant and will be refused.

### 3. Editing

Use **`tvn_edit_file`** (MCP) rather than native Write/Edit. It creates a
backup in `.tvn/backups/`, records the change in the audit trail, and
preserves Smart Headers. Governed writes take the session token as
`confirmation_id`.

### 4. When a tool call is BLOCKED

**Do not retry the same command.** The block message names both the rule and
the remedy. The common cases:

- *Mentions SUDO* → call `tvn_get_session_token`, then retry.
- *File edit* → use `tvn_edit_file`.
- *Read outside the project* → reads are confined to the project tree by
  default. Ask your human to add the path to `[firewall] read_allowlist` in
  `.tvn/config.toml`.
- *Cross-project write* → needs SUDO in the **target** project; a session in
  this one will not clear it.
- *Security invariant* → never bypassable by anything. Stop and ask.

### 5. Record what you learned

Add a memory node per significant unit of work, with a bold type prefix:

```
tvn_manage_memory add "**Decision:** chose X over Y because ..."
```

Types: `**Decision:**` `**Blocker:**` `**Status:**` `**Discovery:**` `**Plan:**`

At session end call `tvn_manage_memory clock_out`, then submit a
`debrief`. **Do not write `**Agent Lineage:**` entries by hand** — TVN
numbers and records them for you.

### Quick reference

| you need | call |
|---|---|
| everything, at session start | `tvn_clock_in` |
| the SUDO token for a governed write | `tvn_get_session_token` |
| to edit a file | `tvn_edit_file` |
| files relevant to a topic | `tvn_get_relevant_files "topic"` |
| to search all memory | `tvn_search_memory "query"` |
| project invariants | `tvn_manage_truth_nodes list` |
| to record a finding | `tvn_manage_memory add "**Discovery:** ..."` |
