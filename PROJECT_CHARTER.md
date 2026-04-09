# ESP32-S3 Simulator — Project Charter

**Organization:** Rhoades Institute of Technology (https://rit-tech.org/)
**Contact:** contact@rit-tech.org
**Lead:** Johnathon Rhoades
**Created:** 2026-01-06
**Charter Filled:** 2026-04-09
**Language:** JavaScript / JSX
**Stack:** React 19 + React Three Fiber + Rapier + Pyodide + Monaco

## Mission
Lower the barrier to embedded systems education. Build a 3D, in-browser ESP32 microcontroller
simulator that lets anyone learn real microcontroller programming with zero hardware, zero
toolchain installs, and zero paid accounts. Students write actual MicroPython code, wire up
virtual components on a 3D workbench, and see realistic feedback — exactly as they would on a
real board.

## Goals
- Run a complete ESP32-S3 development workflow entirely in a web browser
- Execute real (not faked) Python code via Pyodide against simulated hardware
- Support multiple board profiles (generic ESP32-S3 today, **ESP32-S3-Sense** as the realistic target, more over time)
- Keep all visual assets swappable so commissioned art can replace placeholders without rewrites
- Eventually flash the *same* user code to a connected real ESP32 board via WebSerial — the convention demo payoff

## Success Criteria
- A student with no hardware can write, test, and visually verify a working ESP32 program in under 10 minutes
- The exact same `.py` file the student wrote in the simulator runs unchanged when flashed to real hardware
- The simulator supports at least 3 board profiles by the time of the public release
- Adding a new board profile requires no changes to component code — only a new profile file
- Asset upgrades (placeholder geometry → real models) require no logic changes — only manifest updates

## Target Audience
- Students learning embedded programming
- Hobbyists who can't afford or access physical boards
- Educators teaching microcontroller concepts in classrooms without hardware budgets

## Non-Goals
- Not a firmware emulator (we don't simulate the ESP32 silicon at the instruction level)
- Not a replacement for real hardware experience — a *bridge* to it
- Not a code playground — the user's code must be valid MicroPython for a real chip

## Convention Demo Target
"Look — we made the LED blink in the game. Now look — same code, real hardware, real LED."
