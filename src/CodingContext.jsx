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
  const [selectedItem, setSelectedItem] = useState(null) // Which tool is selected?
  const [virtualInput, setVirtualInput] = useState({ forward: 0, rightward: 0, jump: false }) // Mobile controls
  const [placedComponents, setPlacedComponents] = useState([]) // Array of placed LEDs, buttons
  const [wiring, setWiring] = useState({})              // Maps componentId → esp32Pin
  const [wires, setWires] = useState([])                // Array of visual wire objects
  const [wireInProgress, setWireInProgress] = useState(null) // Wire currently being placed
  const [hoveredPinInfo, setHoveredPinInfo] = useState(null) // Tooltip text for hovered pin

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

  useEffect(() => {
    const handleKeyDown = (e) => {
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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCoding, isEditMode])

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
    virtualInput,
    setVirtualInput,
    selectedItem,
    setSelectedItem,
    placedComponents,
    setPlacedComponents,
    addComponent,
    removeComponent,
    updateComponentPosition,
    wiring,
    wires,
    wireInProgress,
    startWire,
    completeWire,
    cancelWire,
    removeWireById,
    getComponentPin,
    hoveredPinInfo,
    setHoveredPinInfo
  }), [
    isCoding,
    isEditMode,
    virtualInput,
    selectedItem,
    placedComponents,
    wiring,
    wires,
    wireInProgress,
    hoveredPinInfo
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
