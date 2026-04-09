# Hardware Flash Target (Invariant)

## Vision
The same `.py` file that ran in the simulator can be flashed to a connected real ESP32 board
over WebSerial / WebUSB. The "demo moment" is:

> "Look — we made the LED blink in the game. Now look — same code, real hardware, real LED."

This is the convention demo payoff and the project's strongest sales pitch.

## Architecture Implication
This invariant constrains everything else. The Monaco editor produces a `.py` file. That single
artifact must be consumable by **two backends**:

```
                ┌────────────────────────────────┐
                │      Monaco Editor (.py)        │
                └───────────────┬────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
   ┌─────────────────────┐         ┌─────────────────────┐
   │  Pyodide Runtime    │         │  WebSerial Flash    │
   │  (in-browser sim)   │         │  Bridge (future)    │
   │                     │         │                     │
   │  Wraps GPIO/sensors │         │  ampy / mpremote    │
   │  with simulation    │         │  protocol over USB  │
   └─────────────────────┘         └─────────────────────┘
            │                                │
            ▼                                ▼
      Visual 3D LED                    Real LED on
       on workbench                    ESP32-S3-Sense
```

Both backends consume the **same source file unchanged**. The user does not edit, recompile,
or "export" anything between simulator and hardware.

## What This Means in Practice
- Don't transform user code before passing it to Pyodide. Never inject helpers, imports, or
  globals that wouldn't exist on the real chip. (Enforced by SIMULATION_FIDELITY.md.)
- The Pyodide hardware-sim layer must implement the **MicroPython** standard library subset,
  not invent its own.
- The eventual flash bridge will use WebSerial to talk to a real board (via ampy / mpremote /
  esptool protocols). When it lands, the user clicks "Flash to Hardware" and the same file
  goes to the connected board.
- Architecture decisions that entangle the runtime and the user's source (e.g. AST rewriting,
  bundling, transpiling) **must be rejected** — they break the flash path.

## Status
Not yet implemented. The simulator runs Pyodide today. The flash bridge is the next major
phase after multi-board support (Memory M11) lands.

## Target Demo Moment
A student writes:

```python
from machine import Pin
import time

led = Pin(2, Pin.OUT)
while True:
    led.on()
    time.sleep(0.5)
    led.off()
    time.sleep(0.5)
```

They run it in the simulator — the virtual LED blinks. They click "Flash to Hardware". The
real LED on a connected ESP32-S3-Sense blinks the same way. **No edits. Same file.**
