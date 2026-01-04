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

    // Calculate midpoint and add a slight upward arc
    const mid = start.clone().add(end).multiplyScalar(0.5)
    const distance = start.distanceTo(end)
    mid.y += Math.min(distance * 0.2, 0.3) // Arc height based on distance

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
