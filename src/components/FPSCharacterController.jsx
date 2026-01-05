/**
 * FPS CHARACTER CONTROLLER
 *
 * Custom first-person shooter character controller built from scratch to replace Ecctrl.
 * Implements true FPS movement where forward (W) always moves in the camera's look direction,
 * and strafe (A/D) moves perpendicular to camera direction.
 *
 * KEY FEATURES:
 * - Camera-relative WASD movement (transforms input based on camera yaw)
 * - Direct Rapier physics integration (RigidBody + CapsuleCollider)
 * - Smooth acceleration with velocity interpolation
 * - Jump mechanics with ground detection
 * - Character model rotation to face movement direction
 * - Performance-optimized (useRef for position updates to avoid re-renders)
 *
 * WHY CUSTOM?
 * Ecctrl provided "tank controls" where W always moved model-forward regardless of camera,
 * and A/D rotated the character instead of strafing. No configuration could achieve
 * true FPS camera-relative movement, so we built this custom solution.
 *
 * MATH:
 * - Forward movement: (Math.sin(yaw), Math.cos(yaw)) gives camera's forward vector
 * - Strafe movement: (Math.cos(yaw), -Math.sin(yaw)) gives perpendicular vector (90° rotated)
 * - Diagonal normalization prevents faster speed when moving diagonally
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import PlayerModel from './PlayerModel'

export default function FPSCharacterController({
  position = [0, 1.3, -10],
  cameraRotationRef,
  onPositionChange
}) {
  const rigidBodyRef = useRef()
  const isGroundedRef = useRef(true)
  const velocityRef = useRef({ x: 0, z: 0 })

  // Keyboard state
  const [, getKeys] = useKeyboardControls()

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return

    const body = rigidBodyRef.current
    const keys = getKeys()

    // Get camera yaw (horizontal rotation)
    const yaw = cameraRotationRef?.current?.horizontal || 0

    // Calculate movement direction based on WASD and camera rotation
    let moveX = 0
    let moveZ = 0

    // Forward/Backward (W/S)
    if (keys.forward) {
      moveX += Math.sin(yaw)
      moveZ += Math.cos(yaw)
    }
    if (keys.backward) {
      moveX -= Math.sin(yaw)
      moveZ -= Math.cos(yaw)
    }

    // Strafe Left/Right (A/D)
    if (keys.leftward) {
      moveX += Math.cos(yaw)
      moveZ -= Math.sin(yaw)
    }
    if (keys.rightward) {
      moveX -= Math.cos(yaw)
      moveZ += Math.sin(yaw)
    }

    // Normalize diagonal movement
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
    if (length > 0) {
      moveX /= length
      moveZ /= length
    }

    // Movement speed
    const speed = keys.run ? 8 : 5
    const targetVelX = moveX * speed
    const targetVelZ = moveZ * speed

    // Smooth acceleration
    const smoothing = 10
    velocityRef.current.x += (targetVelX - velocityRef.current.x) * smoothing * delta
    velocityRef.current.z += (targetVelZ - velocityRef.current.z) * smoothing * delta

    // Get current velocity
    const currentVel = body.linvel()

    // Apply horizontal movement, preserve vertical velocity (gravity)
    body.setLinvel(
      {
        x: velocityRef.current.x,
        y: currentVel.y,
        z: velocityRef.current.z
      },
      true
    )

    // Jump
    if (keys.jump && isGroundedRef.current) {
      body.setLinvel(
        {
          x: velocityRef.current.x,
          y: 6,
          z: velocityRef.current.z
        },
        true
      )
      isGroundedRef.current = false
    }

    // Update position callback for camera
    if (onPositionChange) {
      const pos = body.translation()
      onPositionChange(pos)
    }

    // Rotate character model to face movement direction (optional visual)
    if (length > 0.1 && rigidBodyRef.current) {
      const targetRotation = Math.atan2(moveX, moveZ)
      // Smooth rotation towards movement direction
      const currentRot = rigidBodyRef.current.rotation().y || 0
      let rotDiff = targetRotation - currentRot

      // Normalize angle difference
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2

      const newRot = currentRot + rotDiff * 10 * delta
      rigidBodyRef.current.setRotation({ x: 0, y: newRot, z: 0, w: 1 }, true)
    }
  })

  // Ground detection
  useEffect(() => {
    if (!rigidBodyRef.current) return

    const checkGrounded = setInterval(() => {
      if (!rigidBodyRef.current) return
      const vel = rigidBodyRef.current.linvel()
      // Simple ground detection: if vertical velocity is near zero, we're grounded
      if (Math.abs(vel.y) < 0.5) {
        isGroundedRef.current = true
      }
    }, 100)

    return () => clearInterval(checkGrounded)
  }, [])

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      enabledRotations={[false, true, false]}  // Only allow Y-axis rotation (turning)
      lockRotations={false}
      type="dynamic"  // Affected by physics forces and gravity
      colliders={false}  // Manual collider definition below
      mass={1}
      linearDamping={0.5}  // Gradual slowdown when no input
      angularDamping={1}  // Prevent spinning
      canSleep={false}  // Always active (required for continuous input handling)
    >
      {/* Capsule collider aligned with player model (feet at bottom, head at top) */}
      {/* Player model dimensions: feet at Y=-0.79, head at Y=0.8, total height=1.59 */}
      {/* Capsule: halfHeight=0.8, radius=0.25, center at Y=0 (matches model center) */}
      {/* With spawn Y=1.3, feet are at world Y=0.51 (just above ground at Y=0) */}
      <CapsuleCollider args={[0.8, 0.25]} position={[0, 0, 0]} />

      {/* Player model centered at origin (relative to RigidBody position) */}
      <group position={[0, 0, 0]}>
        <PlayerModel />
      </group>
    </RigidBody>
  )
}
