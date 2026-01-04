import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCoding } from '../CodingContext'
import ComponentLED from './ComponentLED'
import ComponentButton from './ComponentButton'
import Wire from './Wire'
import * as THREE from 'three'

export default function PlacementManager() {
  const { isEditMode, selectedItem, addComponent, startWire, completeWire, wireInProgress, cancelWire, setHoveredPinInfo, placedComponents } = useCoding()
  const [ghostPosition, setGhostPosition] = useState([0, 0, 0])
  const [showGhost, setShowGhost] = useState(false)
  const { camera, gl, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const clickPending = useRef(false)

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
          console.log('[PlacementManager] ✓ Found valid breadboard placement at', intersect.point)
          validIntersect = intersect
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

          // Update hover info for tooltip
          if (pinInfo.type === 'esp32') {
            // Check if this is a ground pin
            const isGround = pinInfo.pinNumber === 1 || pinInfo.pinNumber === 2 ||
                           pinInfo.pinNumber === 38 || pinInfo.pinNumber === 39
            setHoveredPinInfo(isGround ? `pin (${pinInfo.pinNumber}) GND` : `pin (${pinInfo.pinNumber})`)
          } else {
            // Find component to get color/type info
            const component = placedComponents.find(c => c.id === pinInfo.componentId)
            if (component) {
              if (component.type === 'led') {
                const colorName = component.props.color === '#ff0000' ? 'red' :
                                  component.props.color === '#00ff00' ? 'green' : 'yellow'
                const pinNum = pinInfo.pinType === 'cathode' ? '0' : '1'
                setHoveredPinInfo(`${colorName} led (${pinNum})`)
              } else if (component.type === 'button') {
                const pinNum = pinInfo.pinType === 'terminal-1' ? '0' : '1'
                setHoveredPinInfo(`button (${pinNum})`)
              }
            } else {
              // Fallback if component not found
              setHoveredPinInfo(`${pinInfo.componentType || 'component'} pin`)
            }
          }
          break
        }
      }
    }

    // Clear hover info if no valid pin found
    if (!validIntersect && selectedItem === 'wire') {
      setHoveredPinInfo(null)
    }

    if (validIntersect) {
      // Get the intersection point in world space
      const worldPoint = validIntersect.point

      // Snap to 0.05 grid (breadboard hole spacing)
      // Keep in world space for ghost preview
      const snappedX = Math.round(worldPoint.x / 0.05) * 0.05
      const snappedY = Math.round(worldPoint.y / 0.05) * 0.05 + 0.03 // Slight offset above surface
      const snappedZ = Math.round(worldPoint.z / 0.05) * 0.05

      setGhostPosition([snappedX, snappedY, snappedZ])
      if (!showGhost) {
        console.log('[PlacementManager] Showing ghost at world position', [snappedX, snappedY, snappedZ])
        setShowGhost(true)
      }
    } else {
      if (showGhost) setShowGhost(false)
    }
  })

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

      console.log('[PlacementManager] Click detected, showGhost:', showGhost)

      // Signal that we want to place a component on the next frame
      // This ensures showGhost is up to date
      clickPending.current = true
    }

    if (isEditMode && selectedItem) {
      console.log('[PlacementManager] Attaching event handlers for', selectedItem)
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('click', handleClick)
    }

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [isEditMode, selectedItem, gl, showGhost])

  // Track the last valid intersect for click handling
  const lastValidIntersect = useRef(null)

  // Store last valid intersect for click handling
  useEffect(() => {
    if (showGhost && isEditMode && selectedItem) {
      // The valid intersect is stored during useFrame
      // We'll use ghostPosition and check raycasting again on click
    }
  }, [showGhost, isEditMode, selectedItem])

  // Handle pending clicks in the render loop
  useEffect(() => {
    if (clickPending.current && showGhost && isEditMode && selectedItem) {
      clickPending.current = false

      // Handle wire placement differently
      if (selectedItem === 'wire') {
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
              console.log('[PlacementManager] 🔌 Starting new wire from pin:', pinInfo)
              startWire(pinInfo, ghostPosition)
            } else {
              // Complete wire
              console.log('[PlacementManager] ✅ Completing wire to pin:', pinInfo)
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

        // Transform world position to local position (for rotated group)
        const localPosition = [
          -ghostPosition[0],
          ghostPosition[1],
          -ghostPosition[2]
        ]

        console.log('[PlacementManager] Placing component:', componentType)
        addComponent(componentType, localPosition, props)
      }
    }
  }, [showGhost, clickPending.current, isEditMode, selectedItem, ghostPosition, addComponent, startWire, completeWire, wireInProgress, camera, scene, mouse])

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
