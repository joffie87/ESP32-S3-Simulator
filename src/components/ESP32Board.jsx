import { useRef } from 'react'
import { RoundedBox, Text, Outlines } from '@react-three/drei'
import { useCoding } from '../CodingContext'

export default function ESP32Board({ position = [0, 0, 0] }) {
  const { pinStates } = useCoding()
  const boardRef = useRef()

  const handleClick = (e) => {
    e.stopPropagation()
  }

  const leftPins = []
  for (let i = 0; i < 20; i++) {
    leftPins.push({ index: i, x: -0.95, z: -2.2 + (i * 0.22) })
  }

  const rightPins = []
  for (let i = 0; i < 20; i++) {
    rightPins.push({ index: i + 20, x: 0.95, z: -2.2 + (i * 0.22) })
  }

  const allPins = [...leftPins, ...rightPins]

  return (
    <group position={position} ref={boardRef} onClick={handleClick}>
      {/* PCB - Main Board */}
      <RoundedBox args={[2.2, 0.1, 5]} radius={0.02} smoothness={4} position={[0, 0, 0]}>
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

      {/* Shielding - The Silver Chip */}
      <RoundedBox args={[1.4, 0.15, 1.2]} radius={0.01} smoothness={4} position={[0, 0.125, 0.5]}>
        <meshToonMaterial color="#d4d4d4" />
        <Outlines thickness={0.012} color="black" />
      </RoundedBox>

      {/* ESP32-S3 Text */}
      <Text
        position={[0, 0.21, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
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

      {/* Reset Button */}
      <mesh position={[-0.6, 0.11, -1.8]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.6, 0.15, -1.8]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshToonMaterial color="#ff4444" />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* Boot Button */}
      <mesh position={[0.6, 0.11, -1.8]}>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.6, 0.15, -1.8]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshToonMaterial color="#4444ff" />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* Pin Headers */}
      {allPins.map((pin) => {
        const isPinHigh = pinStates[pin.index] === 1

        return (
          <group key={pin.index} position={[pin.x, 0, pin.z]}>
            {/* Plastic Header Base */}
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.08, 0.11, 0.08]} />
              <meshToonMaterial color="#0a0a0a" />
            </mesh>

            {/* Metal Pin */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.025, 0.3, 0.025]} />
              <meshToonMaterial
                color={isPinHigh ? '#ff3333' : '#ffcc00'}
                emissive={isPinHigh ? '#ff0000' : '#000000'}
                emissiveIntensity={isPinHigh ? 1 : 0}
              />
              <Outlines thickness={0.005} color="black" />
            </mesh>

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
