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
   * subscription system. This board "subscribes" to pin changes and only
   * updates its own display. Much faster! Like subscribing to a YouTube
   * channel - you only get notified of new videos you care about.
   */
  useEffect(() => {
    // Function that runs when ANY pin state changes
    const updatePinStates = () => {
      // Copy current pin states into our local state
      setPinStates({ ...pinStatesRef.current })
    }

    // Get initial pin states when board first loads
    updatePinStates()

    // Subscribe to future pin changes
    // The return value is a cleanup function that unsubscribes when component unmounts
    return subscribeToPinStates(updatePinStates)
  }, [pinStatesRef, subscribeToPinStates])

  // ========================================================================
  // EVENT HANDLERS (User Interaction)
  // ========================================================================

  /**
   * handleClick - Prevents clicks on board from affecting other objects
   * e.stopPropagation() = "Don't let this click bubble up to parent objects"
   */
  const handleClick = (e) => {
    e.stopPropagation()
  }

  // ========================================================================
  // PIN CONFIGURATION (Hardware Layout)
  // ========================================================================

  /**
   * REAL ESP32-S3 PIN LAYOUT:
   * The ESP32-S3 DevKit has 40 pins total:
   * - Left side: Pins 0-19
   * - Right side: Pins 20-39
   *
   * GROUND (GND) PINS:
   * Like a real circuit board, we need ground pins to complete electrical
   * circuits. Without ground, electricity has nowhere to return to!
   * - Pins 1, 2: Ground (left side)
   * - Pins 38, 39: Ground (right side)
   *
   * Think of GND like the negative terminal on a battery.
   */

  // LEFT SIDE PINS (0-19)
  const leftPins = []
  for (let i = 0; i < 20; i++) {
    const pinNumber = i
    const isGround = pinNumber === 1 || pinNumber === 2
    leftPins.push({
      index: i,                                    // Array position (0-19)
      pinNumber: pinNumber,                        // Actual pin number (0-19)
      isGround: isGround,                         // Is this a ground pin?
      label: isGround ? 'GND' : pinNumber.toString(), // Label shows "GND" or number
      x: -0.95,                                    // Position: left side of board
      z: -2.2 + (i * 0.22)                        // Position: spaced evenly down board
    })
  }

  // RIGHT SIDE PINS (20-39)
  const rightPins = []
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
            {/* Plastic Header Base */}
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.08, 0.11, 0.08]} />
              <meshToonMaterial color="#0a0a0a" />
            </mesh>

            {/* Metal Pin - glows white when hovered */}
            <mesh
              position={[0, 0.2, 0]}
              userData={{ placementSurface: 'esp32-pin', pinNumber: pin.pinNumber, pinIndex: pin.index }}
              onPointerOver={(e) => {
                if (wireToolActive) {
                  e.stopPropagation()
                  setHoveredPin(pin.index)
                }
              }}
              onPointerOut={(e) => {
                if (wireToolActive) {
                  e.stopPropagation()
                  setHoveredPin(null)
                }
              }}
            >
              <boxGeometry args={[0.025, 0.3, 0.025]} />
              <meshToonMaterial
                color={isPinHigh ? '#ff3333' : (isHovered ? '#ffffff' : '#ffcc00')}
                emissive={isPinHigh ? '#ff0000' : (isHovered ? '#ffffff' : '#000000')}
                emissiveIntensity={isPinHigh ? 1 : (isHovered ? 3.0 : 0)}
              />
              <Outlines thickness={0.005} color="black" />
            </mesh>

            {/* Blue cylinder indicator when hovered - transparent shell around pin */}
            {isHovered && (
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
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
              position={[0, 0.2, 0]}
              userData={{ placementSurface: 'esp32-pin', pinNumber: pin.pinNumber, pinIndex: pin.index }}
              onPointerOver={(e) => {
                if (wireToolActive) {
                  e.stopPropagation()
                  setHoveredPin(pin.index)
                }
              }}
              onPointerOut={(e) => {
                if (wireToolActive) {
                  e.stopPropagation()
                  setHoveredPin(null)
                }
              }}
            >
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Pin Label - On board face next to pin, rotated 90° CCW, larger and positioned correctly */}
            {wireToolActive && (
              <Text
                position={[pin.x < 0 ? -0.4 : 0.4, 0.06, pin.z]}
                rotation={[-Math.PI / 2, 0, pin.x < 0 ? Math.PI / 2 : -Math.PI / 2]}
                fontSize={0.15}
                color={pin.isGround ? '#ffff00' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.015}
                outlineColor="#000000"
              >
                {pin.label}
              </Text>
            )}

            {/* Pin Glow */}
            {isPinHigh && (
              <pointLight
                position={[0, 0.25, 0]}
                intensity={1.5}
                distance={0.5}
                color="#ff0000"
              />
            )}
          </group>
        )
      })}

      {/* Capacitors (decorative) */}
      <mesh position={[-0.4, 0.08, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshToonMaterial color="#cc6633" />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      <mesh position={[0.4, 0.08, 1.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshToonMaterial color="#cc6633" />
        <Outlines thickness={0.008} color="black" />
      </mesh>
    </group>
  )
}
