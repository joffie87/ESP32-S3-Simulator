import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.mjs'

let pyodide = null
const INPUT_STATES = new Array(40).fill(0)

function Pin(id, mode) {
  const pin = {
    id: id,
    mode: mode,
    _value: 0,

    value(val) {
      if (val !== undefined) {
        this._value = val
        self.postMessage({
          type: 'PIN_UPDATE',
          pin: this.id,
          value: val
        })
        return val
      }

      if (this.mode === Pin.IN) {
        return INPUT_STATES[this.id] || 0
      }

      return this._value
    },

    on() {
      this.value(1)
    },

    off() {
      this.value(0)
    }
  }

  return pin
}

Pin.OUT = 1
Pin.IN = 0
Pin.PULL_UP = 1
Pin.PULL_DOWN = 2

const MachineModule = {
  Pin: Pin,
  OUT: 1,
  IN: 0,
  PULL_UP: 1,
  PULL_DOWN: 2
}

function injectLoopSafety(code) {
  const lines = code.split('\n')
  const result = []
  let indentStack = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    const currentIndent = line.length - line.trimStart().length

    while (indentStack.length > 0 && currentIndent <= indentStack[indentStack.length - 1]) {
      indentStack.pop()
    }

    // Check if this is a loop statement
    const isWhileLoop = trimmed.startsWith('while ')
    const isForLoop = trimmed.startsWith('for ')

    if (isWhileLoop || isForLoop) {
      // Check if the loop body is on the same line (single-line loop)
      const colonIndex = line.indexOf(':')
      const hasBodyOnSameLine = colonIndex !== -1 && line.substring(colonIndex + 1).trim().length > 0

      if (hasBodyOnSameLine) {
        // Single-line loop: don't inject sleep, just pass through
        result.push(line)
      } else {
        // Multi-line loop: inject sleep on next line
        result.push(line)

        let nextIndent = currentIndent + 4
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1]
          const nextLineIndent = nextLine.length - nextLine.trimStart().length
          if (nextLineIndent > currentIndent) {
            nextIndent = nextLineIndent
          }
        }

        indentStack.push(currentIndent)
        result.push(' '.repeat(nextIndent) + 'await asyncio.sleep(0.02)')
      }
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

async function initializePyodide() {
  if (pyodide) return

  try {
    console.log('[Pyodide Worker] Starting initialization...')
    self.postMessage({ type: 'STATUS', status: 'loading' })

    console.log('[Pyodide Worker] Loading Pyodide from CDN...')
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/'
    })

    console.log('[Pyodide Worker] Pyodide loaded successfully')
    pyodide.registerJsModule('machine', MachineModule)

    console.log('[Pyodide Worker] Machine module registered')
    self.postMessage({ type: 'STATUS', status: 'ready' })
    console.log('[Pyodide Worker] Initialization complete')
  } catch (error) {
    console.error('[Pyodide Worker] Initialization failed:', error)
    self.postMessage({
      type: 'ERROR',
      error: `Failed to load Pyodide: ${error.message}`
    })
    self.postMessage({ type: 'STATUS', status: 'error' })
  }
}

self.onmessage = async (event) => {
  const { type, code, pin, value } = event.data

  if (type === 'INIT') {
    await initializePyodide()
    return
  }

  if (type === 'INPUT_UPDATE') {
    if (pin !== undefined && value !== undefined) {
      INPUT_STATES[pin] = value
      console.log(`Worker received INPUT_UPDATE: pin=${pin}, value=${value}`)
      console.log('INPUT_STATES:', INPUT_STATES)
    }
    return
  }

  if (type === 'RUN_CODE') {
    try {
      if (!pyodide) {
        await initializePyodide()
      }

      const captureStdout = pyodide.runPython(`
import io
import sys

class OutputCapture(io.StringIO):
    def write(self, text):
        super().write(text)
        return len(text)

capture = OutputCapture()
sys.stdout = capture
capture
      `)

      const processedCode = injectLoopSafety(code)

      const wrappedCode = `
import asyncio

async def __main__():
    try:
${processedCode.split('\n').map(line => '        ' + line).join('\n')}
    except asyncio.CancelledError:
        pass  # Gracefully handle stop button

asyncio.ensure_future(__main__())
      `

      await pyodide.runPythonAsync(wrappedCode)

      await new Promise(resolve => setTimeout(resolve, 100))

      const output = captureStdout.getvalue()

      pyodide.runPython('sys.stdout = sys.__stdout__')

      self.postMessage({
        type: 'OUTPUT',
        output: output
      })

      self.postMessage({ type: 'EXECUTION_COMPLETE' })

    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error.message
      })
    }
  }

  if (type === 'STOP') {
    if (pyodide) {
      try {
        await pyodide.runPythonAsync(`
import asyncio
for task in asyncio.all_tasks():
    task.cancel()
        `)
      } catch (e) {
      }
    }
    self.postMessage({ type: 'STOPPED' })
  }
}
