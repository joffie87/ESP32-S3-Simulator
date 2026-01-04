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

// Character controller - lets player walk around with keyboard
import Ecctrl from 'ecctrl'

// Visual helper for cel-shaded (cartoon) outlines
import { Outlines } from '@react-three/drei'

// Our custom components - pieces of the scene we built
import ShopBuilding from './components/ShopBuilding'
import Workbench from './components/Workbench'
import ESP32Board from './components/ESP32Board'
import Breadboard from './components/Breadboard'
import ComponentLED from './components/ComponentLED'
import ComponentButton from './components/ComponentButton'
import PlayerModel from './components/PlayerModel'
import Draggable from './components/Draggable'
import PlacementManager from './components/PlacementManager'
import Wire from './components/Wire'
import { useCoding } from './CodingContext'

// ============================================================================
// MAIN LEVEL COMPONENT
// ============================================================================

export default function Level() {
  const { isEditMode, placedComponents, wires } = useCoding()

  return (
    <>
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
            CITY PLAZA GROUND - The floor of our outdoor scene
            ================================================================ */}

        {/*
          RigidBody = A physics object
          type="fixed" = Never moves (like real ground)
          colliders="cuboid" = Collision shape is a box
        */}
        <RigidBody type="fixed" colliders="cuboid">
          {/*
            mesh = A visible 3D object
            position = [x, y, z] where to place it
            receiveShadow = This surface shows shadows from other objects
          */}
          <mesh position={[0, -0.5, 0]} receiveShadow>
            {/*
              boxGeometry = The shape (a box/cube)
              args = [width, height, depth] in 3D units
              This creates a 50x1x50 flat platform
            */}
            <boxGeometry args={[50, 1, 50]} />

            {/*
              meshToonMaterial = Cartoon-style shading (cel-shaded)
              color = Surface color (warm gray for concrete)
            */}
            <meshToonMaterial color="#c8c8ba" />

            {/*
              Outlines = Thick black outlines for Borderlands/comic style
              thickness = How thick the outline is
            */}
            <Outlines thickness={0.04} color="black" />
          </mesh>
        </RigidBody>

        {/* ================================================================
            STREET - Asphalt road strip with lane markings
            ================================================================ */}

        {/* Main asphalt surface - dark gray */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[15, -0.45, 0]} receiveShadow>
            <boxGeometry args={[10, 0.1, 50]} />  {/* Long thin strip */}
            <meshToonMaterial color="#3a3a3a" />  {/* Dark gray */}
            <Outlines thickness={0.02} color="black" />
          </mesh>
        </RigidBody>

        {/*
          Yellow lane markings - Three dashed lines on the road
          These are just visual (no physics), so no RigidBody wrapper
        */}
        <mesh position={[15, -0.39, -10]} receiveShadow>
          <boxGeometry args={[0.3, 0.05, 3]} />  {/* Thin yellow strip */}
          <meshToonMaterial color="#ffdd44" />
        </mesh>
        <mesh position={[15, -0.39, 0]} receiveShadow>
          <boxGeometry args={[0.3, 0.05, 3]} />
          <meshToonMaterial color="#ffdd44" />
        </mesh>
        <mesh position={[15, -0.39, 10]} receiveShadow>
          <boxGeometry args={[0.3, 0.05, 3]} />
          <meshToonMaterial color="#ffdd44" />
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
            CITY BUILDINGS - Background urban environment
            These create the city skyline that reflects in windows
            ================================================================ */}

        {/* Building 1 - Tall office building (back left) */}
        <mesh position={[-18, 8, -15]} castShadow receiveShadow>
          <boxGeometry args={[6, 16, 8]} />  {/* 6 wide, 16 tall, 8 deep */}
          <meshToonMaterial color="#ccddee" />  {/* Light blue-gray */}
          <Outlines thickness={0.04} color="black" />
        </mesh>

        {/* Building 2 - Medium building (back right) */}
        <mesh position={[20, 6, -12]} castShadow receiveShadow>
          <boxGeometry args={[8, 12, 6]} />
          <meshToonMaterial color="#eeddcc" />  {/* Beige */}
          <Outlines thickness={0.04} color="black" />
        </mesh>

        {/* Building 3 - Short building (left side) */}
        <mesh position={[-20, 4, 5]} castShadow receiveShadow>
          <boxGeometry args={[5, 8, 10]} />
          <meshToonMaterial color="#ffddbb" />  {/* Peach */}
          <Outlines thickness={0.035} color="black" />
        </mesh>

        {/* Building 4 - Tall apartment (back center) */}
        <mesh position={[0, 10, -20]} castShadow receiveShadow>
          <boxGeometry args={[7, 20, 6]} />  {/* Tallest building */}
          <meshToonMaterial color="#aaccdd" />  {/* Blue-gray */}
          <Outlines thickness={0.045} color="black" />
        </mesh>

        {/* Building 5 - Commercial building (right side) */}
        <mesh position={[22, 5, 8]} castShadow receiveShadow>
          <boxGeometry args={[6, 10, 12]} />
          <meshToonMaterial color="#ddccaa" />  {/* Tan */}
          <Outlines thickness={0.035} color="black" />
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
            PARKED CAR - Decorative vehicle on the street
            ================================================================ */}

        <group position={[16, 0.4, -8]}>

          {/* Car body - main red box */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.8, 0.6, 3.5]} />
            <meshToonMaterial color="#ff4444" />  {/* Bright red */}
            <Outlines thickness={0.015} color="black" />
          </mesh>

          {/* Car roof/cabin - smaller box on top */}
          <mesh position={[0, 0.75, -0.3]} castShadow>
            <boxGeometry args={[1.6, 0.5, 1.8]} />
            <meshToonMaterial color="#ff4444" />
            <Outlines thickness={0.015} color="black" />
          </mesh>

          {/*
            Four wheels - black cylinders rotated to be horizontal
            rotation = [x, y, z] in radians
            Math.PI / 2 = 90 degrees
          */}
          <mesh position={[-0.8, 0, 1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
            <meshToonMaterial color="#1a1a1a" />  {/* Black */}
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
            SHOP BUILDING - Your repair shop (imported component)
            Rotated 180° so window faces the player
            Includes workbench and electronics inside for proper positioning
            ================================================================ */}
        <group rotation={[0, Math.PI, 0]}>
          <ShopBuilding position={[0, 0, 0]} />

          {/* ================================================================
              WORKBENCH AND ELECTRONICS - The interactive workspace
              ================================================================ */}

          {/*
            Workbench - The table surface
            Moved back from window to z=4.0 (1.5 units from window sill)
            Height y=1.35 sits on shop floor
            Wrapped in Draggable for drag-and-drop functionality
          */}
          <Draggable position={[0, 1.35, 4.0]}>
            <Workbench />
          </Draggable>

          {/*
            ESP32 Board - The microcontroller you'll program
            Scaled to 17% (0.17) to be ~1/3 the workbench size
            Rotated lengthwise (90 degrees on Y axis)
            Positioned on left side of workbench, sitting on surface at y=1.5
            Wrapped in Draggable for drag-and-drop functionality
          */}
          <Draggable position={[-0.4, 1.5, 4.0]}>
            <group rotation={[0, Math.PI / 2, 0]} scale={0.17}>
              <ESP32Board />
            </group>
          </Draggable>

          {/*
            Breadboard - Where you plug in components
            Scaled to 60% (0.6) to match ESP32 size
            Positioned on right side of workbench, sitting on surface at y=1.49
            Wrapped in Draggable for drag-and-drop functionality
          */}
          <Draggable position={[0.5, 1.49, 4.0]}>
            <group scale={0.6}>
              <Breadboard />
            </group>
          </Draggable>

          {/*
            LED Component - Light that turns on/off
            Scaled to 60% (0.6) to match other components
            Positioned ON the breadboard at left side
            Must be wired to an ESP32 pin to work
            color="#ff0000" = red LED
            Wrapped in Draggable for drag-and-drop functionality
          */}
          <Draggable position={[0.3, 1.52, 4.0]}>
            <group scale={0.6}>
              <ComponentLED componentId="default-led" color="#ff0000" />
            </group>
          </Draggable>

          {/*
            Button Component - Clickable input button
            Scaled to 60% (0.6) to match other components
            Positioned ON the breadboard at right side
            connectedPin={0} means pressing it sends signal to GPIO pin 0
            Wrapped in Draggable for drag-and-drop functionality
          */}
          <Draggable position={[0.7, 1.52, 4.0]}>
            <group scale={0.6}>
              <ComponentButton connectedPin={0} />
            </group>
          </Draggable>

          {/* ================================================================
              PLACED COMPONENTS - Dynamically placed items in Creative Mode
              Right-click to delete in edit mode
              ================================================================ */}
          {placedComponents.map((component) => (
            <Draggable key={component.id} position={component.position} componentId={component.id}>
              <group scale={0.6}>
                {component.type === 'led' && (
                  <ComponentLED
                    componentId={component.id}
                    color={component.props.color || '#ff0000'}
                  />
                )}
                {component.type === 'button' && (
                  <ComponentButton
                    componentId={component.id}
                  />
                )}
              </group>
            </Draggable>
          ))}

        </group>

        {/* ================================================================
            WIRES - Visual connections between pins
            IMPORTANT: Rendered OUTSIDE rotated group because wire positions
            are captured in world space coordinates by PlacementManager
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
            Works in world space (outside rotated group) for simplicity
            ================================================================ */}
        <PlacementManager />

        {/* ================================================================
            PLAYER CHARACTER - You! The person exploring the world
            ================================================================ */}

        {/*
          Ecctrl = Character controller (handles walking, jumping, camera)
          position = Where player spawns (in front of shop window)
          Wrapped in rotated group to face both camera and controls towards shop
        */}
        <group rotation={[0, Math.PI, 0]}>
          <Ecctrl position={[0, 0, 10]}>
            {/* PlayerModel = The 3D character you see (tactical person with sunglasses) */}
            <PlayerModel />
          </Ecctrl>
        </group>

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
