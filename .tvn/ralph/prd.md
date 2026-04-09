# ESP32-S3 Simulator — Compliance & Modernization Ralph Run

Bring the existing ESP32-S3 Simulator code into compliance with the project's
newly-installed TVN truth nodes, memory nodes, and constraints. Each task is
scoped, parallelizable where possible, and has an objective acceptance test
that runs on Windows via `python -c "..."` (no Unix tools).

Authoring context (for any agent that picks this up):
- Truth nodes (read before editing): `docs/EDUCATIONAL_MISSION.md`,
  `docs/SIMULATION_FIDELITY.md`, `docs/ASSET_MODULARITY.md`,
  `docs/HARDWARE_FLASH_TARGET.md`, `CLAUDE.md`, `PROJECT_CHARTER.md`.
- Pinned memories of note: M11 (Hardware target is variable), M13 (Asset
  modularity is mandatory), M14 (1:1 MicroPython fidelity), M15 (Hardware
  flash bridge plan), and Blocker M16 (Pyodide worker violates
  SIMULATION_FIDELITY).
- Active constraints: C8 (no paid/login deps in package.json) and C9-asset
  (no hard-coded asset imports in `src/components/**/*.jsx`).
- Hardware on hand: **ESP32-S3-Sense** (camera + mic + accelerometer + PSRAM).
  Current simulator only models a generic ESP32-S3.

Each task lists `cites:` so any future agent immediately understands WHY the
task exists and which invariant it enforces.

---

## Task 1: Board Profile System — scaffold + generic-esp32-s3 + esp32-s3-sense

id: 1
depends_on: []
test_command: python -c "import os; assert os.path.isdir('src/boardProfiles'), 'src/boardProfiles missing'; assert os.path.exists('src/boardProfiles/index.js'), 'index.js missing'; assert os.path.exists('src/boardProfiles/generic-esp32-s3.js'), 'generic-esp32-s3.js missing'; assert os.path.exists('src/boardProfiles/esp32-s3-sense.js'), 'esp32-s3-sense.js missing'; g=open('src/boardProfiles/generic-esp32-s3.js',encoding='utf-8').read(); assert 'pins' in g and 'peripherals' in g, 'generic profile missing pins/peripherals'; s=open('src/boardProfiles/esp32-s3-sense.js',encoding='utf-8').read(); assert 'camera' in s.lower() and 'psram' in s.lower(), 'sense profile missing camera/psram peripherals'; b=open('src/components/ESP32Board.jsx',encoding='utf-8').read(); assert 'boardProfile' in b or 'profile' in b, 'ESP32Board.jsx does not accept a profile prop'"
acceptance:
  - `src/boardProfiles/` directory exists with `index.js` registry
  - `generic-esp32-s3.js` profile exists, captures the *current* hard-coded layout (40 pins, GND on pins 1, 2, 38, 39, USB-C and reset/boot button positions, mounting hole positions, capacitor positions) — no behavior change for the default board
  - `esp32-s3-sense.js` profile exists with peripherals: `camera`, `microphone`, `accelerometer`, `psram`, plus its real ESP32-S3-Sense pin map
  - `src/components/ESP32Board.jsx` accepts a `boardProfile` prop and reads pin count, pin positions, ground-pin set, peripheral positions, and labels from the profile rather than hard-coding them
  - `src/components/Breadboard.jsx` continues to work unchanged but is parameterized so a profile can override `ROWS`, `COLS`, `PITCH` if needed (default = current values)
  - `src/CodingContext.jsx` default `placedComponents[0]` references a profile by id (e.g. `boardProfile: 'generic-esp32-s3'`) so the existing UI keeps working
  - `src/CodingContext.jsx` `calculatePinPosition()` for `case 'esp32'` reads pin offsets from the profile, not from a hard-coded `localOffset` formula

cites: Memory M11 (Hardware target is variable, not fixed), Memory M13 (Asset
modularity is mandatory), `docs/ASSET_MODULARITY.md`, Project Charter Goal
"Support multiple board profiles".

The current `ESP32Board.jsx` hard-codes pin counts (40), GND-pin indices, USB-C
position, reset/boot button positions, mounting hole positions, capacitor
positions, and the silver shielding box dimensions. Memory M11 says every one
of these must come from a board profile so adding the ESP32-S3-Sense (and
later DevKit-C, XIAO ESP32-S3, etc.) does not require touching component code.

A board profile must be a plain JS module exporting an object with at minimum:
`{ id, displayName, pins: [{ index, pinNumber, label, isGround, side, position }],
peripherals: [...], geometry: { pcbSize, mountingHoles, ... }, mesh: null }`.

The `mesh` field is intentionally null today (procedural geometry). When real
.glb models are commissioned later, they get added to the profile, NEVER
imported inside `src/components/**/*.jsx` (constraint C9-asset would block
that anyway).

Do NOT touch `src/simulation/pyodide.worker.js` as part of this task —
profiles describe hardware, not the runtime. That's task 3.

---

## Task 2: Asset Manifest scaffold

id: 2
depends_on: []
test_command: python -c "import os,glob; assert os.path.isdir('src/assets'), 'src/assets missing'; assert os.path.exists('src/assets/manifest.js'), 'src/assets/manifest.js missing'; m=open('src/assets/manifest.js',encoding='utf-8').read(); assert 'export' in m, 'manifest has no exports'; exts=('.glb','.gltf','.fbx','.obj','.stl','.dae','.png','.jpg','.jpeg','.webp','.gif','.mp3','.wav','.ogg','.flac'); offenders=[(p,L.strip()) for p in glob.glob('src/components/**/*.jsx',recursive=True) for L in open(p,encoding='utf-8') if L.lstrip().startswith('import') and any(e in L.lower() for e in exts)]; assert not offenders, 'asset imports leaked into components: '+str(offenders)"
acceptance:
  - `src/assets/` directory exists
  - `src/assets/manifest.js` exists and exports a registry object (e.g. `export const assetManifest = { boards: {}, components: {}, sounds: {} }`) — empty/placeholder entries are fine, this is scaffolding
  - No file matching `src/components/**/*.jsx` contains a hard-coded import of any `.glb`, `.gltf`, `.fbx`, `.obj`, `.stl`, `.dae`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.mp3`, `.wav`, `.ogg`, or `.flac` file (constraint C9-asset already enforces this on new edits — this task verifies the existing tree is clean and adds the manifest as the future home for those imports)
  - `docs/ASSET_MODULARITY.md` is referenced in a top-of-file comment in `src/assets/manifest.js`

cites: `docs/ASSET_MODULARITY.md` (truth node), Memory M13, constraint C9-asset.

Audit findings as of 2026-04-09: there are currently zero hard-coded asset
imports in `src/components/**/*.jsx` — all geometry is procedural (RoundedBox,
boxGeometry, cylinderGeometry, sphereGeometry). This task is therefore mostly
*scaffolding for the future*: stand up the manifest module, document the
allowed locations, and verify the current tree is clean so the moment
commissioned art arrives there is one obvious place to put it.

---

## Task 3: Pyodide Hardware-Sim Audit & Source-Preservation Fix

id: 3
depends_on: []
test_command: python -c "t=open('src/simulation/pyodide.worker.js',encoding='utf-8').read(); assert 'injectLoopSafety' not in t or '# DEPRECATED' in t or 'export function injectLoopSafety' not in t, 'injectLoopSafety still rewriting user source'; assert 'await asyncio.sleep(0.02)' not in t, 'still injecting asyncio.sleep into user code'; assert 'async def __main__' not in t or 'EXEC_WRAPPER_OK' in t, 'still wrapping user source in async def __main__ without justification'; import os; assert os.path.exists('docs/PYODIDE_AUDIT.md'), 'audit report missing at docs/PYODIDE_AUDIT.md'"
acceptance:
  - `src/simulation/pyodide.worker.js` no longer rewrites the user's Python source via `injectLoopSafety`
  - `src/simulation/pyodide.worker.js` no longer wraps the user's source inside `async def __main__():` unless an inline justification comment `EXEC_WRAPPER_OK` documents an alternative cooperative-yielding strategy that is invisible to the user's `.py` file
  - User-side `time.sleep(x)` calls work without modifying the user's source (e.g. by registering a Pyodide JS-backed `time` module that yields the event loop internally — the *runtime* yields, not the *source*)
  - `src/CodingContext.jsx` is reviewed: confirmed nothing wraps, transforms, or injects globals into `code` before it reaches the worker — file `**Discovery:**` memory if anything is found
  - A new file `docs/PYODIDE_AUDIT.md` documents: which user-source transformations existed, which were removed, and the new approach for cooperative yielding
  - Adding the canary file from Task 8 (`examples/blink.py`) and running it through the simulator produces the same output as it would on a real ESP32-S3 (LED blinks once per 500 ms)

cites: `docs/SIMULATION_FIDELITY.md`, `docs/HARDWARE_FLASH_TARGET.md`, Memory
M14 (1:1 MicroPython fidelity is non-negotiable), Memory M15 (hardware flash
bridge plan), **Blocker memory M16** (Pyodide worker violates
SIMULATION_FIDELITY in three documented ways).

Concrete violations to remove (current state, lines from blocker M16):
1. `injectLoopSafety()` at lines ~66-115: walks the user's code line-by-line
   and injects `await asyncio.sleep(0.02)` into every multi-line `while`/`for`
   loop body. Real MicroPython code with bare `while True: led.on()` does
   not need this and would not survive the rewrite if flashed.
2. `wrappedCode` at lines ~185-195: wraps everything in
   `async def __main__()` and `asyncio.ensure_future(...)`. The user's source
   is now executing inside an event loop, which changes blocking semantics
   (`time.sleep`) and import availability.
3. The registered `machine` JsModule is a stub. See Task 4 for the full
   inventory of what's missing.

The fix path (do NOT skip steps):
- Replace the source-rewriting approach with a cooperative-yielding strategy
  baked into the simulator's `time` and `machine` modules. For example,
  `time.sleep(0.5)` can be implemented as a JS-backed function that
  internally yields control to the worker's message loop without altering
  the user's source.
- If `asyncio` event-loop integration is required for some APIs, isolate it
  to the runtime layer; the user's `.py` file must remain a normal,
  flashable MicroPython script.
- After the fix, manually verify that `examples/blink.py` (Task 8) runs
  without modification.

---

## Task 4: MicroPython API Surface Inventory

id: 4
depends_on: []
test_command: python -c "import os; p='docs/MICROPYTHON_API_COVERAGE.md'; assert os.path.exists(p), 'coverage doc missing'; t=open(p,encoding='utf-8').read(); req=['machine.Pin','time.sleep','time.sleep_ms','machine.PWM','machine.ADC','machine.I2C','machine.SPI','machine.UART','machine.Timer','machine.RTC','network.WLAN','esp32','neopixel','Supported','Stubbed','Missing']; missing=[x for x in req if x not in t]; assert not missing, 'coverage doc missing required entries: '+str(missing)"
acceptance:
  - `docs/MICROPYTHON_API_COVERAGE.md` exists
  - The doc has three sections — `## Supported (1:1 with real MicroPython)`, `## Stubbed (in-sim shim, may diverge)`, `## Missing` — each as a checklist or table
  - At minimum these symbols are categorized: `machine.Pin` (`value`, `on`, `off`, `irq`, `init`, `Pin.IN`, `Pin.OUT`, `Pin.PULL_UP`, `Pin.PULL_DOWN`), `machine.Signal`, `machine.PWM`, `machine.ADC`, `machine.DAC`, `machine.I2C`, `machine.SPI`, `machine.UART`, `machine.Timer`, `machine.RTC`, `time.sleep`, `time.sleep_ms`, `time.sleep_us`, `time.ticks_ms`, `time.ticks_diff`, `network.WLAN`, `esp32` module (RMT, NVS, deepsleep, wake_on_*), `neopixel.NeoPixel`, `bluetooth.BLE`
  - For each ESP32-S3-Sense peripheral, the doc lists the corresponding MicroPython API: camera (esp32-camera or `camera` module), I2S microphone, accelerometer over I2C
  - Each Missing entry has a one-line note on priority (HIGH for things needed by the convention demo, MEDIUM for common student use, LOW for edge cases)
  - The doc cites `docs/SIMULATION_FIDELITY.md` and links Blocker memory M16

cites: `docs/SIMULATION_FIDELITY.md`, Memory M14, Blocker memory M16.

This is a documentation-only task — no code changes. Its purpose is to give
future agents a single page that answers "does API X work in the simulator
today?" without grepping. Use the source of truth at
https://docs.micropython.org/en/latest/library/machine.html to seed the list,
then check `src/simulation/pyodide.worker.js` and `src/CodingContext.jsx` for
each symbol and categorize it.

Do NOT implement missing APIs in this task. That's a separate effort that
will be planned once this inventory exists.

---

## Task 5: Doc Sync — BEGINNERS_GUIDE.md and "For Gemini.md"

id: 5
depends_on: []
test_command: python -c "import os,glob; bg=open('BEGINNERS_GUIDE.md',encoding='utf-8').read(); fg=open('For Gemini.md',encoding='utf-8').read(); required=['FPSCharacterController','PlacementManager','Wire.jsx','Draggable','GameMenu','Inventory','MobileControls','ScreenRecorder','Tutorial','useGamepad']; missing_bg=[r for r in required if r not in bg]; missing_fg=[r for r in required if r not in fg]; assert not missing_bg, 'BEGINNERS_GUIDE.md still missing references to: '+str(missing_bg); assert not missing_fg, 'For Gemini.md still missing references to: '+str(missing_fg); src_files=set(os.path.basename(p) for p in glob.glob('src/components/*.jsx')); refs=[f for f in src_files if f in bg or f in fg]; assert len(refs)>=10, 'Docs reference too few component files (expected >=10, got '+str(len(refs))+')'"
acceptance:
  - `BEGINNERS_GUIDE.md` "File Structure" section lists every file currently in `src/` and `src/components/` (verified against `glob.glob('src/**/*.jsx')`)
  - `BEGINNERS_GUIDE.md` mentions: `FPSCharacterController.jsx`, `PlacementManager.jsx`, `Wire.jsx`, `Draggable.jsx`, `GameMenu.jsx`, `Inventory.jsx`, `MobileControls.jsx`, `ScreenRecorder.jsx`, `Tutorial.jsx`, `hooks/useGamepad.jsx`
  - "For Gemini.md" mentions all of the above and accurately describes the current pub/sub pattern in `src/CodingContext.jsx` (`pinStatesRef`, `subscribeToPinStates`, `hoveredPinInfoRef`, `subscribeToHoverInfo`)
  - "For Gemini.md" reflects the current Pyodide worker after Task 3 lands (no source rewriting, cooperative yield strategy) — re-read after Task 3 if it has merged first
  - Any architectural claim in either doc that no longer matches the code is either updated or filed as a `**Blocker:**` memory node with a precise file:line reference
  - Both documents reference `PROJECT_CHARTER.md` as the canonical mission/goals doc

cites: Memory M10 (Source-of-truth docs), `CLAUDE.md` "Source-of-Truth Docs" section.

Both docs are truth nodes. Future agents will be reading them on every clock-in,
so any drift between docs and code becomes a cascading source of bad context.

---

## Task 6: Hardware Flash Bridge — Design Spike (no implementation)

id: 6
depends_on: []
test_command: python -c "import os; p='docs/FLASH_BRIDGE_DESIGN.md'; assert os.path.exists(p), 'design doc missing'; t=open(p,encoding='utf-8').read(); req=['WebSerial','mpremote','ampy','CodingOverlay','Pyodide','same .py','user gesture','permission']; missing=[r for r in req if r not in t]; assert not missing, 'FLASH_BRIDGE_DESIGN.md missing required topics: '+str(missing)"
acceptance:
  - `docs/FLASH_BRIDGE_DESIGN.md` exists
  - The doc covers, at minimum: WebSerial API surface (`navigator.serial.requestPort`, `port.open`, `readable`/`writable` streams, the user-gesture/permission requirement), the chosen MicroPython file-transfer protocol (mpremote raw-REPL vs ampy), how `.py` files are sent to the board, how stdout/REPL output flows back to the UI
  - The doc places a "Flash to Hardware" button concretely — name the file (e.g. `src/components/CodingOverlay.jsx`) and describe the UI affordance (button label, disabled state when no port selected, success/error toast)
  - The doc explains how the same `.py` source is routed to either the Pyodide runtime OR the WebSerial flash bridge based on user action — emphasizing that the source is **never modified** between the two paths (this is the hard invariant from `docs/HARDWARE_FLASH_TARGET.md`)
  - The doc lists which board profiles from Task 1 will be flashable on day 1 (recommend: `esp32-s3-sense` only, since that's the hardware on hand)
  - The doc notes that this feature requires zero installs / accounts / paid services (validates against `docs/EDUCATIONAL_MISSION.md`)

cites: `docs/HARDWARE_FLASH_TARGET.md`, Memory M14 (1:1 fidelity), Memory M15 (flash bridge plan), `docs/EDUCATIONAL_MISSION.md`.

Do NOT implement the bridge. This task only produces a design doc that the
next major Ralph run (post-multi-board) will execute.

---

## Task 7: Educational Mission Audit (package.json + import scan)

id: 7
depends_on: []
test_command: python -c "import json,os; pj=json.load(open('package.json')); deps={}; deps.update(pj.get('dependencies',{})); deps.update(pj.get('devDependencies',{})); banned=('stripe','auth0','firebase-auth','openai','anthropic','cohere-ai','replicate'); hits=[d for d in deps if any(b in d.lower() for b in banned)]; assert not hits, 'package.json contains banned account/paid dep: '+str(hits); assert os.path.exists('docs/EDU_MISSION_AUDIT.md'), 'agent must produce docs/EDU_MISSION_AUDIT.md'; t=open('docs/EDU_MISSION_AUDIT.md',encoding='utf-8').read(); req=('Dependencies','External URLs','BROWSER-NATIVE','CDN','ACCOUNT-REQUIRED','EDUCATIONAL_MISSION'); missing=[r for r in req if r not in t]; assert not missing, 'audit doc missing required sections/labels: '+str(missing); assert 'ACCOUNT-REQUIRED' in t, 'audit doc must define ACCOUNT-REQUIRED label even if empty'"
acceptance:
  - `package.json` contains zero dependencies that match the banned-pattern list (Stripe, Auth0, Firebase Auth, OpenAI, Anthropic, Cohere, Replicate, etc.)
  - `docs/EDU_MISSION_AUDIT.md` is generated and lists every dependency in the project plus every external URL referenced from `src/**/*.js{,x}` outside the allowlist
  - For each external URL flagged outside the allowlist, the audit doc has a short note (one line) classifying it as: BROWSER-NATIVE (no install), CDN (no install, no account), ACCOUNT-REQUIRED (violation — file Blocker), or DOCS-LINK (informational)
  - Constraint C8 in the constraints list is reviewed and any obvious gaps in its `forbidden_patterns` regex are noted in the audit doc (do NOT modify C8 in this task — discuss in debrief)
  - Zero ACCOUNT-REQUIRED entries in the final audit (if any are found, the task remains incomplete and a `**Blocker:**` memory node must be filed)

cites: `docs/EDUCATIONAL_MISSION.md`, constraint C8 (No paid/login dependencies in package.json).

Constraint C8 already blocks the obvious offenders on new edits. This audit
catches the subtle ones — e.g. a transitive dep, a CDN-loaded SDK that
silently calls home, or a `fetch('https://...')` somewhere in `src/` that
points to a service requiring an API key.

---

## Task 8: Convention Demo Smoke Test — examples/blink.py

id: 8
depends_on: [3]
test_command: python -c "import os; p='examples/blink.py'; assert os.path.exists(p), 'examples/blink.py missing'; src=open(p,encoding='utf-8').read(); req=['from machine import Pin','import time','Pin.OUT','time.sleep','while True']; missing=[r for r in req if r not in src]; assert not missing, 'blink.py missing real-MicroPython idioms: '+str(missing); banned=['esp32_sim','await ','async def','asyncio','simulator_only','# sim:']; bad=[b for b in banned if b in src]; assert not bad, 'blink.py contains simulator-only constructs: '+str(bad); import os; assert os.path.exists('examples/README.md'), 'examples/README.md missing'"
acceptance:
  - `examples/blink.py` exists and contains the canonical ESP32 blink program — `from machine import Pin; import time; led = Pin(2, Pin.OUT); while True: led.on(); time.sleep(0.5); led.off(); time.sleep(0.5)`
  - `examples/blink.py` contains zero simulator-only constructs: no `await`, no `async def`, no `asyncio` import, no `import esp32_sim`, no comments hinting at sim shortcuts (`# sim:`, `simulator_only`, etc.)
  - `examples/README.md` exists and explains: this is the convention-demo regression canary; if it ever stops working without modification, the simulation fidelity invariant has been broken
  - The file successfully runs in the simulator after Task 3 lands (manual verification; document the manual test step in `examples/README.md`)
  - The file would run unchanged on a real ESP32-S3 if flashed (manual verification when Task 6's design ships into Ralph round 2)

cites: `docs/SIMULATION_FIDELITY.md`, `docs/HARDWARE_FLASH_TARGET.md`, Memory M14, Memory M15, Blocker M16.

This task depends on Task 3 because the current Pyodide worker would mangle
this file (`while True:` would get an `await asyncio.sleep(0.02)` injected
into it, which is exactly the violation Task 3 fixes). The file is the
"demo moment" payoff — if it ever needs special-casing to work in the
simulator, the project has failed its core invariant.

---

## Task 9: Compliance Rollup — verification + memory promotion

id: 9
depends_on: [1, 2, 3, 4, 5, 6, 7, 8]
test_command: python -c "import os; required=['src/boardProfiles/index.js','src/boardProfiles/generic-esp32-s3.js','src/boardProfiles/esp32-s3-sense.js','src/assets/manifest.js','docs/PYODIDE_AUDIT.md','docs/MICROPYTHON_API_COVERAGE.md','docs/FLASH_BRIDGE_DESIGN.md','docs/EDU_MISSION_AUDIT.md','examples/blink.py','examples/README.md']; missing=[r for r in required if not os.path.exists(r)]; assert not missing, 'rollup found missing artifacts: '+str(missing)"
acceptance:
  - All artifacts from tasks 1-8 exist on disk at the expected paths
  - No regressions: `src/components/**/*.jsx` still passes the constraint C9-asset check (no hard-coded asset imports)
  - No regressions: `package.json` still passes the constraint C8 check (no banned deps)
  - A `**Status:**` memory node is added summarizing what compliance items shipped and what still remains for the next Ralph run

cites: All prior tasks, all listed truth nodes, Memory M11/M13/M14/M15/M16.

Final verification task. If anything is missing, the corresponding earlier task
should be re-run rather than patching here.

---
