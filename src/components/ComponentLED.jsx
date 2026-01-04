import { useState, useEffect } from 'react'
import { useCoding } from '../CodingContext'
import { Outlines, Text } from '@react-three/drei'

export default function ComponentLED({ position = [0, 0, 0], componentId, connectedPin, color = '#ff0000' }) {
  const { pinStatesRef, subscribeToPinStates, getComponentPin, selectedItem, isEditMode } = useCoding()
  const [isOn, setIsOn] = useState(false)
  const [hoveredPin, setHoveredPin] = useState(null)

  // Check if wire tool is active
  const wireToolActive = isEditMode && selectedItem === 'wire'

  // Get LED color name
  const getColorName = (ledColor) => {
    switch (ledColor.toLowerCase()) {
      case '#ff0000': return 'red'
      case '#00ff00': return 'green'
      case '#ffff00': return 'yellow'
      default: return 'led'
    }
  }

  const colorName = getColorName(color)

  // Use wired pin if available, otherwise fall back to connectedPin (for backward compatibility)
  const actualPin = componentId ? getComponentPin(componentId) : connectedPin

  // Debug logging for wiring
  useEffect(() => {
    if (componentId) {
      console.log(`[LED ${componentId}] Wired to pin:`, actualPin, '| Pin state:', pinStatesRef.current[actualPin])
    }
  }, [componentId, actualPin])

  // Subscribe to pin state changes
  useEffect(() => {
    const updatePinState = () => {
      if (actualPin !== undefined) {
        const newState = pinStatesRef.current[actualPin] === 1
        console.log(`[LED ${componentId || 'unknown'}] Pin ${actualPin} state:`, pinStatesRef.current[actualPin], '→ LED:', newState ? 'ON' : 'OFF')
        setIsOn(newState)
      } else {
        if (componentId) {
          console.log(`[LED ${componentId}] No pin connected, LED OFF`)
        }
        setIsOn(false)
      }
    }

    // Initial state
    updatePinState()

    // Subscribe to updates
    return subscribeToPinStates(updatePinState)
  }, [actualPin, pinStatesRef, subscribeToPinStates, componentId])

  const handleClick = (e) => {
    e.stopPropagation()
  }

  // Determine off-state color based on LED color
  const getOffColor = (ledColor) => {
    switch (ledColor.toLowerCase()) {
      case '#ff0000': // Red
        return '#4a0000'
      case '#00ff00': // Green
        return '#004a00'
      case '#ffff00': // Yellow
        return '#4a4a00'
      default:
        return '#2a2a2a' // Generic dark gray
    }
  }

  const offColor = getOffColor(color)

  return (
    <group position={position} onClick={handleClick}>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial
          color={isOn ? color : offColor}
          emissive={isOn ? color : '#000000'}
          emissiveIntensity={isOn ? 1.5 : 0}
        />
        <Outlines thickness={0.01} color="black" />
      </mesh>

      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.08, 8]} />
        <meshToonMaterial
          color={isOn ? color : offColor}
          emissive={isOn ? color : '#000000'}
          emissiveIntensity={isOn ? 1 : 0}
        />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* Cathode Pin (left, pin 0) */}
      <group>
        <mesh
          position={[-0.02, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'led', pinType: 'cathode', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('cathode')
            }
          }}
          onPointerOut={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin(null)
            }
          }}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
          <meshToonMaterial
            color={hoveredPin === 'cathode' ? '#ffffff' : '#d0d0d0'}
            emissive={hoveredPin === 'cathode' ? '#ffffff' : '#000000'}
            emissiveIntensity={hoveredPin === 'cathode' ? 3.0 : 0}
          />
        </mesh>

        {/* Blue cylinder indicator when hovered - transparent shell around pin */}
        {hoveredPin === 'cathode' && (
          <mesh position={[-0.02, -0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
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
          position={[-0.02, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'led', pinType: 'cathode', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('cathode')
            }
          }}
          onPointerOut={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin(null)
            }
          }}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Anode Pin (right, pin 1) */}
      <group>
        <mesh
          position={[0.02, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'led', pinType: 'anode', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('anode')
            }
          }}
          onPointerOut={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin(null)
            }
          }}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
          <meshToonMaterial
            color={hoveredPin === 'anode' ? '#ffffff' : '#d0d0d0'}
            emissive={hoveredPin === 'anode' ? '#ffffff' : '#000000'}
            emissiveIntensity={hoveredPin === 'anode' ? 3.0 : 0}
          />
        </mesh>

        {/* Blue cylinder indicator when hovered - transparent shell around pin */}
        {hoveredPin === 'anode' && (
          <mesh position={[0.02, -0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
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
          position={[0.02, -0.05, 0]}
          userData={{ placementSurface: 'component-pin', componentType: 'led', pinType: 'anode', componentId }}
          onPointerOver={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin('anode')
            }
          }}
          onPointerOut={(e) => {
            if (wireToolActive) {
              e.stopPropagation()
              setHoveredPin(null)
            }
          }}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {isOn && (
        <pointLight
          position={[0, 0.15, 0]}
          intensity={3}
          distance={1.5}
          color={color}
        />
      )}
    </group>
  )
}
