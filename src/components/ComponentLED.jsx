import { useCoding } from '../CodingContext'
import { Outlines } from '@react-three/drei'

export default function ComponentLED({ position = [0, 0, 0], connectedPin, color = '#ff0000' }) {
  const { pinStates } = useCoding()
  const isOn = pinStates[connectedPin] === 1

  const handleClick = (e) => {
    e.stopPropagation()
  }

  return (
    <group position={position} onClick={handleClick}>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial
          color={isOn ? color : '#4a0000'}
          emissive={isOn ? color : '#000000'}
          emissiveIntensity={isOn ? 1.5 : 0}
        />
        <Outlines thickness={0.01} color="black" />
      </mesh>

      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.08, 8]} />
        <meshToonMaterial
          color={isOn ? color : '#4a0000'}
          emissive={isOn ? color : '#000000'}
          emissiveIntensity={isOn ? 1 : 0}
        />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      <mesh position={[-0.02, -0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
        <meshToonMaterial color="#d0d0d0" />
      </mesh>

      <mesh position={[0.02, -0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
        <meshToonMaterial color="#d0d0d0" />
      </mesh>

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
