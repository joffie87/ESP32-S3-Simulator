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
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('terminal-2')
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
            color={hoveredPin === 'terminal-2' ? '#ffffff' : '#d0d0d0'}
            emissive={hoveredPin === 'terminal-2' ? '#ffffff' : '#000000'}
            emissiveIntensity={hoveredPin === 'terminal-2' ? 3.0 : 0}
          />
        </mesh>

        {/* Blue cylinder indicator when hovered - transparent shell around pin */}
        {hoveredPin === 'terminal-2' && (
          <mesh position={[0.03, -0.05, 0]}>
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
          position={[0.03, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'button', pinType: 'terminal-2', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('terminal-2')
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
      </group>
      {/* End internal rotation fix */}
    </group>
  )
}
