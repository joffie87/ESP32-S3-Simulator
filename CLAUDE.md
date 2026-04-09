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
