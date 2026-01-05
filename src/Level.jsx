/**
 * ============================================================================
 * LEVEL.JSX - MAIN 3D SCENE COMPONENT
 * ============================================================================
 *
 * This file creates the entire 3D world for the ESP32 simulator.
 * Think of it like building a diorama or video game level.
 *
 * KEY CONCEPTS FOR BEGINNERS:
 * - React Three Fiber: A way to create 3D graphics using React components
 * - Physics: Makes objects behave realistically (gravity, collisions, etc.)
 * - Meshes: 3D objects made of geometry (shape) + material (appearance)
 * - Position: Where things are in 3D space [x, y, z]
 *   - X: left/right (negative = left, positive = right)
 *   - Y: up/down (negative = down, positive = up)
 *   - Z: forward/back (negative = back, positive = forward)
 */

// ============================================================================
// IMPORTS - Bringing in tools and components we need
// ============================================================================

// Physics engine components - makes things fall, collide, etc.
import { Physics, RigidBody } from '@react-three/rapier'

// Visual helpers for cel-shaded (cartoon) outlines and transform controls
import { Outlines, TransformControls, Sky } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Our custom components - pieces of the scene we built
import ShopBuilding from './components/ShopBuilding'
import Workbench from './components/Workbench'
import ESP32Board from './components/ESP32Board'
import Breadboard from './components/Breadboard'
import ComponentLED from './components/ComponentLED'
import ComponentButton from './components/ComponentButton'
import FPSCharacterController from './components/FPSCharacterController'
import Draggable from './components/Draggable'
import PlacementManager from './components/PlacementManager'
import Wire from './components/Wire'
import { useCoding } from './CodingContext'

// ============================================================================
// MAIN LEVEL COMPONENT
// ============================================================================

export default function Level() {
  const {
    isEditMode,
    placedComponents,
    wires,
    selectedId,
    setSelectedId,
    transformMode,
    gizmoModeActive,
    updateComponent,
    removeComponent,
    mouseSensitivity,
    isMouseMode
  } = useCoding()

  // Camera rotation state for mouse follow
  const cameraRotationRef = useRef({ horizontal: 0, vertical: 0 })
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const cameraDistanceRef = useRef(0) // 0 = first person, >0 = third person

  // Auto-follow mouse camera (disabled in edit mode or when Alt is held)
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Don't follow mouse if in edit mode or mouse mode (Alt held)
      if (isEditMode || isMouseMode) return

      // Calculate mouse movement delta
      const deltaX = e.movementX || 0
      const deltaY = e.movementY || 0

      // Update camera rotation based on mouse movement and sensitivity
      // INVERTED: Moving mouse right (positive deltaX) should rotate view right (positive rotation)
      cameraRotationRef.current.horizontal -= deltaX * mouseSensitivity * 0.002
      cameraRotationRef.current.vertical = Math.max(
        -Math.PI / 3,  // Limit looking up
        Math.min(
          Math.PI / 3,  // Limit looking down
          cameraRotationRef.current.vertical - deltaY * mouseSensitivity * 0.002
        )
      )
    }

    const handleWheel = (e) => {
      // Don't zoom if in edit mode or mouse mode
      if (isEditMode || isMouseMode) return

      // Zoom in/out with mouse wheel
      const delta = e.deltaY * 0.01
      cameraDistanceRef.current = Math.max(0, Math.min(10, cameraDistanceRef.current + delta))
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isEditMode, isMouseMode, mouseSensitivity])

  // Player position ref for camera following (using ref to avoid re-renders)
  const playerPositionRef = useRef({ x: 0, y: 1.3, z: -10 })

  // Camera controller component - follows player and applies mouse rotation
  const CameraController = () => {
    const { camera } = useThree()

    useFrame(() => {
      // Use player position from ref (no re-renders)
      const playerPos = new THREE.Vector3(
        playerPositionRef.current.x,
        playerPositionRef.current.y,
        playerPositionRef.current.z
      )

      // Camera rotation from mouse
      const yaw = cameraRotationRef.current.horizontal
      const pitch = cameraRotationRef.current.vertical
      const distance = cameraDistanceRef.current

      // Eye height and camera positioning
      const eyeHeight = 1.6 // Height of player's eyes

      // Calculate look direction based on yaw and pitch
      const lookX = Math.sin(yaw) * Math.cos(pitch)
      const lookY = Math.sin(pitch)
      const lookZ = Math.cos(yaw) * Math.cos(pitch)

      if (distance === 0) {
        // FIRST PERSON: Camera at eye level
        camera.position.set(
          playerPos.x,
          playerPos.y + eyeHeight,
          playerPos.z
        )
      } else {
        // THIRD PERSON: Camera behind and above player
        const camHeight = eyeHeight + (distance * 0.3) // Camera rises slightly when zooming out

        // Position camera behind player based on yaw
        camera.position.set(
          playerPos.x - Math.sin(yaw) * distance,
          playerPos.y + camHeight,
          playerPos.z - Math.cos(yaw) * distance
        )
      }

      // Look in the direction based on mouse rotation (first person)
      // or look at player (third person)
      if (distance === 0) {
        camera.lookAt(
          playerPos.x + lookX,
          playerPos.y + eyeHeight + lookY,
          playerPos.z + lookZ
        )
      } else {
        // In third person, look at player's upper body
        camera.lookAt(
          playerPos.x,
          playerPos.y + eyeHeight * 0.8,
          playerPos.z
        )
      }
    })

    return null
  }

  /**
   * RenderComponent - Helper function to render the correct component based on type
   * @param {Object} component - Component data from placedComponents array
   * @returns {JSX.Element} - The rendered component
   */
  // Cloud animation component
  const MovingClouds = () => {
    const cloud1Ref = useRef()
    const cloud2Ref = useRef()
    const cloud3Ref = useRef()
    const cloud4Ref = useRef()
    const cloud5Ref = useRef()

    useEffect(() => {
      let animationFrame
      const animate = () => {
        const time = Date.now() * 0.0001

        if (cloud1Ref.current) cloud1Ref.current.position.x = -40 + (time * 8) % 120
        if (cloud2Ref.current) cloud2Ref.current.position.x = -50 + (time * 6) % 120
        if (cloud3Ref.current) cloud3Ref.current.position.x = -30 + (time * 10) % 120
        if (cloud4Ref.current) cloud4Ref.current.position.x = -45 + (time * 7) % 120
        if (cloud5Ref.current) cloud5Ref.current.position.x = -35 + (time * 9) % 120

        animationFrame = requestAnimationFrame(animate)
      }
      animate()
      return () => cancelAnimationFrame(animationFrame)
    }, [])

    return (
      <>
        {/* Cloud 1 */}
        <group ref={cloud1Ref} position={[-40, 45, -80]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[8, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[10, 2, 0]}>
            <sphereGeometry args={[6, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-8, 1, 0]}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>

        {/* Cloud 2 */}
        <group ref={cloud2Ref} position={[-50, 52, 60]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[10, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
          <mesh position={[12, 3, 0]}>
            <sphereGeometry args={[7, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        </group>

        {/* Cloud 3 */}
        <group ref={cloud3Ref} position={[-30, 48, -40]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[6, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[8, 1, 0]}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-6, 2, 0]}>
            <sphereGeometry args={[4, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>

        {/* Cloud 4 */}
        <group ref={cloud4Ref} position={[-45, 55, 20]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[9, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.88} />
          </mesh>
          <mesh position={[11, 2, 0]}>
            <sphereGeometry args={[6, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.88} />
          </mesh>
        </group>

        {/* Cloud 5 */}
        <group ref={cloud5Ref} position={[-35, 50, -100]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[7, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[9, 1, 0]}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshToonMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>
      </>
    )
  }

  const RenderComponent = ({ component }) => {
    const objectRef = useRef()
    const transformRef = useRef()
    const [isDragging, setIsDragging] = useState(false)
    const isSelected = isEditMode && selectedId === component.id

    // Handle component selection - only works when gizmo mode is active
    const handlePointerDown = (e) => {
      if (!isEditMode || !gizmoModeActive) {
        return
      }

      e.stopPropagation()
      setSelectedId(component.id)
    }

    // Handle right-click delete
    const handleContextMenu = (e) => {
      if (!isEditMode) return

      e.stopPropagation()

      // Protect core components from deletion
      if (component.id === 'esp32-board' || component.id === 'breadboard-main') {
        return
      }

      removeComponent(component.id)
    }

    // Handle transform start - disable camera
    const handleTransformStart = () => {
      setIsDragging(true)
    }

    // Handle transform end - save new position/rotation/scale and re-enable camera
    const handleTransformEnd = () => {
      setIsDragging(false)

      if (objectRef.current) {
        const { position, rotation, scale } = objectRef.current

        // Convert Three.js objects to arrays for state storage
        const updates = {
          position: [position.x, position.y, position.z],
          rotation: [rotation.x, rotation.y, rotation.z],
          scale: typeof scale === 'number' ? scale : [scale.x, scale.y, scale.z]
        }

        updateComponent(component.id, updates)
      }
    }

    // Determine scale - handle both number and array formats
    const getScale = () => {
      if (component.scale === undefined) return 1
      if (typeof component.scale === 'number') return component.scale
      return component.scale
    }

    // Render the component based on type
    const renderComponentContent = () => {
      switch (component.type) {
        case 'esp32':
          return <ESP32Board componentId={component.id} />

        case 'breadboard':
          return <Breadboard componentId={component.id} />

        case 'led':
          return (
            <group scale={0.6}>
              <ComponentLED
                componentId={component.id}
                color={component.props?.color || '#ff0000'}
              />
            </group>
          )

        case 'button':
          return (
            <group scale={0.6}>
              <ComponentButton componentId={component.id} />
            </group>
          )

        default:
          console.warn('[Level] Unknown component type:', component.type)
          return null
      }
    }

    // Get bounding box size for hitbox based on component type
    // NOTE: These are in the scaled coordinate space
    const getHitboxSize = () => {
      switch (component.type) {
        case 'esp32':
          return [3.0, 0.8, 6.0] // Large hitbox for ESP32 (scaled by 0.17)
        case 'breadboard':
          return [2.0, 0.3, 1.0] // Large hitbox for breadboard (scaled by 0.6)
        case 'led':
        case 'button':
          return [0.5, 0.5, 0.5] // Larger hitbox for small components (scaled by 0.6 inside, but 1.0 outer)
        default:
          return [1, 1, 1]
      }
    }

    return (
      <>
        <group
          ref={objectRef}
          position={component.position || [0, 0, 0]}
          rotation={component.rotation || [0, 0, 0]}
          scale={getScale()}
        >
          {renderComponentContent()}

          {/* Invisible hitbox for selection - only visible when gizmo mode is active */}
          {isEditMode && gizmoModeActive && (
            <mesh
              renderOrder={999}
              onPointerDown={handlePointerDown}
              onContextMenu={handleContextMenu}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'default'
              }}
            >
              <boxGeometry args={getHitboxSize()} />
              <meshBasicMaterial
                transparent
                opacity={isSelected ? 0.2 : 0.05}
                color={isSelected ? "#00ff00" : "#ffff00"}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Visual highlight for selected component */}
          {isSelected && (
            <Outlines thickness={0.05} color="green" />
          )}
        </group>

        {/* Transform controls for selected component - only shows when gizmo mode is active */}
        {isSelected && gizmoModeActive && (
          <TransformControls
            ref={transformRef}
            object={objectRef}
            mode={transformMode}
            space="world"
            size={1.5}
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
            // Prevent camera movement during transform
            makeDefault={isDragging}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* ====================================================================
          SKY - Blue sky dome with visible sun
          ==================================================================== */}
      <Sky
        distance={450000}
        sunPosition={[100, 50, 100]}
        inclination={0.52}
        azimuth={0.25}
        turbidity={2}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
      />

      {/* Visible Sun - Yellow ball in the sky */}
      <mesh position={[100, 50, 100]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {/* Moving clouds */}
      <MovingClouds />

      {/* Camera controller for auto-follow mouse */}
      <CameraController />

      {/* ====================================================================
          LIGHTING SETUP - Makes everything visible and creates mood
          ==================================================================== */}

      {/*
        AMBIENT LIGHT - Base lighting that hits everything equally
        Like the general daylight that fills a room
        Intensity 0.6 = 60% brightness (1.0 would be full brightness)
      */}
      <ambientLight intensity={0.6} />

      {/*
        MAIN SUN - Directional light that creates hard shadows
        This is our "sun" casting light from one direction
      */}
      <directionalLight
        position={[20, 30, 15]}        // Light source is high and to the right
        intensity={3.5}                // Very bright (3.5x normal)
        castShadow                     // This light creates shadows
        shadow-mapSize-width={2048}    // Shadow quality (higher = better but slower)
        shadow-mapSize-height={2048}
        shadow-camera-far={100}        // How far shadows are calculated
        shadow-camera-left={-30}       // Shadow area boundaries
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        color="#fffaf0"                // Slightly warm white (hex color)
      />

      {/*
        FILL LIGHT - Secondary light to reduce harsh shadows
        Position on opposite side from main sun, with blue tint
      */}
      <directionalLight
        position={[-10, 10, -10]}
        intensity={1.2}
        color="#e0f4ff"  // Light blue color
      />

      {/*
        HEMISPHERE LIGHT - Simulates light bouncing from sky and ground
        Creates a more natural outdoor lighting feel
      */}
      <hemisphereLight
        intensity={1.5}          // Brightness
        groundColor="#999999"    // Gray ground reflection
        skyColor="#87ceeb"       // Sky blue from above
      />

      {/* ====================================================================
          PHYSICS WORLD - Everything inside can interact physically
          ==================================================================== */}
      <Physics>

        {/* ================================================================
            CITY PLAZA GROUND - The floor with detailed tile patterns
            ================================================================ */}

        {/* Main ground base */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, -0.5, 0]} receiveShadow>
            <boxGeometry args={[50, 1, 50]} />
            <meshToonMaterial color="#c8c8ba" />
            <Outlines thickness={0.04} color="black" />
          </mesh>
        </RigidBody>

        {/* Plaza tile pattern - darker tiles creating a grid */}
        {Array.from({ length: 9 }).map((_, x) =>
          Array.from({ length: 9 }).map((_, z) => (
            <mesh key={`tile-${x}-${z}`} position={[-20 + x * 5, -0.45, -20 + z * 5]} receiveShadow>
              <boxGeometry args={[4.8, 0.05, 4.8]} />
              <meshToonMaterial color={(x + z) % 2 === 0 ? "#b8b8aa" : "#c0c0b2"} />
            </mesh>
          ))
        )}

        {/* Decorative border around workbench area */}
        <mesh position={[0, -0.44, 0]} receiveShadow>
          <boxGeometry args={[8, 0.03, 8]} />
          <meshToonMaterial color="#aaaaaa" />
        </mesh>
        <mesh position={[0, -0.43, 0]} receiveShadow>
          <boxGeometry args={[7.5, 0.02, 7.5]} />
          <meshToonMaterial color="#d8d8ca" />
        </mesh>

        {/* ================================================================
            STREET - Asphalt road strip with lane markings and curbs
            ================================================================ */}

        {/* Main asphalt surface - dark gray */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[15, -0.45, 0]} receiveShadow>
            <boxGeometry args={[10, 0.1, 50]} />
            <meshToonMaterial color="#3a3a3a" />
            <Outlines thickness={0.02} color="black" />
          </mesh>
        </RigidBody>

        {/* Sidewalk curb - left side of road */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[10, -0.35, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.3, 0.2, 50]} />
            <meshToonMaterial color="#d8d8d0" />
            <Outlines thickness={0.015} color="black" />
          </mesh>
        </RigidBody>

        {/* Sidewalk curb - right side of road */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[20, -0.35, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.3, 0.2, 50]} />
            <meshToonMaterial color="#d8d8d0" />
            <Outlines thickness={0.015} color="black" />
          </mesh>
        </RigidBody>

        {/* Yellow lane markings - Center line dashes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={`lane-${i}`} position={[15, -0.39, -22 + i * 5]} receiveShadow>
            <boxGeometry args={[0.2, 0.05, 2.5]} />
            <meshToonMaterial color="#ffdd44" />
          </mesh>
        ))}

        {/* Road edge lines - solid white */}
        <mesh position={[11, -0.38, 0]} receiveShadow>
          <boxGeometry args={[0.15, 0.05, 50]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
        <mesh position={[19, -0.38, 0]} receiveShadow>
          <boxGeometry args={[0.15, 0.05, 50]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>

        {/* ================================================================
            GREENERY - Trees and plants to make the scene feel alive
            ================================================================ */}

        {/* TREE 1 - Back left of plaza */}
        <group position={[-12, 0, -8]}>  {/* group = container for multiple objects */}

          {/* Tree trunk - brown cylinder */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 1.5, 0]} castShadow>  {/* castShadow = this object casts shadows */}
              {/*
                cylinderGeometry = tube/cylinder shape
                args = [radiusTop, radiusBottom, height, segments]
                segments = how smooth/round it is (6 = low-poly look)
              */}
              <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
              <meshToonMaterial color="#8b4513" />  {/* Saddle brown */}
              <Outlines thickness={0.015} color="black" />
            </mesh>
          </RigidBody>

          {/* Tree foliage - green dodecahedron (12-sided shape) */}
          <mesh position={[0, 3.5, 0]} castShadow>
            {/*
              dodecahedronGeometry = 12-sided polyhedron (looks bushy)
              args = [radius, detail level]
            */}
            <dodecahedronGeometry args={[1.5, 0]} />
            <meshToonMaterial color="#44aa44" />  {/* Forest green */}
            <Outlines thickness={0.025} color="black" />
          </mesh>
        </group>

        {/* TREE 2 - Back right of plaza (same structure as Tree 1) */}
        <group position={[-12, 0, 8]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
              <meshToonMaterial color="#8b4513" />
              <Outlines thickness={0.015} color="black" />
            </mesh>
          </RigidBody>
          <mesh position={[0, 3.5, 0]} castShadow>
            <dodecahedronGeometry args={[1.5, 0]} />
            <meshToonMaterial color="#44aa44" />
            <Outlines thickness={0.025} color="black" />
          </mesh>
        </group>

        {/* PLANTER BOX - Decorative plant container */}
        <group position={[8, 0, -10]}>

          {/* Wooden planter box */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[2, 0.6, 0.8]} />
              <meshToonMaterial color="#cc6633" />  {/* Terracotta orange */}
              <Outlines thickness={0.015} color="black" />
            </mesh>
          </RigidBody>

          {/* Small cone-shaped plants inside */}
          <mesh position={[-0.5, 0.7, 0]} castShadow>
            {/*
              coneGeometry = pyramid/cone shape
              args = [radius, height, segments]
            */}
            <coneGeometry args={[0.25, 0.6, 5]} />
            <meshToonMaterial color="#66cc66" />  {/* Light green */}
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0.5, 0.8, 0]} castShadow>
            <coneGeometry args={[0.3, 0.7, 5]} />
            <meshToonMaterial color="#55bb55" />  {/* Slightly darker green */}
            <Outlines thickness={0.012} color="black" />
          </mesh>
        </group>

        {/* ================================================================
            CITY BUILDINGS - Background urban environment with detailed windows
            These create the city skyline that reflects in windows
            ================================================================ */}

        {/* Building 1 - Tall office building (back left) with windows */}
        <group position={[-18, 8, -15]}>
          {/* Main structure */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 16, 8]} />
            <meshToonMaterial color="#ccddee" />
            <Outlines thickness={0.04} color="black" />
          </mesh>
          {/* Window grid - front face */}
          {Array.from({ length: 4 }).map((_, col) =>
            Array.from({ length: 6 }).map((_, row) => (
              <mesh key={`b1-f-${col}-${row}`} position={[-2.2 + col * 1.4, -6 + row * 2.5, 4.05]} castShadow>
                <boxGeometry args={[0.8, 1.8, 0.1]} />
                <meshToonMaterial color="#88bbdd" emissive="#aaccee" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
          {/* Window grid - side face */}
          {Array.from({ length: 5 }).map((_, col) =>
            Array.from({ length: 6 }).map((_, row) => (
              <mesh key={`b1-s-${col}-${row}`} position={[-3.05, -6 + row * 2.5, -3 + col * 1.4]} castShadow>
                <boxGeometry args={[0.1, 1.8, 0.8]} />
                <meshToonMaterial color="#88bbdd" emissive="#aaccee" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 2 - Medium building (back right) with windows */}
        <group position={[20, 6, -12]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8, 12, 6]} />
            <meshToonMaterial color="#eeddcc" />
            <Outlines thickness={0.04} color="black" />
          </mesh>
          {/* Window grid - front face */}
          {Array.from({ length: 5 }).map((_, col) =>
            Array.from({ length: 4 }).map((_, row) => (
              <mesh key={`b2-f-${col}-${row}`} position={[-3 + col * 1.5, -4 + row * 2.8, 3.05]} castShadow>
                <boxGeometry args={[0.9, 2, 0.1]} />
                <meshToonMaterial color="#ffeeaa" emissive="#ffeecc" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 3 - Short building (left side) with windows */}
        <group position={[-20, 4, 5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5, 8, 10]} />
            <meshToonMaterial color="#ffddbb" />
            <Outlines thickness={0.035} color="black" />
          </mesh>
          {/* Window grid - front face */}
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 3 }).map((_, row) => (
              <mesh key={`b3-f-${col}-${row}`} position={[-1.5 + col * 1.5, -2 + row * 2.5, 5.05]} castShadow>
                <boxGeometry args={[0.8, 1.8, 0.1]} />
                <meshToonMaterial color="#ffffcc" emissive="#ffeecc" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 4 - Tall apartment (back center) with many windows */}
        <group position={[0, 10, -20]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[7, 20, 6]} />
            <meshToonMaterial color="#aaccdd" />
            <Outlines thickness={0.045} color="black" />
          </mesh>
          {/* Window grid - front face (many floors) */}
          {Array.from({ length: 4 }).map((_, col) =>
            Array.from({ length: 8 }).map((_, row) => (
              <mesh key={`b4-f-${col}-${row}`} position={[-2.5 + col * 1.6, -8 + row * 2.4, 3.05]} castShadow>
                <boxGeometry args={[0.9, 1.8, 0.1]} />
                <meshToonMaterial color="#99ccff" emissive="#aaddff" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
          {/* Balconies on some floors */}
          {Array.from({ length: 6 }).map((_, row) => (
            <mesh key={`balcony-${row}`} position={[0, -7 + row * 3, 3.3]} castShadow>
              <boxGeometry args={[6, 0.15, 0.5]} />
              <meshToonMaterial color="#8899aa" />
            </mesh>
          ))}
        </group>

        {/* Building 5 - Commercial building (right side) with large windows */}
        <group position={[22, 5, 8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 10, 12]} />
            <meshToonMaterial color="#ddccaa" />
            <Outlines thickness={0.035} color="black" />
          </mesh>
          {/* Large storefront windows on ground floor */}
          <mesh position={[-3.05, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 3, 10]} />
            <meshToonMaterial color="#aaddff" transparent opacity={0.6} emissive="#88ccff" emissiveIntensity={0.4} />
          </mesh>
          {/* Upper floor windows */}
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 3 }).map((_, row) => (
              <mesh key={`b5-f-${col}-${row}`} position={[-3.05, 3 + row * 2, -4 + col * 4]} castShadow>
                <boxGeometry args={[0.1, 1.5, 2]} />
                <meshToonMaterial color="#ccddee" emissive="#aaccdd" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* ================================================================
            ADDITIONAL CITY SURROUND - More buildings for 360° cityscape
            ================================================================ */}

        {/* Building 6 - Front left corner */}
        <group position={[-15, 4, 15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8, 8, 8]} />
            <meshToonMaterial color="#ddbbaa" />
            <Outlines thickness={0.03} color="black" />
          </mesh>
          {Array.from({ length: 4 }).map((_, col) =>
            Array.from({ length: 3 }).map((_, row) => (
              <mesh key={`b6-${col}-${row}`} position={[-3 + col * 2, -3 + row * 2.5, 4.05]} castShadow>
                <boxGeometry args={[0.9, 1.8, 0.1]} />
                <meshToonMaterial color="#ffeecc" emissive="#ffddaa" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 7 - Front right near road */}
        <group position={[8, 5, 18]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 10, 10]} />
            <meshToonMaterial color="#cce0dd" />
            <Outlines thickness={0.035} color="black" />
          </mesh>
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 4 }).map((_, row) => (
              <mesh key={`b7-${col}-${row}`} position={[-2 + col * 2, -4 + row * 2.3, -5.05]} castShadow>
                <boxGeometry args={[1, 1.6, 0.1]} />
                <meshToonMaterial color="#aaddee" emissive="#99ccdd" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 8 - Far right residential */}
        <group position={[25, 7, -5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[7, 14, 12]} />
            <meshToonMaterial color="#ffe0dd" />
            <Outlines thickness={0.04} color="black" />
          </mesh>
          {Array.from({ length: 4 }).map((_, col) =>
            Array.from({ length: 5 }).map((_, row) => (
              <mesh key={`b8-${col}-${row}`} position={[-2.5 + col * 1.6, -6 + row * 2.6, -6.05]} castShadow>
                <boxGeometry args={[0.8, 2, 0.1]} />
                <meshToonMaterial color="#ffccaa" emissive="#ffddbb" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 9 - Back left tower */}
        <group position={[-8, 9, -18]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5, 18, 7]} />
            <meshToonMaterial color="#bbccee" />
            <Outlines thickness={0.04} color="black" />
          </mesh>
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 7 }).map((_, row) => (
              <mesh key={`b9-${col}-${row}`} position={[-1.5 + col * 1.5, -8 + row * 2.4, 3.55]} castShadow>
                <boxGeometry args={[0.8, 1.8, 0.1]} />
                <meshToonMaterial color="#aaccff" emissive="#99bbee" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 10 - Far left industrial */}
        <group position={[-25, 6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 12, 15]} />
            <meshToonMaterial color="#ccaa99" />
            <Outlines thickness={0.035} color="black" />
          </mesh>
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 4 }).map((_, row) => (
              <mesh key={`b10-${col}-${row}`} position={[3.05, -5 + row * 2.8, -6 + col * 5]} castShadow>
                <boxGeometry args={[0.1, 2, 2.5]} />
                <meshToonMaterial color="#ffddcc" emissive="#eeccaa" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 11 - Near back center */}
        <group position={[10, 5, -16]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 10, 5]} />
            <meshToonMaterial color="#ddccee" />
            <Outlines thickness={0.03} color="black" />
          </mesh>
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 4 }).map((_, row) => (
              <mesh key={`b11-${col}-${row}`} position={[-2 + col * 2, -4 + row * 2.3, 2.55]} castShadow>
                <boxGeometry args={[1, 1.8, 0.1]} />
                <meshToonMaterial color="#ccbbff" emissive="#bbaaee" emissiveIntensity={0.3} />
              </mesh>
            ))
          )}
        </group>

        {/* Building 12 - Front center small shop */}
        <group position={[-8, 3, 12]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5, 6, 6]} />
            <meshToonMaterial color="#ffccaa" />
            <Outlines thickness={0.03} color="black" />
          </mesh>
          {/* Large storefront window */}
          <mesh position={[0, -1, 3.05]} castShadow>
            <boxGeometry args={[4, 2.5, 0.1]} />
            <meshToonMaterial color="#aaddff" transparent opacity={0.7} emissive="#99ccee" emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* Distant skyscraper silhouettes for depth */}
        <mesh position={[-35, 15, -30]} castShadow>
          <boxGeometry args={[8, 30, 8]} />
          <meshToonMaterial color="#8899aa" />
          <Outlines thickness={0.05} color="black" />
        </mesh>
        <mesh position={[35, 18, -28]} castShadow>
          <boxGeometry args={[10, 36, 10]} />
          <meshToonMaterial color="#99aabb" />
          <Outlines thickness={0.05} color="black" />
        </mesh>
        <mesh position={[30, 12, -35]} castShadow>
          <boxGeometry args={[7, 24, 7]} />
          <meshToonMaterial color="#aabbcc" />
          <Outlines thickness={0.04} color="black" />
        </mesh>

        {/* ================================================================
            STREET LAMPS - Functional lighting props
            ================================================================ */}

        {/* Street Lamp 1 */}
        <group position={[10, 0, -5]}>
          {/* Lamp post - black cylinder */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
            <meshToonMaterial color="#3a3a3a" />
          </mesh>

          {/* Lamp head - glowing yellow box */}
          <mesh position={[0, 4, 0.3]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.5]} />
            {/*
              emissive = Makes material glow
              emissiveIntensity = How bright the glow is
            */}
            <meshToonMaterial
              color="#ffff88"
              emissive="#ffff88"
              emissiveIntensity={0.5}
            />
            <Outlines thickness={0.01} color="black" />
          </mesh>
        </group>

        {/* Street Lamp 2 - Same structure as Lamp 1 */}
        <group position={[10, 0, 5]}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
            <meshToonMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0, 4, 0.3]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.5]} />
            <meshToonMaterial
              color="#ffff88"
              emissive="#ffff88"
              emissiveIntensity={0.5}
            />
            <Outlines thickness={0.01} color="black" />
          </mesh>
        </group>

        {/* ================================================================
            PARKED CAR - Decorative vehicle on the street (repositioned)
            ================================================================ */}

        <group position={[15, 0.4, 10]}>

          {/* Car body - main red box */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.8, 0.6, 3.5]} />
            <meshToonMaterial color="#ff4444" />
            <Outlines thickness={0.015} color="black" />
          </mesh>

          {/* Car roof/cabin - smaller box on top */}
          <mesh position={[0, 0.75, -0.3]} castShadow>
            <boxGeometry args={[1.6, 0.5, 1.8]} />
            <meshToonMaterial color="#ff4444" />
            <Outlines thickness={0.015} color="black" />
          </mesh>

          {/* Four wheels */}
          <mesh position={[-0.8, 0, 1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.8, 0, 1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[-0.8, 0, -1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.8, 0, -1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
        </group>

        {/* ================================================================
            INVISIBLE BOUNDARY WALLS - Prevent player from leaving plaza
            ================================================================ */}

        {/* North boundary (back) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2, -25]} visible={false}>
            <boxGeometry args={[50, 4, 0.5]} />
          </mesh>
        </RigidBody>

        {/* South boundary (front) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2, 25]} visible={false}>
            <boxGeometry args={[50, 4, 0.5]} />
          </mesh>
        </RigidBody>

        {/* West boundary (left) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[-25, 2, 0]} visible={false}>
            <boxGeometry args={[0.5, 4, 50]} />
          </mesh>
        </RigidBody>

        {/* East boundary (right) - with gap for road */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[25, 2, -15]} visible={false}>
            <boxGeometry args={[0.5, 4, 20]} />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[25, 2, 15]} visible={false}>
            <boxGeometry args={[0.5, 4, 20]} />
          </mesh>
        </RigidBody>

        {/* ================================================================
            SHOP BUILDING - Your repair shop (imported component)
            PHASE 2: Rotation removed - ShopBuilding handles orientation internally
            ================================================================ */}
        <ShopBuilding position={[0, 0, 0]} />

        {/* ================================================================
            WORKBENCH - Static table surface (non-movable)
            PHASE 3: ESP32 and Breadboard moved to placedComponents state
            ================================================================ */}
        <group position={[0, 1.35, 0]}>
          <Workbench />
        </group>

        {/* ================================================================
            DYNAMIC COMPONENTS - All transformable objects
            PHASE 3: Unified transform system with TransformControls
            Includes: ESP32Board, Breadboard, LEDs, Buttons
            Controls: T=translate, R=rotate, S=scale, Delete=remove
            ================================================================ */}
        {placedComponents.map((component) => (
          <RenderComponent key={component.id} component={component} />
        ))}

        {/* ================================================================
            WIRES - Visual connections between pins
            PHASE 2: Always in world space - coordinates match placement 1:1
            Right-click to delete wires in edit mode
            ================================================================ */}
        {wires.map((wire) => (
          <Wire
            key={wire.id}
            wireId={wire.id}
            startPos={wire.startPos}
            endPos={wire.endPos}
            color="#ff6600"
          />
        ))}

        {/* ================================================================
            PLACEMENT MANAGER - Handles ghost preview and placement
            PHASE 2: Works in unified world space - 1:1 coordinate mapping
            ================================================================ */}
        <PlacementManager />

        {/* ================================================================
            PLAYER CHARACTER - Custom FPS controller with camera-relative movement
            ================================================================ */}
        <FPSCharacterController
          position={[0, 1.3, -10]}
          cameraRotationRef={cameraRotationRef}
          onPositionChange={(pos) => {
            playerPositionRef.current = { x: pos.x, y: pos.y, z: pos.z }
          }}
        />

      </Physics>
      {/* End of Physics world */}
    </>
  )
}

/**
 * ============================================================================
 * HOW THIS ALL WORKS TOGETHER:
 * ============================================================================
 *
 * 1. LIGHTING: Three different lights create a bright, sunny outdoor scene
 *    - Ambient light provides base brightness
 *    - Directional lights simulate sun and fill light
 *    - Hemisphere light adds sky/ground color bounce
 *
 * 2. PHYSICS: Everything inside <Physics> can interact physically
 *    - RigidBody makes objects solid and collidable
 *    - type="fixed" = never moves (ground, buildings, walls)
 *    - The player character has physics so they can walk and collide
 *
 * 3. SCENE STRUCTURE: Built like a real outdoor plaza
 *    - Ground plane (concrete plaza + asphalt street)
 *    - Background buildings for context
 *    - Trees and props for atmosphere
 *    - Your shop building in the center
 *    - Electronics workspace inside the shop
 *
 * 4. VISUAL STYLE: "Borderlands/Schedule 1" cel-shaded aesthetic
 *    - meshToonMaterial = cartoon shading instead of realistic
 *    - Outlines = thick black borders on everything
 *    - Bright, saturated colors
 *    - Low-poly shapes (few triangles/faces)
 *
 * 5. INTERACTIVITY:
 *    - Player can walk around using WASD keys
 *    - Can enter shop through the door
 *    - Can interact with workbench to open code editor
 *    - Can click button and see LED respond to your code
 */
