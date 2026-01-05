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

// Door component temporarily removed - will be reimplemented later

/**
 * MAIN SHOP BUILDING COMPONENT
 *
 * PHASE 1 FIX: Wrapped entire building in rotation={[0, Math.PI, 0]}
 * to correct default backward-facing orientation.
 */
export default function ShopBuilding({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Internal rotation fix - makes building face +Z (forward) by default */}
      <group rotation={[0, Math.PI, 0]}>

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

      {/* Door temporarily removed - will be reimplemented later */}

      </group>
      {/* End internal rotation fix */}
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
