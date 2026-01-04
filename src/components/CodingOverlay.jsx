import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useCoding } from '../CodingContext'

// --- THE EXAMPLE LIBRARY ---
const EXAMPLES = {
  '1. Basic Blink': `# The "Hello World" of Electronics
from machine import Pin
import time

led = Pin(2, Pin.OUT)

print("Starting Blink Sequence...")

while True:
    led.on()
    time.sleep(0.5)
    led.off()
    time.sleep(0.5)
`,
  '2. Button Switch': `# Control an LED with a Button
from machine import Pin
import time

led = Pin(2, Pin.OUT)
btn = Pin(0, Pin.IN) # Pin 0 is the Button

print("System Ready. Press the button.")

while True:
    if btn.value() == 1:
        led.on()
    else:
        led.off()
    time.sleep(0.05) # Small delay for stability
`,
  '3. SOS Distress Signal': `# S.O.S. Pattern
from machine import Pin
import time

led = Pin(2, Pin.OUT)

def flash(duration):
    led.on()
    time.sleep(duration)
    led.off()
    time.sleep(0.2)

while True:
    # S (...)
    for i in range(3): flash(0.2)
    time.sleep(0.5)
    
    # O (---)
    for i in range(3): flash(0.6)
    time.sleep(0.5)
    
    # S (...)
    for i in range(3): flash(0.2)
    
    time.sleep(2) # Pause before repeating
`
}

export default function CodingOverlay({ isVisible, onClose }) {
  const { pinStatesRef, setPinStates, subscribeToPinStates, workerRef } = useCoding()
  const [pinStates, setPinStatesLocal] = useState({})
  const [code, setCode] = useState(EXAMPLES['1. Basic Blink'])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(true)
  const [splitPosition, setSplitPosition] = useState(50) // Percentage for left panel
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // For mobile sidebar toggle
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef(null)
  const containerRef = useRef(null)

  // Subscribe to pin state changes for display
  useEffect(() => {
    const updatePinStates = () => {
      setPinStatesLocal({ ...pinStatesRef.current })
    }

    // Initial state
    updatePinStates()

    // Subscribe to updates
    return subscribeToPinStates(updatePinStates)
  }, [pinStatesRef, subscribeToPinStates])

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // --- WORKER SETUP (Identical to before) ---
  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../simulation/pyodide.worker.js', import.meta.url),
        { type: 'module' }
      )
      
      workerRef.current.onmessage = (event) => {
        const { type, status, output: workerOutput, error, pin, value } = event.data
        if (type === 'STATUS' && status === 'ready') {
          setLoading(false)
          setOutput(prev => prev + '> System Ready.\n')
        } else if (type === 'STATUS' && status === 'error') {
          setLoading(false)
          setOutput(prev => prev + '\n[FATAL ERROR]: Pyodide failed to load. Check console for details.\n')
        } else if (type === 'OUTPUT') {
          setOutput((prev) => prev + workerOutput)
        } else if (type === 'ERROR') {
          setOutput((prev) => prev + '\n[ERROR]: ' + error + '\n')
        } else if (type === 'PIN_UPDATE') {
          setPinStates((prev) => ({ ...prev, [pin]: value }))
        }
      }
      workerRef.current.postMessage({ type: 'INIT' })
    }
  }, [setPinStates])

  // --- FILE OPERATIONS ---
  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'main.py' // ESP32 convention
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadTrigger = () => {
    fileInputRef.current.click()
  }

  const handleFileLoad = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setCode(e.target.result)
    reader.readAsText(file)
  }

  const loadExample = (key) => {
    if (confirm("Replace current code with example? Unsaved changes will be lost.")) {
      setCode(EXAMPLES[key])
    }
  }

  const runCode = () => {
    if (loading) return
    setOutput('> Executing script...\n')
    setPinStates({})
    workerRef.current.postMessage({ type: 'RUN_CODE', code })
  }

  const stopCode = () => {
    workerRef.current.postMessage({ type: 'STOP' })
    setOutput(prev => prev + '\n> Execution Halted by User.\n')
  }

  // --- RESIZE HANDLERS ---
  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const sidebarWidth = 250 // Sidebar width in pixels
    const availableWidth = containerRect.width - sidebarWidth
    const mouseX = e.clientX - containerRect.left - sidebarWidth

    const newSplitPosition = (mouseX / availableWidth) * 100
    setSplitPosition(Math.max(20, Math.min(80, newSplitPosition))) // Clamp between 20% and 80%
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  if (!isVisible) return null

  // --- STYLES ---
  const styles = {
    container: {
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#1e1e1e', zIndex: 2000, display: 'flex',
      color: '#d4d4d4', fontFamily: 'monospace',
      flexDirection: isMobile ? 'column' : 'row'
    },
    sidebar: {
      width: isMobile ? '100%' : '250px',
      backgroundColor: '#252526',
      display: isMobile && !sidebarOpen ? 'none' : 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #333',
      position: isMobile ? 'absolute' : 'relative',
      zIndex: isMobile ? 3000 : 'auto',
      height: isMobile ? '100%' : 'auto',
      overflowY: 'auto'
    },
    sidebarHeader: {
      padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #333',
      color: '#fff', backgroundColor: '#333333'
    },
    sidebarItem: {
      padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #2d2d2d',
      color: '#cccccc', fontSize: '13px'
    },
    sidebarSection: {
      padding: '10px', fontSize: '11px', textTransform: 'uppercase', color: '#666', marginTop: '10px'
    },
    mainContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100%',
      overflow: 'hidden'
    },
    editorPanel: {
      width: isMobile ? '100%' : `${splitPosition}%`,
      height: isMobile ? '50%' : '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e'
    },
    toolbar: {
      minHeight: '50px',
      backgroundColor: '#333333',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '8px' : '0 15px',
      borderBottom: '1px solid #1e1e1e',
      justifyContent: 'space-between',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '8px' : '0'
    },
    btn: {
      padding: isMobile ? '10px 16px' : '6px 14px',
      borderRadius: '3px',
      border: 'none',
      cursor: 'pointer',
      marginRight: isMobile ? '0' : '10px',
      fontSize: isMobile ? '14px' : '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    },
    divider: {
      width: isMobile ? '100%' : '4px',
      height: isMobile ? '4px' : 'auto',
      backgroundColor: '#333',
      cursor: isMobile ? 'row-resize' : 'col-resize',
      userSelect: 'none',
      transition: isDragging ? 'none' : 'background-color 0.2s',
      display: isMobile ? 'none' : 'block'
    },
    outputPanel: {
      width: isMobile ? '100%' : `${100 - splitPosition}%`,
      height: isMobile ? '50%' : '100%',
      backgroundColor: '#111',
      padding: isMobile ? '8px' : '10px',
      overflowY: 'auto',
      fontSize: isMobile ? '11px' : '13px',
      fontFamily: '"Consolas", monospace',
      display: 'flex',
      flexDirection: 'column'
    },
    menuButton: {
      padding: '8px 12px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  }

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".py,.txt"
        onChange={handleFileLoad}
      />

      {/* --- SIDEBAR --- */}
      <div style={styles.sidebar}>
        <div style={{...styles.sidebarHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>RIT // TERMINAL</span>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0 8px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={styles.sidebarSection}>Project Files</div>
        <div style={styles.sidebarItem} onClick={handleSave}>💾 Save to Disk</div>
        <div style={styles.sidebarItem} onClick={handleLoadTrigger}>📂 Load from Disk</div>

        <div style={styles.sidebarSection}>Training Modules</div>
        {Object.keys(EXAMPLES).map(key => (
          <div
            key={key}
            style={{...styles.sidebarItem, color: '#4CAF50'}}
            onClick={() => loadExample(key)}
          >
            📝 {key}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div
            style={{ ...styles.sidebarItem, backgroundColor: '#b71c1c', color: 'white' }}
            onClick={onClose}
        >
          EXIT TERMINAL (ESC)
        </div>
      </div>

      {/* --- MAIN SPLIT VIEW AREA --- */}
      <div style={styles.mainContainer}>
        {/* LEFT PANEL - Code Editor */}
        <div style={styles.editorPanel}>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={styles.menuButton}
                >
                  ☰
                </button>
              )}
              {!isMobile && (
                <div>
                  <span style={{color: '#888', marginRight: '10px'}}>STATUS:</span>
                  <span style={{color: loading ? 'yellow' : '#4CAF50'}}>
                    {loading ? 'BOOTING KERNEL...' : 'ONLINE'}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: isMobile ? '8px' : '0', flexWrap: 'wrap' }}>
              <button
                onClick={runCode}
                disabled={loading}
                style={{...styles.btn, backgroundColor: loading ? '#555' : '#4CAF50', color: 'white'}}
              >
                ▶ {isMobile ? 'RUN' : 'RUN PROGRAM'}
              </button>
              <button
                onClick={stopCode}
                style={{...styles.btn, backgroundColor: '#FF9800', color: 'white'}}
              >
                ⏹ STOP
              </button>
              <button
                onClick={onClose}
                style={{...styles.btn, backgroundColor: '#b71c1c', color: 'white'}}
              >
                {isMobile ? '✕' : 'EXIT'}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </div>

        {/* DRAGGABLE DIVIDER */}
        <div
          style={styles.divider}
          onMouseDown={handleMouseDown}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
        />

        {/* RIGHT PANEL - Output Console */}
        <div style={styles.outputPanel}>
          <div style={{color: '#888', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '8px'}}>
            OUTPUT CONSOLE
          </div>

          {/* Pin States Display */}
          {Object.keys(pinStates).length > 0 && (
            <div style={{marginBottom: '10px', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px', border: '1px solid #333'}}>
              <div style={{color: '#888', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold'}}>PIN STATES:</div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                {Object.entries(pinStates).map(([pin, value]) => (
                  <div
                    key={pin}
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: value === 1 ? '#4CAF50' : '#555',
                      color: value === 1 ? '#fff' : '#aaa',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  >
                    PIN {pin}: {value === 1 ? 'HIGH' : 'LOW'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{color: '#666', marginBottom: '5px'}}>root@esp32-s3:~/output$</div>
          <pre style={{margin: 0, whiteSpace: 'pre-wrap', flex: 1, overflowY: 'auto'}}>{output}</pre>
        </div>
      </div>
    </div>
  )
}