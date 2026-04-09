# Search Results Context Pack

**Generated:** 2026-01-10 22:12:18
**Query:** "text"
**Results:** 20

---

## Security Notice

This context pack contains code chunks matching your search query.
Review before sharing externally.

---

## Results

### Result 1 - E:\OneDrive\ESP32-S3-Simulator\src\CodingContext.jsx (lines 1-63)

**Matches:** 11

```
/*
@TVN_META
role: standard
desc: Coding Context state manager
@END_META
*/

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
```

---

### Result 2 - E:\OneDrive\ESP32-S3-Simulator\src\CodingContext.jsx (lines 528-674)

**Matches:** 11

```
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
```

---

### Result 3 - E:\OneDrive\ESP32-S3-Simulator\src\components\GameMenu.jsx (lines 154-321)

**Matches:** 9

```
      cursor: 'pointer',
      transition: 'all 0.2s',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    buttonHover: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
      transform: 'scale(1.05)'
    },
    closeButton: {
      marginTop: '20px',
      padding: '10px 20px',
      fontSize: '14px',
      fontFamily: 'monospace',
      backgroundColor: 'transparent',
      color: '#888888',
      border: '2px solid #555555',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    creditsBox: {
      backgroundColor: '#2a2a2a',
      padding: '40px',
      borderRadius: '16px',
      border: '3px solid #4CAF50',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      maxWidth: '600px',
      textAlign: 'left'
    },
    creditsTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: '20px',
      fontFamily: 'monospace',
      textAlign: 'center'
    },
    creditsText: {
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#cccccc',
      fontFamily: 'monospace',
      marginBottom: '15px'
    },
    disclaimer: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#999999',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #555555'
    },
    confirmBox: {
      backgroundColor: '#3a2020',
      padding: '30px',
      borderRadius: '12px',
      border: '3px solid #ff4444',
      maxWidth: '400px'
    },
    confirmTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ff4444',
      marginBottom: '20px',
      fontFamily: 'monospace'
    },
    confirmText: {
      fontSize: '16px',
      color: '#cccccc',
      marginBottom: '25px',
      lineHeight: '1.6'
    },
    confirmButtons: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center'
    },
    cancelButton: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#555555',
      color: '#ffffff',
      border: '2px solid #777777',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    confirmButton: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#ff4444',
      color: '#ffffff',
      border: '2px solid #ff4444',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  }

  // Reset Confirmation Screen
  if (showResetConfirm) {
    return (
      <div style={styles.overlay}>
        <div style={styles.confirmBox}>
          <div style={styles.confirmTitle}>⚠️ RESET SIMULATION?</div>
          <div style={styles.confirmText}>
            This will remove all placed components and wires, returning the simulation to its initial state.
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </div>
          <div style={styles.confirmButtons}>
            <button
              style={styles.cancelButton}
              onClick={() => setShowResetConfirm(false)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#666666'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#555555'}
            >
              Cancel
            </button>
            <button
              style={styles.confirmButton}
              onClick={confirmReset}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#cc3333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4444'}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Credits Screen
  if (showCredits) {
    return (
      <div style={styles.overlay}>
        <div style={styles.creditsBox}>
          <div style={styles.creditsTitle}>ESP32-S3 SIMULATOR</div>

          <div style={styles.creditsText}>
            <strong>Project Lead & Developer:</strong><br />
            [Johnathon Rhoades "Joffie87"]
          </div>

          <div style={styles.creditsText}>
            <strong>Technology Stack:</strong><br />
            React • Three.js • React Three Fiber • Pyodide • Rapier Physics
          </div>

          <div style={styles.creditsText}>
            <strong>Development Approach:</strong><br />
            Educational tool for learning embedded systems programming without physical hardware.
          </div>

          <div style={styles.disclaimer}>
            <strong>AI Development Disclosure:</strong><br /><br />

            This project was developed with AI assistance (Claude by Anthropic) at every step of the process,
            including architecture design, implementation, debugging, and documentation.
```

---

### Result 4 - E:\OneDrive\ESP32-S3-Simulator\src\components\PlacementManager.jsx (lines 177-277)

**Matches:** 6

```

      // PHASE 1: Smart surfaces provide pre-snapped positions
      // Legacy surfaces still use basic grid snapping
      let snappedX, snappedY, snappedZ

      if (validIntersect.snappedPoint) {
        // Smart surface already calculated exact position
        snappedX = worldPoint.x
        snappedY = worldPoint.y + 0.03 // Slight visual offset above surface
        snappedZ = worldPoint.z
      } else {
        // Legacy: Basic grid snapping
        snappedX = Math.round(worldPoint.x / 0.05) * 0.05
        snappedY = Math.round(worldPoint.y / 0.05) * 0.05 + 0.03
        snappedZ = Math.round(worldPoint.z / 0.05) * 0.05
      }

      setGhostPosition([snappedX, snappedY, snappedZ])
      if (!showGhost) {
        console.log('[PlacementManager] Showing ghost at world position', [snappedX, snappedY, snappedZ])
        setShowGhost(true)
      }
    } else {
      if (showGhost) {
        setShowGhost(false)
        setGridInfo(null) // Clear grid info when not hovering valid surface
      }
    }
  })

  // ESC key handler for canceling wire placement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && wireInProgress) {
        console.log('[PlacementManager] ❌ Wire placement canceled (ESC)')
        cancelWire()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [wireInProgress, cancelWire])

  // Attach event handlers to canvas
  useEffect(() => {
    const canvas = gl.domElement

    const handlePointerMove = (e) => {
      if (!isEditMode || !selectedItem) return

      const rect = canvas.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    const handleClick = (e) => {
      if (!isEditMode || !selectedItem) return

      // Left click (button 0)
      if (e.button === 0) {
        console.log('[PlacementManager] Left-click detected, showGhost:', showGhost)
        // Signal that we want to place a component on the next frame
        clickPending.current = true
      }
    }

    const handleContextMenu = (e) => {
      if (!isEditMode || !selectedItem) return

      // Right-click while wire tool is active
      if (selectedItem === 'wire' && wireInProgress) {
        e.preventDefault() // Prevent browser context menu
        rightClickPending.current = true
        console.log('[PlacementManager] Right-click detected (cancel wire)')
      }
    }

    if (isEditMode && selectedItem) {
      console.log('[PlacementManager] Attaching event handlers for', selectedItem)
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('pointerdown', handleClick)
      canvas.addEventListener('contextmenu', handleContextMenu)
    }

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerdown', handleClick)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isEditMode, selectedItem, gl, showGhost, wireInProgress])

  // Track the last valid intersect for click handling
  const lastValidIntersect = useRef(null)

  // Store last valid intersect for click handling
  useEffect(() => {
    if (showGhost && isEditMode && selectedItem) {
      // The valid intersect is stored during useFrame
      // We'll use ghostPosition and check raycasting again on click
    }
  }, [showGhost, isEditMode, selectedItem])
```

---

### Result 5 - E:\OneDrive\ESP32-S3-Simulator\src\components\Wire.jsx (lines 1-88)

**Matches:** 5

```
/*
@TVN_META
role: standard
desc: Wire
@END_META
*/

import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { useCoding } from '../CodingContext'

/**
 * Wire component - Renders a visual wire connection between two points
 * Like redstone in Minecraft, connecting components to pins
 * Right-click to delete wires in edit mode
 */
export default function Wire({ wireId, startPos, endPos, color = '#ff6600', inProgress = false }) {
  const { isEditMode, removeWireById } = useCoding()
  const [isHovered, setIsHovered] = useState(false)
  // Calculate wire path using QuadraticBezierCurve3 for a nice arc
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...startPos)
    const end = new THREE.Vector3(...endPos)

    // Calculate midpoint and add a downward sag (gravity effect)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    const distance = start.distanceTo(end)
    mid.y -= Math.min(distance * 0.2, 0.3) // Downward sag based on distance (gravity)

    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [startPos, endPos])

  // Create tube geometry along the curve
  const geometry = useMemo(() => {
    const points = curve.getPoints(32) // 32 segments for smooth curve
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      32, // tubular segments
      0.01, // radius
      8, // radial segments
      false // closed
    )
  }, [curve])

  const handleClick = (event) => {
    // Right-click to delete
    if (event.button === 2 && isEditMode && wireId) {
      event.stopPropagation()
      console.log('[Wire] 🗑️ Deleting wire:', wireId)
      removeWireById(wireId)
    }
  }

  const handleContextMenu = (event) => {
    // Prevent browser context menu
    if (isEditMode && wireId) {
      event.stopPropagation()
    }
  }

  return (
    <mesh
      geometry={geometry}
      onPointerDown={handleClick}
      onContextMenu={handleContextMenu}
      onPointerOver={(e) => {
        if (isEditMode && wireId) {
          e.stopPropagation()
          setIsHovered(true)
        }
      }}
      onPointerOut={(e) => {
        if (isEditMode && wireId) {
          e.stopPropagation()
          setIsHovered(false)
        }
      }}
    >
      <meshStandardMaterial
        color={isHovered && isEditMode ? '#ff0000' : color}
        emissive={isHovered && isEditMode ? '#ff0000' : color}
        emissiveIntensity={isHovered && isEditMode ? 0.8 : (inProgress ? 0.5 : 0.2)}
        transparent={inProgress}
        opacity={inProgress ? 0.7 : 1}
      />
    </mesh>
  )
}
```

---

### Result 6 - E:\OneDrive\ESP32-S3-Simulator\src\App.jsx (lines 1-128)

**Matches:** 4

```
/*
@TVN_META
role: standard
desc: Root application component
@END_META
*/

import { memo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Environment } from '@react-three/drei'
import Level from './Level'
import { CodingProvider, useCoding } from './CodingContext'
import CodingOverlay from './components/CodingOverlay'
import Tutorial from './components/Tutorial'
import MobileControls from './components/MobileControls'
import Inventory from './components/Inventory'
import GameMenu from './components/GameMenu'
import ScreenRecorder from './components/ScreenRecorder'
import useGamepad from './hooks/useGamepad'

// Memoize Level to prevent re-renders when context updates (fixes player bounce glitch)
const MemoizedLevel = memo(Level)

function AppContent() {
  const {
    isCoding,
    setIsCoding,
    isEditMode,
    gizmoModeActive,
    setVirtualInput,
    hoveredPinInfoRef,
    subscribeToHoverInfo,
    wireInProgress,
    isMouseMode,
    isPointerLocked,
    setIsPointerLocked,
    isMenuOpen
  } = useCoding()

  // Local state for hover tooltip - isolated from context
  const [hoveredPinInfo, setHoveredPinInfo] = useState(null)

  // Subscribe to hover info changes
  useEffect(() => {
    const updateHoverInfo = () => {
      setHoveredPinInfo(hoveredPinInfoRef.current)
    }

    // Set initial value
    updateHoverInfo()

    // Subscribe to changes
    return subscribeToHoverInfo(updateHoverInfo)
  }, [hoveredPinInfoRef, subscribeToHoverInfo])

  // Pointer lock management
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null)
    }

    const handleClick = () => {
      // Lock pointer when clicking canvas in normal gameplay mode (not paused/editing)
      if (!isEditMode && !isMouseMode && !isCoding && !isMenuOpen) {
        document.body.requestPointerLock()
      }
    }

    // Auto-release pointer lock when entering edit/mouse/coding modes or opening menu (pause)
    if (isEditMode || isMouseMode || isCoding || isMenuOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('click', handleClick)
    }
  }, [isEditMode, isMouseMode, isCoding, isMenuOpen, setIsPointerLocked])

  // Handle mobile virtual controls
  const handleMobileMove = ({ forward, rightward }) => {
    setVirtualInput(prev => ({ ...prev, forward, rightward }))
  }

  const handleMobileJump = (isJumping) => {
    setVirtualInput(prev => ({ ...prev, jump: isJumping }))
  }

  // Handle gamepad input
  const handleGamepadInput = (input) => {
    setVirtualInput({
      forward: input.forward - input.backward,
      rightward: input.rightward - input.leftward,
      jump: input.jump
    })
  }

  useGamepad(handleGamepadInput)

  return (
    <>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
          { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
          { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
          { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
          { name: 'jump', keys: ['Space'] },
          { name: 'run', keys: ['Shift'] },
        ]}
      >
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 50 }}
          style={{ width: '100vw', height: '100vh' }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Environment preset="city" />
          <MemoizedLevel />
        </Canvas>
      </KeyboardControls>

      {/* Edit Mode Indicator */}
```

---

### Result 7 - E:\OneDrive\ESP32-S3-Simulator\src\CodingContext.jsx (lines 133-237)

**Matches:** 4

```
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
```

---

### Result 8 - E:\OneDrive\ESP32-S3-Simulator\src\components\Draggable.jsx (lines 85-156)

**Matches:** 4

```
    const handlePointerUp = () => {
      if (dragStateRef.current.isDragging) {
        dragStateRef.current.isDragging = false
        setIsDragging(false)
        gl.domElement.style.cursor = 'grab'
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isEditMode, camera, raycaster, size, position, gl])

  const handlePointerDown = (event) => {
    if (!isEditMode) return

    // Right-click to delete (only for placed components with componentId)
    if (event.button === 2 && componentId) {
      event.stopPropagation()
      console.log('[Draggable] 🗑️ Deleting component:', componentId)
      removeComponent(componentId)
      return
    }

    // Only allow dragging with Ctrl+click
    if (!event.ctrlKey) return

    event.stopPropagation()
    dragStateRef.current.isDragging = true
    setIsDragging(true)
    gl.domElement.style.cursor = 'grabbing'
  }

  const handleContextMenu = (event) => {
    // Prevent browser context menu in edit mode
    if (isEditMode && componentId) {
      event.stopPropagation()
    }
  }

  // Calculate display position (lift while dragging)
  const displayY = currentPosition[1] + (isDragging ? hoverHeight : 0)
  const displayPosition = [currentPosition[0], displayY, currentPosition[2]]

  return (
    <group
      ref={groupRef}
      position={displayPosition}
      rotation={rotation}
      onPointerDown={handlePointerDown}
      onContextMenu={handleContextMenu}
      onPointerOver={(e) => {
        if (isEditMode) {
          e.stopPropagation()
          gl.domElement.style.cursor = componentId ? 'grab' : 'default'
        }
      }}
      onPointerOut={(e) => {
        if (isEditMode) {
          e.stopPropagation()
          gl.domElement.style.cursor = 'default'
        }
      }}
    >
      {children}
    </group>
  )
}
```

---

### Result 9 - E:\OneDrive\ESP32-S3-Simulator\src\components\ESP32Board.jsx (lines 1-67)

**Matches:** 4

```
/*
@TVN_META
role: standard
desc: E S P32 Board
@END_META
*/

/**
 * ============================================================================
 * ESP32BOARD.JSX - 3D MODEL OF ESP32-S3 MICROCONTROLLER BOARD
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * This creates a detailed 3D visual representation of an ESP32-S3 development
 * board - a popular microcontroller used in electronics projects. Think of it
 * like creating a digital twin of the physical hardware.
 *
 * KEY FEATURES FOR BEGINNERS:
 * - 40 GPIO pins (20 on each side) for connecting components
 * - 4 Ground (GND) pins for completing electrical circuits
 * - Visual feedback when pins are HIGH (active) or LOW (inactive)
 * - Interactive hover effects when using the wire tool
 * - Pin labels that appear when placing wires
 *
 * WHY THIS MATTERS:
 * This board is the "brain" of your electronics project. The pins let you
 * control LEDs, read button presses, and communicate with other components.
 * The visual representation helps you learn how real hardware works!
 */

import { useRef, useState, useEffect } from 'react'
import { RoundedBox, Text, Outlines } from '@react-three/drei'
import { useCoding } from '../CodingContext'

/**
 * ESP32Board Component
 *
 * @param {Array} position - [x, y, z] coordinates in 3D space where board appears
 *
 * REACT HOOKS USED (for beginners):
 * - useState: Stores data that changes over time (like which pin is hovered)
 * - useEffect: Runs code when something changes (like subscribing to pin updates)
 * - useRef: Stores data that doesn't cause re-renders (like the board object)
 */
export default function ESP32Board({ componentId, ...props }) {
  // ========================================================================
  // STATE AND CONTEXT (Data Storage)
  // ========================================================================

  // Get functions and data from our global app context
  const { pinStatesRef, subscribeToPinStates, selectedItem, isEditMode } = useCoding()

  // Local state - data specific to this board
  const [pinStates, setPinStates] = useState({}) // Which pins are HIGH (1) or LOW (0)
  const [hoveredPin, setHoveredPin] = useState(null) // Which pin is mouse hovering over
  const boardRef = useRef() // Reference to the 3D board object

  // Check if wire tool is currently selected (used for showing pin labels)
  const wireToolActive = isEditMode && selectedItem === 'wire'

  // ========================================================================
  // PIN STATE SUBSCRIPTION (Real-time Updates)
  // ========================================================================

  /**
   * WHY WE USE SUBSCRIPTION PATTERN:
   * Instead of re-rendering the entire app when ONE pin changes, we use a
```

---

### Result 10 - E:\OneDrive\ESP32-S3-Simulator\src\components\GameMenu.jsx (lines 1-158)

**Matches:** 4

```
/*
@TVN_META
role: standard
desc: Game Menu
@END_META
*/

/**
 * ============================================================================
 * GAMEMENU.JSX - Main pause menu with reset and credits
 * ============================================================================
 *
 * Opens with ESC key
 * Contains: Reset Simulation, Credits
 */

import { useState, useEffect } from 'react'
import { useCoding } from '../CodingContext'

export default function GameMenu() {
  const {
    setPlacedComponents,
    setWires,
    setWiring,
    setPinStates,
    mouseSensitivity,
    setMouseSensitivity,
    isMenuOpen,
    setIsMenuOpen
  } = useCoding()
  const [showCredits, setShowCredits] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // ESC key handler - Toggle menu and pause simulation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCredits) {
          setShowCredits(false)
        } else if (showResetConfirm) {
          setShowResetConfirm(false)
        } else if (showSettings) {
          setShowSettings(false)
        } else {
          setIsMenuOpen(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCredits, showResetConfirm, showSettings, setIsMenuOpen])

  const handleReset = () => {
    setShowResetConfirm(true)
  }

  const confirmReset = () => {
    // Reset to initial state - includes ESP32, Breadboard, LED, and Button
    setPlacedComponents([
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
    setWires([])
    setWiring({})
    setPinStates({})

    // Close all menus and unpause
    setShowResetConfirm(false)
    setIsMenuOpen(false)

    console.log('[GameMenu] 🔄 Simulation reset to initial state (including ESP32 and Breadboard)')
  }

  if (!isMenuOpen) return null

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    },
    menu: {
      backgroundColor: '#2a2a2a',
      padding: '40px',
      borderRadius: '16px',
      border: '3px solid #4CAF50',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      minWidth: '400px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: '30px',
      fontFamily: 'monospace',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    button: {
      padding: '15px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#3a3a3a',
      color: '#ffffff',
      border: '2px solid #666666',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
```

---

### Result 11 - E:\OneDrive\ESP32-S3-Simulator\src\components\GameMenu.jsx (lines 317-454)

**Matches:** 4

```
          <div style={styles.disclaimer}>
            <strong>AI Development Disclosure:</strong><br /><br />

            This project was developed with AI assistance (Claude by Anthropic) at every step of the process,
            including architecture design, implementation, debugging, and documentation.
            <br /><br />

            However, it would be <strong>currently impossible</strong> for any AI to create a simulation of
            this complexity and scope without extensive human input, decision-making, vision, and iterative
            refinement. The AI served as a tool to accelerate development, but all architectural decisions,
            design choices, feature priorities, and creative direction were human-driven.
            <br /><br />

            This represents a collaboration between human creativity and AI capabilities,
            not autonomous AI generation.
          </div>

          <button
            style={styles.closeButton}
            onClick={() => setShowCredits(false)}
            onMouseEnter={(e) => e.target.style.borderColor = '#888888'}
            onMouseLeave={(e) => e.target.style.borderColor = '#555555'}
          >
            Close (ESC)
          </button>
        </div>
      </div>
    )
  }

  // Settings Screen
  if (showSettings) {
    return (
      <div style={styles.overlay}>
        <div style={styles.creditsBox}>
          <div style={styles.creditsTitle}>⚙️ Settings</div>

          <div style={{...styles.creditsText, marginBottom: '30px'}}>
            <strong>Mouse Sensitivity</strong><br />
            <div style={{marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px'}}>
              <span style={{minWidth: '60px', color: '#888888'}}>Low</span>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={mouseSensitivity}
                onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{minWidth: '60px', color: '#888888', textAlign: 'right'}}>High</span>
            </div>
            <div style={{textAlign: 'center', marginTop: '10px', fontSize: '18px', color: '#4CAF50'}}>
              {mouseSensitivity.toFixed(1)}x
            </div>
          </div>

          <div style={styles.creditsText}>
            <strong>Controls:</strong><br />
            • Camera follows mouse automatically<br />
            • Hold <strong>Alt</strong> to interact with UI<br />
            • <strong>Edit Mode</strong> disables camera following
          </div>

          <button
            style={styles.closeButton}
            onClick={() => setShowSettings(false)}
            onMouseEnter={(e) => e.target.style.borderColor = '#888888'}
            onMouseLeave={(e) => e.target.style.borderColor = '#555555'}
          >
            Back (ESC)
          </button>
        </div>
      </div>
    )
  }

  // Main Menu
  return (
    <div style={styles.overlay}>
      <div style={styles.menu}>
        <div style={styles.title}>⚙️ Menu</div>
        <div style={styles.buttonContainer}>
          <button
            style={styles.button}
            onClick={() => setShowSettings(true)}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3a3a3a'
              e.target.style.borderColor = '#666666'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ⚙️ Settings
          </button>
          <button
            style={styles.button}
            onClick={handleReset}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3a3a3a'
              e.target.style.borderColor = '#666666'
              e.target.style.transform = 'scale(1)'
            }}
          >
            🔄 Reset Simulation
          </button>
          <button
            style={styles.button}
            onClick={() => setShowCredits(true)}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3a3a3a'
              e.target.style.borderColor = '#666666'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ℹ️ Credits
          </button>
        </div>
        <button
          style={styles.closeButton}
          onClick={() => setIsMenuOpen(false)}
          onMouseEnter={(e) => e.target.style.borderColor = '#888888'}
          onMouseLeave={(e) => e.target.style.borderColor = '#555555'}
        >
          Resume (ESC)
        </button>
      </div>
    </div>
  )
}
```

---

### Result 12 - E:\OneDrive\ESP32-S3-Simulator\src\CodingContext.jsx (lines 233-352)

**Matches:** 3

```
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

```

---

### Result 13 - E:\OneDrive\ESP32-S3-Simulator\src\components\ESP32Board.jsx (lines 135-229)

**Matches:** 3

```
  for (let i = 0; i < 20; i++) {
    const pinNumber = i + 20
    const isGround = pinNumber === 38 || pinNumber === 39
    rightPins.push({
      index: i + 20,                              // Array position (20-39)
      pinNumber: pinNumber,                        // Actual pin number (20-39)
      isGround: isGround,                         // Is this a ground pin?
      label: isGround ? 'GND' : pinNumber.toString(), // Label shows "GND" or number
      x: 0.95,                                     // Position: right side of board
      z: -2.2 + (i * 0.22)                        // Position: spaced evenly down board
    })
  }

  // Combine both sides into one array for easy iteration
  const allPins = [...leftPins, ...rightPins]

  return (
    <group ref={boardRef} onClick={handleClick} userData={{ placementSurface: 'esp32', componentId }} {...props}>
      {/* PCB - Main Board */}
      <RoundedBox args={[2.2, 0.1, 5]} radius={0.02} smoothness={4} position={[0, 0, 0]} userData={{ placementSurface: 'esp32' }}>
        <meshToonMaterial color="#2a4a2a" />
        <Outlines thickness={0.015} color="black" />
      </RoundedBox>

      {/* Mounting Holes */}
      <mesh position={[-1, 0.051, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.11, 8]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[1, 0.051, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.11, 8]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-1, 0.051, 2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.11, 8]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[1, 0.051, 2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.11, 8]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>

      {/* Shielding - The Silver Chip (reduced size for label space) */}
      <RoundedBox args={[1.0, 0.15, 0.9]} radius={0.01} smoothness={4} position={[0, 0.125, 0.5]}>
        <meshToonMaterial color="#d4d4d4" />
        <Outlines thickness={0.012} color="black" />
      </RoundedBox>

      {/* ESP32-S3 Text */}
      <Text
        position={[0, 0.21, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        ESP32-S3
      </Text>

      {/* USB-C Connector */}
      <RoundedBox args={[0.35, 0.12, 0.25]} radius={0.01} smoothness={4} position={[0, 0.11, -2.4]}>
        <meshToonMaterial color="#e0e0e0" />
        <Outlines thickness={0.01} color="black" />
      </RoundedBox>

      {/* Reset Button (moved closer to center) */}
      <mesh position={[-0.25, 0.11, -1.8]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.25, 0.15, -1.8]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshToonMaterial color="#ff4444" />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* Boot Button (moved closer to center) */}
      <mesh position={[0.25, 0.11, -1.8]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.25, 0.15, -1.8]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshToonMaterial color="#4444ff" />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* Pin Headers */}
      {allPins.map((pin) => {
        const isPinHigh = pinStates[pin.index] === 1
        const isHovered = hoveredPin === pin.index && wireToolActive

        return (
          <group key={pin.index} position={[pin.x, 0, pin.z]}>
```

---

### Result 14 - E:\OneDrive\ESP32-S3-Simulator\src\simulation\pyodide.worker.js (lines 133-233)

**Matches:** 3

```
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
```

---

### Result 15 - E:\OneDrive\ESP32-S3-Simulator\src\CodingContext.jsx (lines 424-532)

**Matches:** 2

```
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
```

---

### Result 16 - E:\OneDrive\ESP32-S3-Simulator\src\CodingContext.jsx (lines 670-674)

**Matches:** 2

```
  if (!context) {
    throw new Error('useCoding must be used within CodingProvider')
  }
  return context
}
```

---

### Result 17 - E:\OneDrive\ESP32-S3-Simulator\src\Level.jsx (lines 385-517)

**Matches:** 2

```
        case 'breadboard':
          return [2.0, 0.3, 1.0] // Large hitbox for breadboard (scaled by 0.6)
        case 'led':
        case 'button':
          return [0.5, 0.5, 0.5] // Larger hitbox for small components (scaled by 0.6 inside, but 1.0 outer)
        default:
          return [1, 1, 1]
      }
    }

    return (
      <>
        <group
          ref={objectRef}
          position={component.position || [0, 0, 0]}
          rotation={component.rotation || [0, 0, 0]}
          scale={getScale()}
        >
          {renderComponentContent()}

          {/* Invisible hitbox for selection - only visible when gizmo mode is active */}
          {isEditMode && gizmoModeActive && (
            <mesh
              renderOrder={999}
              onPointerDown={handlePointerDown}
              onContextMenu={handleContextMenu}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'default'
              }}
            >
              <boxGeometry args={getHitboxSize()} />
              <meshBasicMaterial
                transparent
                opacity={isSelected ? 0.2 : 0.05}
                color={isSelected ? "#00ff00" : "#ffff00"}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Visual highlight for selected component */}
          {isSelected && (
            <Outlines thickness={0.05} color="green" />
          )}
        </group>

        {/* Transform controls for selected component - only shows when gizmo mode is active */}
        {isSelected && gizmoModeActive && (
          <TransformControls
            ref={transformRef}
            object={objectRef}
            mode={transformMode}
            space="world"
            size={1.5}
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
            // Prevent camera movement during transform
            makeDefault={isDragging}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* ====================================================================
          SKY - Blue sky dome with visible sun
          ==================================================================== */}
      <Sky
        distance={450000}
        sunPosition={[100, 50, 100]}
        inclination={0.52}
        azimuth={0.25}
        turbidity={2}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
      />

      {/* Visible Sun - Yellow ball in the sky */}
      <mesh position={[100, 50, 100]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {/* Moving clouds */}
      <MovingClouds />

      {/* Camera controller for auto-follow mouse */}
      <CameraController />

      {/* ====================================================================
          LIGHTING SETUP - Makes everything visible and creates mood
          ==================================================================== */}

      {/*
        AMBIENT LIGHT - Base lighting that hits everything equally
        Like the general daylight that fills a room
        Intensity 0.6 = 60% brightness (1.0 would be full brightness)
      */}
      <ambientLight intensity={0.6} />

      {/*
        MAIN SUN - Directional light that creates hard shadows
        This is our "sun" casting light from one direction
      */}
      <directionalLight
        position={[20, 30, 15]}        // Light source is high and to the right
        intensity={3.5}                // Very bright (3.5x normal)
        castShadow                     // This light creates shadows
        shadow-mapSize-width={2048}    // Shadow quality (higher = better but slower)
        shadow-mapSize-height={2048}
        shadow-camera-far={100}        // How far shadows are calculated
        shadow-camera-left={-30}       // Shadow area boundaries
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        color="#fffaf0"                // Slightly warm white (hex color)
      />

      {/*
        FILL LIGHT - Secondary light to reduce harsh shadows
        Position on opposite side from main sun, with blue tint
      */}
      <directionalLight
        position={[-10, 10, -10]}
```

---

### Result 18 - E:\OneDrive\ESP32-S3-Simulator\src\components\CodingOverlay.jsx (lines 117-220)

**Matches:** 2

```
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
```

---

### Result 19 - E:\OneDrive\ESP32-S3-Simulator\src\components\CodingOverlay.jsx (lines 216-348)

**Matches:** 2

```
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
```

---

### Result 20 - E:\OneDrive\ESP32-S3-Simulator\src\components\ComponentButton.jsx (lines 1-135)

**Matches:** 2

```
/*
@TVN_META
role: standard
desc: Button
@END_META
*/

/**
 * PHASE 1 FIX: Entire component wrapped in rotation={[0, Math.PI, 0]}
 * to ensure button plugs into breadboard correctly in world space.
 */

import { useState } from 'react'
import { useCoding } from '../CodingContext'
import { Outlines, Text } from '@react-three/drei'

export default function ComponentButton({ componentId, connectedPin, ...props }) {
  const { setPinInput, selectedItem, isEditMode } = useCoding()
  const [isPressed, setIsPressed] = useState(false)
  const [hoveredPin, setHoveredPin] = useState(null)

  // Check if wire tool is active
  const wireToolActive = isEditMode && selectedItem === 'wire'

  const handlePointerDown = (e) => {
    e.stopPropagation()
    console.log(`Button ${connectedPin} pressed`)
    setIsPressed(true)
    setPinInput(connectedPin, 1)
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    console.log(`Button ${connectedPin} released`)
    setIsPressed(false)
    setPinInput(connectedPin, 0)
  }

  const handlePointerLeave = (e) => {
    if (isPressed) {
      e.stopPropagation()
      console.log(`Button ${connectedPin} released (pointer left)`)
      setIsPressed(false)
      setPinInput(connectedPin, 0)
    }
  }

  return (
    <group {...props}>
      {/* Internal rotation fix - makes button face correct direction */}
      <group rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.12]} />
        <meshToonMaterial color="#2a2a2a" />
        <Outlines thickness={0.01} color="black" />
      </mesh>

      <mesh
        position={[0, isPressed ? 0.04 : 0.06, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
        <meshToonMaterial color={isPressed ? '#cc3333' : '#ff4444'} />
        <Outlines thickness={0.01} color="black" />
      </mesh>

      {/* Terminal 1 (left, pin 0) */}
      <group>
        <mesh
          position={[-0.03, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'button', pinType: 'terminal-1', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('terminal-1')
            }
          }}
          onPointerOut={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin(null)
            }
          }}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.08, 6]} />
          <meshToonMaterial
            color={hoveredPin === 'terminal-1' ? '#ffffff' : '#d0d0d0'}
            emissive={hoveredPin === 'terminal-1' ? '#ffffff' : '#000000'}
            emissiveIntensity={hoveredPin === 'terminal-1' ? 3.0 : 0}
          />
        </mesh>

        {/* Blue cylinder indicator when hovered - transparent shell around pin */}
        {hoveredPin === 'terminal-1' && (
          <mesh position={[-0.03, -0.05, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
            <meshStandardMaterial
              color="#4444ff"
              transparent
              opacity={0.7}
              emissive="#4444ff"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}

        {/* Invisible larger hitbox for easier wire attachment */}
        <mesh
          position={[-0.03, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'button', pinType: 'terminal-1', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('terminal-1')
            }
          }}
          onPointerOut={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin(null)
            }
          }}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Terminal 2 (right, pin 1) */}
      <group>
        <mesh
          position={[0.03, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'button', pinType: 'terminal-2', componentId }}
```

---

