# Educational Mission (Invariant)

## Rule
Target audience is novice learners with no budget, no toolchain, and no installed software
beyond a web browser. Code clarity beats cleverness. Never introduce a dependency, feature,
or workflow that requires:
- A paid account
- A login of any kind
- An installed toolchain (no Node, no Python, no `idf.py`, no drivers)
- A specific operating system or piece of physical hardware (the simulator must work for someone with literally only a browser)

## Why
This is the entire reason the project exists. Anyone who can open a Chromebook can learn ESP32
programming. The moment we add a "just install X" or "just sign up for Y" step, we've lost the
audience this project was built for.

## How to Apply
Before adding any dependency, ask: "Does this require the user to install anything, sign up for
anything, or pay for anything?" If yes, find another way or don't ship the feature.

## Allowed
- Anything that runs entirely in a stock browser
- Anything bundled into the static `gh-pages` deploy
- Pyodide (it's a WASM bundle, no install)
- WebSerial / WebUSB (browser-native API, no install — see HARDWARE_FLASH_TARGET.md)

## Not Allowed
- Server-side execution
- Cloud APIs that require keys
- LLM API calls (OpenAI, Anthropic, etc.)
- Auth providers (Auth0, Firebase Auth)
- Payment processors (Stripe, etc.)
- Native binaries

## Enforcement
Constraint **C8** (`No paid/login dependencies in package.json`) blocks edits to `package.json`
that introduce known paid/login dependency names. If you need to add a borderline dependency,
discuss it first and update C8 explicitly.
