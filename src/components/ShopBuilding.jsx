/**
 * ============================================================================
 * SHOPBUILDING.JSX - REPAIR SHOP KIOSK STRUCTURE
 * ============================================================================
 *
 * This component creates a 12x12 unit repair shop with:
 * - An open window counter facing the plaza
 * - A functional door on the right side
 * - Proper non-overlapping walls
 *
 * Building dimensions: 12 wide (X) × 12 deep (Z) × 5 tall (Y)
 */

import { useState, useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Outlines, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * DOOR COMPONENT - Functional swinging door
 * Uses kinematicPosition physics for smooth animation
 */
function Door({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [isOpen, setIsOpen] = useState(false)
  const doorRef = useRef()
  const targetRotation = useRef(0)
  const currentRotation = useRef(0)

  const handleClick = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
    // Swing 90 degrees inward
    targetRotation.current = isOpen ? 0 : Math.PI / 2
  }

  useFrame(() => {
    if (doorRef.current) {
      const diff = targetRotation.current - currentRotation.current
      if (Math.abs(diff) > 0.01) {
        currentRotation.current += diff * 0.1
        const quaternion = new THREE.Quaternion()
        quaternion.setFromEuler(new THREE.Euler(0, currentRotation.current, 0))
        doorRef.current.setNextKinematicRotation(quaternion)
      }
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Door Frame - Static black frame */}
      {/* Left post */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshToonMaterial color="#2a2a2a" />
      </mesh>
      {/* Right post */}
      <mesh position={[0, 1.2, 1]} castShadow>
        <boxGeometry args={[0.15, 2.4, 0.15]} />
        <meshToonMaterial color="#2a2a2a" />
      </mesh>
      {/* Top frame */}
      <mesh position={[0, 2.4, 0.5]} castShadow>
        <boxGeometry args={[0.15, 0.15, 1]} />
        <meshToonMaterial color="#2a2a2a" />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, 0.2, 0.5]} castShadow>
        <boxGeometry args={[0.15, 0.15, 1]} />
        <meshToonMaterial color="#2a2a2a" />
      </mesh>

      {/* Door Panel - Hinged on one side */}
      <RigidBody
        ref={doorRef}
        type="kinematicPosition"
        position={[0, 1.2, 0.075]}
        colliders="cuboid"
      >
        <group onClick={handleClick}>
          <mesh position={[0, 0, 0.45]} castShadow>
            <boxGeometry args={[0.1, 2.2, 0.9]} />
            <meshToonMaterial color="#e8f4f8" />
            <Outlines thickness={0.02} color="black" />
          </mesh>

          {/* Handle */}
          <mesh position={[0.08, 0, 0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
            <meshToonMaterial color="#ffcc00" />
          </mesh>
          <mesh position={[0.15, 0, 0.8]} castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color="#ffcc00" />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

/**
 * MAIN SHOP BUILDING COMPONENT
 */
export default function ShopBuilding({ position = [0, 0, 0] }) {
  return (
    <group position={position}>

      {/* ==================================================================
          1. FLOOR - Concrete slab base (12×12)
          ================================================================== */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[12, 0.2, 12]} />
          <meshToonMaterial color="#d0d0c8" />
          <Outlines thickness={0.025} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          2. ROOF - Orange overhang (slightly larger for overhang effect)
          ================================================================== */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[12.5, 0.2, 12.5]} />
          <meshToonMaterial color="#ff6633" />
          <Outlines thickness={0.035} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          3. BACK WALL - Solid wall at z=-6 (12 units wide, 5 units tall)
          ================================================================== */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 2.6, -5.85]} castShadow receiveShadow>
          <boxGeometry args={[12, 5, 0.3]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          4. LEFT WALL - Solid wall at x=-6 (12 units deep, 5 units tall)
          ================================================================== */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-5.85, 2.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 5, 12]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          5. RIGHT WALL - Split for door opening at z=0
          ================================================================== */}

      {/* Right wall - Back section (behind door) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[5.85, 2.6, -3]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 5, 6]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* Right wall - Front section (in front of door) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[5.85, 2.6, 3.5]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 5, 5]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* Right wall - Above door */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[5.85, 3.8, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 2.4, 1]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          6. FRONT WALL - Built as frame with window opening
          Window opening: x=-1.5 to x=1.5 (3 units), y=1.2 to y=4.3
          ================================================================== */}

      {/* Front Left Pillar */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-3.75, 2.6, 5.85]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 5, 0.3]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* Front Right Pillar */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[3.75, 2.6, 5.85]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 5, 0.3]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* Bottom section - Below window counter */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.6, 5.85]} castShadow receiveShadow>
          <boxGeometry args={[3, 1.2, 0.3]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* Top Lintel - Above window */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4.45, 5.85]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.9, 0.3]} />
          <meshToonMaterial color="#e8f4f8" />
          <Outlines thickness={0.03} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          WINDOW COUNTER - Work surface inside window opening
          ================================================================== */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.2, 5.5]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.15, 0.7]} />
          <meshToonMaterial color="#8b7355" />
          <Outlines thickness={0.02} color="black" />
        </mesh>
      </RigidBody>

      {/* ==================================================================
          WINDOW FRAME BORDERS - Black trim around window opening
          ================================================================== */}
      <mesh position={[-1.5, 2.75, 5.9]} castShadow>
        <boxGeometry args={[0.15, 3.1, 0.2]} />
        <meshToonMaterial color="#2a2a2a" />
        <Outlines thickness={0.015} color="black" />
      </mesh>
      <mesh position={[1.5, 2.75, 5.9]} castShadow>
        <boxGeometry args={[0.15, 3.1, 0.2]} />
        <meshToonMaterial color="#2a2a2a" />
        <Outlines thickness={0.015} color="black" />
      </mesh>
      <mesh position={[0, 4.3, 5.9]} castShadow>
        <boxGeometry args={[3, 0.15, 0.2]} />
        <meshToonMaterial color="#2a2a2a" />
        <Outlines thickness={0.015} color="black" />
      </mesh>
      <mesh position={[0, 1.275, 5.9]} castShadow>
        <boxGeometry args={[3, 0.15, 0.2]} />
        <meshToonMaterial color="#2a2a2a" />
        <Outlines thickness={0.015} color="black" />
      </mesh>

      {/* ==================================================================
          SIGNAGE - Shop sign above window
          ================================================================== */}
      <mesh position={[0, 5.5, 6]} castShadow>
        <RoundedBox args={[4, 0.7, 0.25]} radius={0.05} smoothness={4}>
          <meshToonMaterial color="#ffaa33" />
          <Outlines thickness={0.025} color="black" />
        </RoundedBox>
      </mesh>

      {/* ==================================================================
          DOOR - Functional door on right wall (facing inward)
          Position: right wall at x=5.7, aligned with door opening z=0 to z=1
          ================================================================== */}
      <Door position={[5.7, 0.2, 0.0]} rotation={[0, 0, 0]} />

    </group>
  )
}

/**
 * ============================================================================
 * ARCHITECTURE NOTES:
 * ============================================================================
 *
 * BUILDING BOUNDARIES:
 * - X axis: -6 to +6 (12 units wide)
 * - Y axis: 0 to 5 (5 units tall)
 * - Z axis: -6 to +6 (12 units deep)
 *
 * WALL POSITIONS:
 * - Back wall: z = -5.85 (0.15 from edge for overhang)
 * - Front wall: z = 5.85 (split into pillars + lintel + bottom)
 * - Left wall: x = -5.85
 * - Right wall: x = 5.85 (split for door at z = 0 to 1)
 *
 * WINDOW OPENING:
 * - X: -1.5 to +1.5 (3 units wide)
 * - Y: 1.2 to 4.3 (3.1 units tall)
 * - Z: at front wall (5.85)
 *
 * DOOR OPENING:
 * - Right wall at x = 5.85
 * - Z: 0 to 1 (1 unit wide)
 * - Y: 0.2 to 2.6 (2.4 units tall)
 */
