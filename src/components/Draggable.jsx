import { useState, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCoding } from '../CodingContext'

/**
 * Draggable Component - Makes 3D objects draggable with grid snapping
 *
 * Props:
 * - position: [x, y, z] initial position
 * - rotation: [x, y, z] rotation in radians (default [0, 0, 0])
 * - children: The 3D object to make draggable
 * - componentId: ID of the component (for deletion)
 * - gridSize: Grid snapping increment (default 0.05)
 * - hoverHeight: How high to lift when dragging (default 0.1)
 *
 * Usage:
 * - Press 'G' to toggle edit mode
 * - In edit mode, Ctrl+click and drag objects
 * - Right-click to delete placed components
 */
export default function Draggable({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
  componentId = null,
  gridSize = 0.05,
  hoverHeight = 0.1
}) {
  const [currentPosition, setCurrentPosition] = useState(position)
  const [isDragging, setIsDragging] = useState(false)
  const groupRef = useRef()
  const dragStateRef = useRef({ isDragging: false })
  const { camera, gl, raycaster, size } = useThree()
  const { isEditMode, removeComponent } = useCoding()

  // Snap coordinate to grid
  const snapToGrid = (value) => {
    return Math.round(value / gridSize) * gridSize
  }

  // Raycast to find intersection with workbench plane
  const getWorldPosition = (clientX, clientY) => {
    // Get normalized device coordinates
    const x = (clientX / size.width) * 2 - 1
    const y = -(clientY / size.height) * 2 + 1

    // Set up raycaster
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    // Create a plane at the object's initial Y height (so it stays on the workbench)
    const planeHeight = position[1]
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeHeight)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    return intersection
  }

  // Handle mouse/pointer move for dragging
  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragStateRef.current.isDragging || !isEditMode) return

      const worldPos = getWorldPosition(event.clientX, event.clientY)

      if (worldPos) {
        // COORDINATE SPACE UNIFIED: World space now matches component space
        // No transformation needed - use world position directly
        const snappedX = snapToGrid(worldPos.x)
        const snappedZ = snapToGrid(worldPos.z)

        // Keep original Y position (will be lifted in render)
        setCurrentPosition([snappedX, position[1], snappedZ])
      }
    }

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
