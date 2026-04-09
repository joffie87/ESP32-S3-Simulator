# Simulation Fidelity (Invariant)

## Rule
The user's code, language, syntax, and hardware API surface must be **1:1 with real ESP32
MicroPython**. The Python a student writes in the simulator must run **unchanged** on a real
ESP32 board. Never introduce simulator-only shortcuts, fake imports, simplified APIs, or
"convenience" wrappers that don't exist in real MicroPython.

## What the Simulator Simulates
The simulator wraps the **hardware side**:
- GPIO pin state (HIGH/LOW)
- Peripheral responses (sensors, LEDs, buttons)
- Timing approximations
- Visual feedback for the above

## What the Simulator Does NOT Simulate
- The Python language itself (Pyodide runs real Python)
- The user's code (it runs as written)
- The MicroPython API surface (we don't replace `from machine import Pin`; we make it work)

## Why
Two reasons:
1. **Educational value.** A student who learns "fake MicroPython" has to relearn everything when
   they get real hardware. The simulator's worth depends on transferability.
2. **Hardware flash target (see HARDWARE_FLASH_TARGET.md).** The future WebSerial flashing
   feature only works if the user's `.py` file is already valid MicroPython for the real chip.
   Any simulator-only convention breaks that path.

## How to Apply
- If a feature would require modifying the user's code to work in-sim, it's the wrong design
- If you find yourself writing `import esp32_sim` in the user's example code, stop
- The right place to "make things work" is the hardware-bridge layer that wraps Pyodide, not the
  user's source file
- The MicroPython API surface (`machine`, `time`, `network`, `esp32`, etc.) should be
  implemented as faithfully as possible, not abbreviated

## Test Question
"If I copy this `.py` file from the simulator, install it on a real ESP32-S3, and run it — does
it do the same thing?" If no, the design is wrong.
