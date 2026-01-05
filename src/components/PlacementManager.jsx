/**
 * ============================================================================
 * PLACEMENTMANAGER.JSX - Smart Surface-Aware Placement System
 * ============================================================================
 *
 * PHASE 1: Grid-based placement for breadboard
 * - Detects smart surfaces (breadboard with grid system)
 * - Converts world positions to grid coordinates
 * - Snaps components to nearest valid grid position
 * - Visual feedback with grid coordinates in console
 */

import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCoding } from '../CodingContext'
import ComponentLED from './ComponentLED'
import ComponentButton from './ComponentButton'
import Wire from './Wire'
import * as THREE from 'three'
import { localToGrid, gridToLocal, BREADBOARD_CONFIG } from './Breadboard'

export default function PlacementManager() {
  const { isEditMode, selectedItem, addComponent, startWire, completeWire, wireInProgress, cancelWire, setHoveredPinInfoDirect, placedComponents } = useCoding()
  const [ghostPosition, setGhostPosition] = useState([0, 0, 0])
  const [showGhost, setShowGhost] = useState(false)
  const [gridInfo, setGridInfo] = useState(null) // Track current grid position
  const [currentHoveredPin, setCurrentHoveredPin] = useState(null) // Track currently hovered pin for wire validation
  const { camera, gl, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const clickPending = useRef(false)
  const rightClickPending = useRef(false)
  const lastHoveredPinInfo = useRef(null) // Track previous hover to avoid unnecessary updates

  useFrame(() => {
    if (!isEditMode || !selectedItem) {
      if (showGhost) setShowGhost(false)
      return
    }

    // Cast ray from camera through mouse position
    raycaster.current.setFromCamera(mouse.current, camera)

    // Intersect with all scene objects
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    // Find the first valid intersection based on selected item type
    let validIntersect = null

    for (const intersect of intersects) {
      // Skip objects that should be ignored for raycasting
      if (intersect.object.userData?.ignoreRaycast) {
        continue
      }

      // Check object and its parents for placement surface data
      let surface = null
      let obj = intersect.object
      while (obj && !surface) {
        surface = obj.userData?.placementSurface
        obj = obj.parent
      }

      // LEDs and buttons can only be placed on breadboard
      if (selectedItem.startsWith('led-') || selectedItem === 'button') {
        if (surface === 'breadboard') {
          // PHASE 1: Smart Surface Detection
          const isSmartSurface = intersect.object.userData?.smartSurface

          if (isSmartSurface) {
            // Convert world hit point to local space (relative to intersected object)
            const localPoint = intersect.object.worldToLocal(intersect.point.clone())

            // Convert local position to grid coordinates
            const gridSnap = localToGrid(localPoint.x, localPoint.z)

            console.log('[PlacementManager] 📍 Grid Snap:', {
              row: gridSnap.row,
              col: gridSnap.col,
              isValid: gridSnap.isValid,
              localPos: gridSnap.position
            })

            // Store grid info for placement
            intersect.gridInfo = gridSnap

            // Convert grid position back to world space for ghost preview
            const [localX, localY, localZ] = gridSnap.position
            const worldPos = intersect.object.localToWorld(new THREE.Vector3(localX, localY, localZ))

            intersect.snappedPoint = worldPos
            validIntersect = intersect
            setGridInfo(gridSnap)
          } else {
            // Legacy: No grid snapping
            console.log('[PlacementManager] ✓ Found valid breadboard placement at', intersect.point)
            validIntersect = intersect
            setGridInfo(null)
          }
          break
        }
      }
      // Wires connect to component pins or ESP32 pins
      else if (selectedItem === 'wire') {
        if (surface === 'component-pin' || surface === 'esp32-pin') {
          // Get pin info from the intersected object's userData
          const userData = intersect.object.userData
          const pinInfo = {
            type: surface === 'esp32-pin' ? 'esp32' : 'component',
            pinNumber: userData?.pinNumber,
            componentId: userData?.componentId,
            componentType: userData?.componentType,
            pinType: userData?.pinType
          }
          intersect.pinInfo = pinInfo
          console.log('[PlacementManager] ✓ Found valid pin:', pinInfo)
          validIntersect = intersect

          // Track currently hovered pin for wire validation
          setCurrentHoveredPin(pinInfo)

          // Update hover info for tooltip - only if it changed
          let newHoverInfo = null
          if (pinInfo.type === 'esp32') {
            // Check if this is a ground pin
            const isGround = pinInfo.pinNumber === 1 || pinInfo.pinNumber === 2 ||
                           pinInfo.pinNumber === 38 || pinInfo.pinNumber === 39
            newHoverInfo = isGround ? `pin (${pinInfo.pinNumber}) GND` : `pin (${pinInfo.pinNumber})`
          } else {
            // Find component to get color/type info
            const component = placedComponents.find(c => c.id === pinInfo.componentId)
            if (component) {
              if (component.type === 'led') {
                const colorName = component.props.color === '#ff0000' ? 'red' :
                                  component.props.color === '#00ff00' ? 'green' : 'yellow'
                const pinNum = pinInfo.pinType === 'cathode' ? '0' : '1'
                newHoverInfo = `${colorName} led (${pinNum})`
              } else if (component.type === 'button') {
                const pinNum = pinInfo.pinType === 'terminal-1' ? '0' : '1'
                newHoverInfo = `button (${pinNum})`
              }
            } else {
              // Fallback if component not found
              newHoverInfo = `${pinInfo.componentType || 'component'} pin`
            }
          }

          // Only update if hover info changed
          if (newHoverInfo !== lastHoveredPinInfo.current) {
            lastHoveredPinInfo.current = newHoverInfo
            setHoveredPinInfoDirect(newHoverInfo)
          }
          break
        }
      }
    }

    // Clear hover info if no valid pin found
    if (!validIntersect && selectedItem === 'wire') {
      if (lastHoveredPinInfo.current !== null) {
        lastHoveredPinInfo.current = null
        setHoveredPinInfoDirect(null)
      }
      setCurrentHoveredPin(null)
    }

    if (validIntersect) {
      // Use snapped position if available (smart surface), otherwise use raw intersection
      const worldPoint = validIntersect.snappedPoint || validIntersect.point

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

  // Handle right-click cancel
  useEffect(() => {
    if (rightClickPending.current && wireInProgress) {
      rightClickPending.current = false
      console.log('[PlacementManager] ❌ Wire placement canceled (right-click)')
      cancelWire()
    }
  }, [rightClickPending.current, wireInProgress, cancelWire])

  // Handle pending clicks in the render loop
  useEffect(() => {
    if (clickPending.current && showGhost && isEditMode && selectedItem) {
      clickPending.current = false

      // Handle wire placement differently
      if (selectedItem === 'wire') {
        // IMPORTANT: Only allow wire attachment if currently hovering a valid pin
        // This prevents accidental wire placement from stray clicks
        if (!currentHoveredPin) {
          console.log('[PlacementManager] ❌ Wire click rejected - not hovering a valid pin')
          return
        }
        // Find the pin we clicked on
        raycaster.current.setFromCamera(mouse.current, camera)
        const intersects = raycaster.current.intersectObjects(scene.children, true)

        for (const intersect of intersects) {
          if (intersect.object.userData?.ignoreRaycast) continue

          let surface = null
          let obj = intersect.object
          while (obj && !surface) {
            surface = obj.userData?.placementSurface
            obj = obj.parent
          }

          if (surface === 'component-pin' || surface === 'esp32-pin') {
            const pinInfo = {
              type: surface === 'esp32-pin' ? 'esp32' : 'component',
              pinNumber: intersect.object.userData?.pinNumber,
              componentId: intersect.object.userData?.componentId,
              componentType: intersect.object.userData?.componentType
            }

            console.log('[PlacementManager] 📍 Clicked pin:', pinInfo, 'at world position:', ghostPosition)

            if (!wireInProgress) {
              // Start new wire
              console.log('[PlacementManager] 🔌 WIRE STARTED from pin:', pinInfo)
              console.log('[PlacementManager] 💡 Click another pin to complete, or press ESC/Right-click to cancel')
              startWire(pinInfo, ghostPosition)
            } else {
              // Complete wire
              console.log('[PlacementManager] ✅ WIRE COMPLETED to pin:', pinInfo)
              completeWire(pinInfo, ghostPosition)
            }
            break
          }
        }
      } else {
        // Handle normal component placement (LED, button)
        let componentType = selectedItem
        let props = {}

        if (selectedItem.startsWith('led-')) {
          componentType = 'led'
          const color = selectedItem.split('-')[1]
          props.color = color === 'red' ? '#ff0000' : color === 'green' ? '#00ff00' : '#ffff00'
        } else if (selectedItem === 'button') {
          componentType = 'button'
        }

        // COORDINATE SPACE UNIFIED: World space now matches component space
        // No transformation needed - use ghostPosition directly
        const localPosition = [...ghostPosition]

        console.log('[PlacementManager] Placing component:', componentType)
        addComponent(componentType, localPosition, props)
      }
    }
  }, [showGhost, clickPending.current, isEditMode, selectedItem, ghostPosition, addComponent, startWire, completeWire, wireInProgress, camera, scene, mouse, currentHoveredPin, cancelWire])

  // Render ghost preview with semi-transparent glowing geometry
  const renderGhost = () => {
    // Don't render component ghost if wire is selected
    if (selectedItem === 'wire') return null
    if (selectedItem.startsWith('led-')) {
      const color = selectedItem.split('-')[1]
      const ledColor = color === 'red' ? '#ff0000' : color === 'green' ? '#00ff00' : '#ffff00'
      return (
        <group position={ghostPosition} scale={0.6}>
          {/* LED body - simple cylinder */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial
              color={ledColor}
              transparent
              opacity={0.7}
              emissive={ledColor}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* LED legs */}
          <mesh position={[-0.015, -0.02, 0]}>
            <boxGeometry args={[0.01, 0.04, 0.01]} />
            <meshStandardMaterial color="#ffff00" transparent opacity={0.7} emissive="#ffff00" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.015, -0.02, 0]}>
            <boxGeometry args={[0.01, 0.04, 0.01]} />
            <meshStandardMaterial color="#ffff00" transparent opacity={0.7} emissive="#ffff00" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )
    } else if (selectedItem === 'button') {
      return (
        <group position={ghostPosition} scale={0.6}>
          {/* Button base */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.08]} />
            <meshStandardMaterial color="#00ffff" transparent opacity={0.7} emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>
          {/* Button top */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
            <meshStandardMaterial color="#00ffff" transparent opacity={0.7} emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )
    } else if (selectedItem === 'wire') {
      return (
        <mesh position={ghostPosition}>
          <boxGeometry args={[0.02, 0.02, 1]} />
          <meshStandardMaterial color="#4CAF50" transparent opacity={0.7} emissive="#4CAF50" emissiveIntensity={0.5} />
        </mesh>
      )
    }
    return null
  }

  // Render wire preview if wire is in progress
  if (isEditMode && selectedItem === 'wire' && wireInProgress && showGhost) {
    return (
      <Wire
        startPos={wireInProgress.startPos}
        endPos={ghostPosition}
        color="#ffff00"
        inProgress={true}
      />
    )
  }

  // Render normal ghost preview for components
  if (!isEditMode || !selectedItem || !showGhost) return null

  return (
    <>
      {/* Ghost preview */}
      {renderGhost()}
    </>
  )
}
