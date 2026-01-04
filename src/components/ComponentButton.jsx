import { useState } from 'react'
import { useCoding } from '../CodingContext'
import { Outlines } from '@react-three/drei'

export default function ComponentButton({ position = [0, 0, 0], connectedPin }) {
  const { setPinInput } = useCoding()
  const [isPressed, setIsPressed] = useState(false)

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
    <group position={position}>
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

      <mesh position={[-0.03, -0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 6]} />
        <meshToonMaterial color="#d0d0d0" />
      </mesh>

      <mesh position={[0.03, -0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 6]} />
        <meshToonMaterial color="#d0d0d0" />
      </mesh>
    </group>
  )
}
