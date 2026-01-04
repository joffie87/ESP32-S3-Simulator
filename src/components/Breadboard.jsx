import { Outlines } from '@react-three/drei'

export default function Breadboard({ position = [0, 0, 0] }) {
  const holes = []
  const rows = 10
  const cols = 30
  const spacing = 0.05

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      holes.push({
        x: -0.7 + (col * spacing),
        z: -0.2 + (row * spacing)
      })
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
  }

  return (
    <group position={position} onClick={handleClick} userData={{ placementSurface: 'breadboard' }}>
      <mesh position={[0, 0, 0]} userData={{ placementSurface: 'breadboard' }}>
        <boxGeometry args={[1.6, 0.08, 0.6]} />
        <meshToonMaterial color="#eeeeee" />
        <Outlines thickness={0.015} color="black" />
      </mesh>

      {holes.map((hole, index) => (
        <mesh key={index} position={[hole.x, 0.04, hole.z]} rotation={[Math.PI / 2, 0, 0]} userData={{ placementSurface: 'breadboard' }}>
          <cylinderGeometry args={[0.015, 0.015, 0.09, 6]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}
