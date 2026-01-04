import { RigidBody } from '@react-three/rapier'
import { RoundedBox, Outlines } from '@react-three/drei'
import { useCoding } from '../CodingContext'

export default function Workbench({ position = [0, 1, 0] }) {
  const { setIsCoding, isEditMode } = useCoding()

  const handleClick = (event) => {
    // Only open coding overlay if not in edit mode
    if (!isEditMode) {
      event.stopPropagation()
      console.log('Clicked')
      setIsCoding(true)
    }
  }

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group onClick={handleClick}>
        {/* Table Top - Vibrant Blue Work Mat */}
        <RoundedBox args={[2.5, 0.15, 1.2]} radius={0.02} smoothness={4} position={[0, 0, 0]} userData={{ placementSurface: 'workbench' }}>
          <meshToonMaterial color="#3399ff" />
          <Outlines thickness={0.02} color="black" />
        </RoundedBox>

        {/* Wooden Frame Under Mat */}
        <RoundedBox args={[2.6, 0.1, 1.3]} radius={0.01} smoothness={4} position={[0, -0.12, 0]}>
          <meshToonMaterial color="#cc8844" />
          <Outlines thickness={0.015} color="black" />
        </RoundedBox>

        {/* Leg 1 - Front Left */}
        <mesh position={[-1.1, -0.9, -0.5]}>
          <cylinderGeometry args={[0.1, 0.12, 1.6, 8]} />
          <meshToonMaterial color="#996633" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Leg 2 - Front Right */}
        <mesh position={[1.1, -0.9, -0.5]}>
          <cylinderGeometry args={[0.1, 0.12, 1.6, 8]} />
          <meshToonMaterial color="#996633" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Leg 3 - Back Left */}
        <mesh position={[-1.1, -0.9, 0.5]}>
          <cylinderGeometry args={[0.1, 0.12, 1.6, 8]} />
          <meshToonMaterial color="#996633" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Leg 4 - Back Right */}
        <mesh position={[1.1, -0.9, 0.5]}>
          <cylinderGeometry args={[0.1, 0.12, 1.6, 8]} />
          <meshToonMaterial color="#996633" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Cross Brace - Front */}
        <RoundedBox args={[2.4, 0.08, 0.08]} radius={0.01} smoothness={4} position={[0, -1.3, -0.5]}>
          <meshToonMaterial color="#bb7744" />
          <Outlines thickness={0.01} color="black" />
        </RoundedBox>

        {/* Cross Brace - Back */}
        <RoundedBox args={[2.4, 0.08, 0.08]} radius={0.01} smoothness={4} position={[0, -1.3, 0.5]}>
          <meshToonMaterial color="#bb7744" />
          <Outlines thickness={0.01} color="black" />
        </RoundedBox>
      </group>
    </RigidBody>
  )
}
