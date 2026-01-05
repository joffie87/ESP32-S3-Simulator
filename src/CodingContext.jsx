/**
 * ============================================================================
 * CODINGCONTEXT.JSX - GLOBAL STATE MANAGEMENT FOR ESP32 SIMULATOR
 * ============================================================================
 *
 * WHAT IS CONTEXT?
 * React Context is like a "global storage locker" that any component in your
 * app can access. Instead of passing data through many components (prop drilling),
 * you put it in Context and any component can grab what it needs.
 *
 * WHY WE NEED THIS:
 * Our app has many parts that need to share data:
 * - Pin states (HIGH/LOW) need to be seen by ESP32Board, LEDs, Coding Overlay
 * - Wiring connections need to be tracked across components
 * - Edit mode state affects multiple components
 *
 * ADVANCED PATTERN: PUB/SUB (Publish-Subscribe)
 * We use a custom pub/sub system for pin states to avoid performance problems.
 * When one pin changes, we don't want to re-render the ENTIRE app - just the
 * components that care about that specific pin. This is MUCH faster!
 *
 * PERFORMANCE OPTIMIZATION:
 * We use useRef for frequently-changing data (like pin states) and useMemo
 * to prevent unnecessary re-renders. This keeps the app smooth even with
 * 40 pins updating rapidly!
 */

import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Create the Context (the "storage locker")
const CodingContext = createContext()

/**
 * CodingProvider Component
 *
 * This wraps our entire app and provides shared state to all children.
 * Think of it as the "manager" of our global storage locker.
 *
 * @param {ReactNode} children - All components that need access to context
 */
export function CodingProvider({ children }) {
  // ========================================================================
  // STATE: REGULAR REACT STATE (Re-renders when changed)
  // ========================================================================

  const [isCoding, setIsCoding] = useState(false)       // Is coding overlay open?
  const [isEditMode, setIsEditMode] = useState(false)   // Is edit mode active?
  const [isFirstPerson, setIsFirstPerson] = useState(false) // Is first-person camera active?
  const [selectedItem, setSelectedItem] = useState(null) // Which tool is selected?
  const [selectedId, setSelectedId] = useState(null)    // Which component is selected for transform?
  const [transformMode, setTransformMode] = useState('translate') // Transform mode: translate/rotate/scale
  const [gizmoModeActive, setGizmoModeActive] = useState(false) // Is gizmo/transform mode active?
  const [virtualInput, setVirtualInput] = useState({ forward: 0, rightward: 0, jump: false }) // Mobile controls
  const [mouseSensitivity, setMouseSensitivity] = useState(1.5) // Mouse look sensitivity (0-2)
  const [isMouseMode, setIsMouseMode] = useState(false) // Alt key held for UI interaction
  const [isPointerLocked, setIsPointerLocked] = useState(false) // Is mouse pointer locked?
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Is game menu (ESC) open? Pauses simulation

  // Initialize with ESP32, Breadboard, LED, and button components
  // All objects now in placedComponents for unified transform system
  const [placedComponents, setPlacedComponents] = useState([
    {
      id: 'esp32-board',
      type: 'esp32',
      position: [0.4, 1.5, 0],
      rotation: [0, -Math.PI / 2, 0],
      scale: 0.17,
      props: {}
    },
    {
      id: 'breadboard-main',
      type: 'breadboard',
      position: [-0.5, 1.49, 0],
      rotation: [0, 0, 0],
      scale: 0.6,
      props: {}
    },
    {
      id: 'default-led',
      type: 'led',
      position: [-0.3, 1.52, 0],
      rotation: [0, 0, 0],
      scale: 1,
      props: { color: '#ff0000' }
    },
    {
      id: 'default-button',
      type: 'button',
      position: [-0.7, 1.52, 0],
      rotation: [0, 0, 0],
      scale: 1,
      props: {}
    }
  ])

  const [wiring, setWiring] = useState({})              // Maps componentId → esp32Pin
  const [wires, setWires] = useState([])                // Array of visual wire objects
  const [wireInProgress, setWireInProgress] = useState(null) // Wire currently being placed

  // ========================================================================
  // REFS: HIGH-PERFORMANCE DATA STORAGE (No re-renders)
  // ========================================================================

  /**
   * WHY USE useRef FOR PIN STATES?
   *
   * Problem: If we used useState for pin states, EVERY time a pin changes
   * (which can be 60+ times per second when running code), React would
   * re-render the ENTIRE app. This would make it super laggy!
   *
   * Solution: useRef stores data that can change without causing re-renders.
   * Components that care about pin states "subscribe" to changes instead.
   *
   * Real-world analogy: Instead of announcing to the whole building when
   * you get a package, only people who signed up for notifications get told.
   */
  const pinStatesRef = useRef({})                // Current state of all 40 pins (HIGH/LOW)
  const pinStateListeners = useRef(new Set())    // Set of callback functions subscribed to updates
  const workerRef = useRef(null)                 // Reference to Pyodide web worker

  // Stable function to update pin states without triggering context re-renders
  const setPinStates = useRef((updater) => {
    if (typeof updater === 'function') {
      pinStatesRef.current = updater(pinStatesRef.current)
    } else {
      pinStatesRef.current = updater
    }
    // Notify only subscribed components (LEDs)
    pinStateListeners.current.forEach(listener => listener())
  }).current

  // Subscribe to pin state changes (for LED components)
  const subscribeToPinStates = useRef((callback) => {
    pinStateListeners.current.add(callback)
    return () => {
      pinStateListeners.current.delete(callback)
    }
  }).current

  // ========================================================================
  // HOVER INFO PUB/SUB SYSTEM (Isolated from context re-renders)
  // ========================================================================

  const hoveredPinInfoRef = useRef(null)         // Current hovered pin info (no re-renders)
  const hoverInfoListeners = useRef(new Set())   // Set of callback functions subscribed to hover updates

  // Update hover info without triggering context re-renders
  const setHoveredPinInfoDirect = useRef((newInfo) => {
    hoveredPinInfoRef.current = newInfo
    // Notify only subscribed components (tooltip)
    hoverInfoListeners.current.forEach(listener => listener())
  }).current

  // Subscribe to hover info changes (for tooltip)
  const subscribeToHoverInfo = useRef((callback) => {
    hoverInfoListeners.current.add(callback)
    return () => {
      hoverInfoListeners.current.delete(callback)
    }
  }).current

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt key for mouse mode (UI interaction)
      if (e.key === 'Alt') {
        setIsMouseMode(true)
      }

      if (e.key === 'Escape' && isCoding) {
        setIsCoding(false)
      }
      if (e.key === 'g' || e.key === 'G') {
        const newEditMode = !isEditMode
        setIsEditMode(newEditMode)
        console.log('Edit mode:', newEditMode ? 'ON' : 'OFF')
        if (newEditMode) {
          console.log('💡 Press 1-5 to select items. Ctrl+click to move placed objects.')
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        const newFirstPerson = !isFirstPerson
        setIsFirstPerson(newFirstPerson)
        console.log('First-person mode:', newFirstPerson ? 'ON' : 'OFF')
      }

      // Transform/Gizmo mode shortcuts (when in edit mode)
      if (isEditMode) {
        // Toggle gizmo mode with X key
        if (e.key === 'x' || e.key === 'X') {
          const newGizmoMode = !gizmoModeActive
          setGizmoModeActive(newGizmoMode)
          console.log('Gizmo mode:', newGizmoMode ? 'ON' : 'OFF')
          if (!newGizmoMode) {
            // Deselect when turning off gizmo mode
            setSelectedId(null)
          }
        }

        // Transform mode shortcuts (only when gizmo mode is active)
        if (gizmoModeActive) {
          if (e.key === 't' || e.key === 'T') {
            setTransformMode('translate')
            console.log('Transform mode: TRANSLATE')
          }
          if (e.key === 'r' || e.key === 'R') {
            setTransformMode('rotate')
            console.log('Transform mode: ROTATE')
          }
          if (e.key === 's' || e.key === 'S') {
            setTransformMode('scale')
            console.log('Transform mode: SCALE')
          }

          // Delete selected component (but protect core components)
          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
            e.preventDefault() // Prevent browser navigation on Backspace

            // Protect ESP32 and Breadboard from deletion
            if (selectedId === 'esp32-board' || selectedId === 'breadboard-main') {
              console.log('[CodingContext] ⛔ Cannot delete core component:', selectedId)
              return
            }

            console.log('[CodingContext] 🗑️ Deleting selected component:', selectedId)
            removeComponent(selectedId)
            setSelectedId(null)
          }
        }
      }
    }

    const handleKeyUp = (e) => {
      // Release Alt key (exit mouse mode)
      if (e.key === 'Alt') {
        setIsMouseMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isCoding, isEditMode, isFirstPerson, selectedId, gizmoModeActive])

  const setPinInput = (pin, value) => {
    console.log(`setPinInput called: pin=${pin}, value=${value}, worker=${workerRef.current ? 'ready' : 'not ready'}`)
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'INPUT_UPDATE',
        pin: pin,
        value: value
      })
      console.log(`Sent INPUT_UPDATE to worker`)
    } else {
      console.warn('Worker not initialized yet, cannot set pin input')
    }
  }

  const addComponent = (type, position, props = {}) => {
    const newComponent = {
      id: uuidv4(),
      type,
      position,
      props
    }
    setPlacedComponents(prev => [...prev, newComponent])
    return newComponent.id
  }

  const removeComponent = (id) => {
    console.log('[CodingContext] 🗑️ Removing component:', id)

    // Remove the component
    setPlacedComponents(prev => prev.filter(c => c.id !== id))

    // Remove any wires connected to this component
    setWires(prev => {
      const wiresToRemove = prev.filter(w =>
        w.startPin.componentId === id || w.endPin.componentId === id
      )
      if (wiresToRemove.length > 0) {
        console.log('[CodingContext] 🗑️ Also removing', wiresToRemove.length, 'connected wire(s)')
      }
      return prev.filter(w =>
        w.startPin.componentId !== id && w.endPin.componentId !== id
      )
    })

    // Remove wiring connection
    setWiring(prev => {
      const newWiring = { ...prev }
      delete newWiring[id]
      return newWiring
    })
  }

  const updateComponentPosition = (id, newPosition) => {
    setPlacedComponents(prev =>
      prev.map(c => c.id === id ? { ...c, position: newPosition } : c)
    )
  }

  const updateComponent = (id, updates) => {
    // Get the updated component data
    let updatedComponent = null

    setPlacedComponents(prev => {
      const newComponents = prev.map(c => {
        if (c.id === id) {
          updatedComponent = { ...c, ...updates }
          return updatedComponent
        }
        return c
      })
      return newComponents
    })

    console.log('[CodingContext] 🔄 Updated component:', id, updates)

    // Update connected wires when component moves/rotates/scales
    if (updatedComponent && (updates.position || updates.rotation || updates.scale)) {
      updateConnectedWires(updatedComponent)
    }
  }

  // Helper function to calculate pin world position based on component transform
  const calculatePinPosition = (component, pinInfo) => {
    if (!component) return null

    const basePos = component.position || [0, 0, 0]
    const rotation = component.rotation || [0, 0, 0]
    let scale = component.scale

    // Normalize scale to a number
    if (typeof scale === 'number') {
      // Already a number
    } else if (Array.isArray(scale)) {
      scale = scale[0] // Use x-scale as uniform scale
    } else {
      scale = 1
    }

    // Get local pin offset based on component type and pin info
    let localOffset = [0, 0, 0]
    let internalRotation = [0, 0, 0] // Some components have internal rotation fixes

    switch (component.type) {
      case 'esp32':
        // ESP32 pins: left side (0-19) or right side (20-39)
        if (pinInfo.pinNumber !== undefined) {
          const pinNum = pinInfo.pinNumber
          if (pinNum < 20) {
            // Left side pins
            localOffset = [-0.95, 0.2, -2.2 + (pinNum * 0.22)]
          } else {
            // Right side pins
            const rightIndex = pinNum - 20
            localOffset = [0.95, 0.2, -2.2 + (rightIndex * 0.22)]
          }
        }
        break

      case 'led':
        // LED has internal rotation [0, Math.PI, 0] and scale wrapper of 0.6 in Level.jsx
        internalRotation = [0, Math.PI, 0]
        if (pinInfo.pinType === 'cathode') {
          localOffset = [-0.02, -0.05, 0]
        } else if (pinInfo.pinType === 'anode') {
          localOffset = [0.02, -0.05, 0]
        }
        // Account for the 0.6 scale wrapper in Level.jsx
        localOffset = localOffset.map(v => v * 0.6)
        break

      case 'button':
        // Button has internal rotation [0, Math.PI, 0] and scale wrapper of 0.6 in Level.jsx
        internalRotation = [0, Math.PI, 0]
        if (pinInfo.pinType === 'terminal-1') {
          localOffset = [-0.03, -0.05, 0]
        } else if (pinInfo.pinType === 'terminal-2') {
          localOffset = [0.03, -0.05, 0]
        }
        // Account for the 0.6 scale wrapper in Level.jsx
        localOffset = localOffset.map(v => v * 0.6)
        break

      case 'breadboard':
        // Breadboard pins would need grid calculation
        // For now, use component center
        localOffset = [0, 0, 0]
        break

      default:
        localOffset = [0, 0, 0]
    }

    // Apply transformations: local offset → internal rotation → scale → component rotation → base position
    // Using basic 3D rotation math (Euler angles)

    // Step 1: Apply internal rotation to local offset
    let transformed = [...localOffset]
    if (internalRotation[1] !== 0) {
      // Apply Y-axis rotation (most common for LED/Button)
      const cos = Math.cos(internalRotation[1])
      const sin = Math.sin(internalRotation[1])
      const x = transformed[0] * cos + transformed[2] * sin
      const z = -transformed[0] * sin + transformed[2] * cos
      transformed = [x, transformed[1], z]
    }

    // Step 2: Apply component scale
    transformed = transformed.map(v => v * scale)

    // Step 3: Apply component rotation
    // Rotate around Y-axis (most common rotation axis)
    if (rotation[1] !== 0) {
      const cos = Math.cos(rotation[1])
      const sin = Math.sin(rotation[1])
      const x = transformed[0] * cos + transformed[2] * sin
      const z = -transformed[0] * sin + transformed[2] * cos
      transformed = [x, transformed[1], z]
    }

    // Rotate around X-axis
    if (rotation[0] !== 0) {
      const cos = Math.cos(rotation[0])
      const sin = Math.sin(rotation[0])
      const y = transformed[1] * cos - transformed[2] * sin
      const z = transformed[1] * sin + transformed[2] * cos
      transformed = [transformed[0], y, z]
    }

    // Rotate around Z-axis
    if (rotation[2] !== 0) {
      const cos = Math.cos(rotation[2])
      const sin = Math.sin(rotation[2])
      const x = transformed[0] * cos - transformed[1] * sin
      const y = transformed[0] * sin + transformed[1] * cos
      transformed = [x, y, transformed[2]]
    }

    // Step 4: Add base position
    const worldPos = [
      basePos[0] + transformed[0],
      basePos[1] + transformed[1],
      basePos[2] + transformed[2]
    ]

    return worldPos
  }

  // Update wire positions when a component is transformed
  const updateConnectedWires = (component) => {
    if (!component) return

    setWires(prev => {
      const updatedWires = prev.map(wire => {
        let needsUpdate = false
        let newStartPos = wire.startPos
        let newEndPos = wire.endPos

        // Update start position if this component is the start
        if (wire.startPin.componentId === component.id) {
          newStartPos = calculatePinPosition(component, wire.startPin)
          needsUpdate = true
          console.log('[CodingContext] 🔌 Updating wire start position for:', component.id)
        }

        // Update end position if this component is the end
        if (wire.endPin.componentId === component.id) {
          newEndPos = calculatePinPosition(component, wire.endPin)
          needsUpdate = true
          console.log('[CodingContext] 🔌 Updating wire end position for:', component.id)
        }

        if (needsUpdate) {
          return { ...wire, startPos: newStartPos, endPos: newEndPos }
        }

        return wire
      })

      return updatedWires
    })
  }

  // Helper functions for wiring management
  const startWire = (pinInfo, position) => {
    setWireInProgress({
      startPin: pinInfo,
      startPos: position
    })
    console.log('[Wiring] Started wire at', pinInfo, position)
  }

  const completeWire = (pinInfo, position) => {
    if (!wireInProgress) return

    const newWire = {
      id: uuidv4(),
      startPin: wireInProgress.startPin,
      endPin: pinInfo,
      startPos: wireInProgress.startPos,
      endPos: position
    }

    console.log('[Wiring] 🔌 Creating wire:', {
      wireId: newWire.id,
      startPin: wireInProgress.startPin,
      endPin: pinInfo,
      startPos: wireInProgress.startPos,
      endPos: position
    })

    setWires(prev => {
      const newWires = [...prev, newWire]
      console.log('[Wiring] 📦 Total wires after addition:', newWires.length)
      return newWires
    })

    // Update wiring connections if this connects a component to ESP32
    if (wireInProgress.startPin.type === 'esp32' && pinInfo.type === 'component') {
      setWiring(prev => {
        const newWiring = {
          ...prev,
          [pinInfo.componentId]: { esp32Pin: wireInProgress.startPin.pinNumber }
        }
        console.log(`[Wiring] ✅ Connected component ${pinInfo.componentId} to ESP32 pin ${wireInProgress.startPin.pinNumber}`)
        console.log('[Wiring] 🗺️ Updated wiring map:', newWiring)
        return newWiring
      })
    } else if (wireInProgress.startPin.type === 'component' && pinInfo.type === 'esp32') {
      setWiring(prev => {
        const newWiring = {
          ...prev,
          [wireInProgress.startPin.componentId]: { esp32Pin: pinInfo.pinNumber }
        }
        console.log(`[Wiring] ✅ Connected component ${wireInProgress.startPin.componentId} to ESP32 pin ${pinInfo.pinNumber}`)
        console.log('[Wiring] 🗺️ Updated wiring map:', newWiring)
        return newWiring
      })
    } else {
      console.warn('[Wiring] ⚠️ Wire created but no functional connection made:', {
        startType: wireInProgress.startPin.type,
        endType: pinInfo.type
      })
    }

    setWireInProgress(null)
  }

  const cancelWire = () => {
    console.log('[Wiring] ❌ Wire placement canceled')
    setWireInProgress(null)
  }

  const removeWireById = (wireId) => {
    const wire = wires.find(w => w.id === wireId)
    if (wire) {
      // Remove wiring connection
      if (wire.startPin.type === 'component') {
        setWiring(prev => {
          const newWiring = { ...prev }
          delete newWiring[wire.startPin.componentId]
          return newWiring
        })
      } else if (wire.endPin.type === 'component') {
        setWiring(prev => {
          const newWiring = { ...prev }
          delete newWiring[wire.endPin.componentId]
          return newWiring
        })
      }
      setWires(prev => prev.filter(w => w.id !== wireId))
    }
  }

  const getComponentPin = (componentId) => {
    return wiring[componentId]?.esp32Pin
  }

  // Use useMemo to stabilize context value - only changes when these dependencies change
  const contextValue = useMemo(() => ({
    isCoding,
    setIsCoding,
    pinStatesRef, // Pass ref, not current value
    setPinStates,
    subscribeToPinStates,
    workerRef,
    setPinInput,
    isEditMode,
    setIsEditMode,
    isFirstPerson,
    setIsFirstPerson,
    virtualInput,
    setVirtualInput,
    selectedItem,
    setSelectedItem,
    selectedId,
    setSelectedId,
    transformMode,
    setTransformMode,
    gizmoModeActive,
    setGizmoModeActive,
    mouseSensitivity,
    setMouseSensitivity,
    isMouseMode,
    setIsMouseMode,
    isPointerLocked,
    setIsPointerLocked,
    isMenuOpen,
    setIsMenuOpen,
    placedComponents,
    setPlacedComponents, // Exposed for GameMenu reset
    addComponent,
    removeComponent,
    updateComponentPosition,
    updateComponent,
    wiring,
    setWiring, // Exposed for GameMenu reset
    wires,
    setWires, // Exposed for GameMenu reset
    wireInProgress,
    startWire,
    completeWire,
    cancelWire,
    removeWireById,
    getComponentPin,
    hoveredPinInfoRef, // Pass ref for hover info
    setHoveredPinInfoDirect, // Direct update function (no context re-render)
    subscribeToHoverInfo // Subscribe function for tooltip
  }), [
    isCoding,
    isEditMode,
    isFirstPerson,
    virtualInput,
    selectedItem,
    selectedId,
    transformMode,
    gizmoModeActive,
    mouseSensitivity,
    isMouseMode,
    isPointerLocked,
    isMenuOpen,
    placedComponents,
    wiring,
    wires,
    wireInProgress
  ])

  return (
    <CodingContext.Provider value={contextValue}>
      {children}
    </CodingContext.Provider>
  )
}

export function useCoding() {
  const context = useContext(CodingContext)
  if (!context) {
    throw new Error('useCoding must be used within CodingProvider')
  }
  return context
}
