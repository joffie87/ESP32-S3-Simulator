import { Outlines } from '@react-three/drei'

export default function PlayerModel() {
  return (
    <group name="player" userData={{ isPlayer: true }}>
      {/* HEAD */}
      <group position={[0, 0.65, 0]}>
        {/* Skin tone sphere */}
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshToonMaterial color="#ffcc99" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Sunglasses - Left lens */}
        <mesh position={[-0.08, 0.02, 0.12]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshToonMaterial color="#111111" />
        </mesh>

        {/* Sunglasses - Right lens */}
        <mesh position={[0.08, 0.02, 0.12]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshToonMaterial color="#111111" />
        </mesh>

        {/* Sunglasses - Bridge */}
        <mesh position={[0, 0.02, 0.13]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.02]} />
          <meshToonMaterial color="#111111" />
        </mesh>
      </group>

      {/* NECK */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 8]} />
        <meshToonMaterial color="#ffcc99" />
      </mesh>

      {/* TORSO - Tactical Vest */}
      <group position={[0, 0.2, 0]}>
        {/* Main vest body */}
        <mesh>
          <cylinderGeometry args={[0.18, 0.16, 0.5, 8]} />
          <meshToonMaterial color="#2a2a2a" />
          <Outlines thickness={0.015} color="black" />
        </mesh>

        {/* Plate carrier front */}
        <mesh position={[0, 0.05, 0.17]}>
          <boxGeometry args={[0.25, 0.35, 0.04]} />
          <meshToonMaterial color="#3a3a3a" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Tactical pouches */}
        <mesh position={[-0.1, -0.1, 0.18]}>
          <boxGeometry args={[0.08, 0.12, 0.05]} />
          <meshToonMaterial color="#4a4a2a" />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        <mesh position={[0.1, -0.1, 0.18]}>
          <boxGeometry args={[0.08, 0.12, 0.05]} />
          <meshToonMaterial color="#4a4a2a" />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* LEFT ARM */}
      <group position={[-0.22, 0.25, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.05, 0.045, 0.2, 6]} />
          <meshToonMaterial color="#2a2a2a" />
          <Outlines thickness={0.01} color="black" />
        </mesh>

        {/* Forearm */}
        <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.045, 0.04, 0.18, 6]} />
          <meshToonMaterial color="#ffcc99" />
          <Outlines thickness={0.01} color="black" />
        </mesh>

        {/* Hand (glove) */}
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.055, 6, 6]} />
          <meshToonMaterial color="#1a1a1a" />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group position={[0.22, 0.25, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.05, 0.045, 0.2, 6]} />
          <meshToonMaterial color="#2a2a2a" />
          <Outlines thickness={0.01} color="black" />
        </mesh>

        {/* Forearm */}
        <mesh position={[0, -0.25, 0]} rotation={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.045, 0.04, 0.18, 6]} />
          <meshToonMaterial color="#ffcc99" />
          <Outlines thickness={0.01} color="black" />
        </mesh>

        {/* Hand (glove) */}
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.055, 6, 6]} />
          <meshToonMaterial color="#1a1a1a" />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* LEFT LEG */}
      <group position={[-0.08, -0.05, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.35, 6]} />
          <meshToonMaterial color="#3a3a5a" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Shin */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.055, 0.3, 6]} />
          <meshToonMaterial color="#3a3a5a" />
          <Outlines thickness={0.01} color="black" />
        </mesh>

        {/* Boot */}
        <mesh position={[0, -0.7, 0.02]}>
          <boxGeometry args={[0.12, 0.08, 0.18]} />
          <meshToonMaterial color="#1a1a1a" />
          <Outlines thickness={0.01} color="black" />
        </mesh>
      </group>

      {/* RIGHT LEG */}
      <group position={[0.08, -0.05, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.35, 6]} />
          <meshToonMaterial color="#3a3a5a" />
          <Outlines thickness={0.012} color="black" />
        </mesh>

        {/* Shin */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.055, 0.3, 6]} />
          <meshToonMaterial color="#3a3a5a" />
          <Outlines thickness={0.01} color="black" />
        </mesh>

        {/* Boot */}
        <mesh position={[0, -0.7, 0.02]}>
          <boxGeometry args={[0.12, 0.08, 0.18]} />
          <meshToonMaterial color="#1a1a1a" />
          <Outlines thickness={0.01} color="black" />
        </mesh>
      </group>
    </group>
  )
}
