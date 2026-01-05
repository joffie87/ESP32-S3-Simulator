/**
 * BREADBOARD.JSX - Smart Surface with Grid Snap System
 *
 * PHASE 1: Grid-based component placement
 * - Components placed using (row, col) grid coordinates
 * - Automatic conversion to local 3D positions
 * - Snap points for precise alignment
 *
 * PHASE 2 (Previous): Wrapped in rotation={[0, Math.PI, 0]} for world space alignment
 */

import { Outlines } from '@react-three/drei'

// ============================================================================
// BREADBOARD GRID CONFIGURATION
// ============================================================================

/**
 * Grid dimensions and spacing
 */
export const BREADBOARD_CONFIG = {
  ROWS: 10,           // Total rows (0-9)
  COLS: 30,           // Total columns (0-29)
  PITCH: 0.05,        // Distance between holes (in 3D units)
  ORIGIN_X: -0.7,     // Local X position of grid origin (row=0, col=0)
  ORIGIN_Z: -0.2,     // Local Z position of grid origin (row=0, col=0)
  SURFACE_Y: 0.04     // Y offset above breadboard surface for components
}

// ============================================================================
// COORDINATE CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert grid coordinates (row, col) to local 3D position (x, y, z)
 *
 * @param {number} row - Grid row (0-9)
 * @param {number} col - Grid column (0-29)
 * @returns {[number, number, number]} Local position [x, y, z]
 *
 * @example
 * gridToLocal(5, 15) // Returns [0.05, 0.04, 0.05] - center of breadboard
 */
export function gridToLocal(row, col) {
  const x = BREADBOARD_CONFIG.ORIGIN_X + (col * BREADBOARD_CONFIG.PITCH)
  const y = BREADBOARD_CONFIG.SURFACE_Y
  const z = BREADBOARD_CONFIG.ORIGIN_Z + (row * BREADBOARD_CONFIG.PITCH)
  return [x, y, z]
}

/**
 * Convert local 3D position to nearest grid coordinates
 *
 * @param {number} x - Local X position
 * @param {number} z - Local Z position
 * @returns {{ row: number, col: number, position: [number, number, number] }}
 *
 * @example
 * localToGrid(0.05, 0.05) // Returns { row: 5, col: 15, position: [0.05, 0.04, 0.05] }
 */
export function localToGrid(x, z) {
  // Calculate grid indices
  const col = Math.round((x - BREADBOARD_CONFIG.ORIGIN_X) / BREADBOARD_CONFIG.PITCH)
  const row = Math.round((z - BREADBOARD_CONFIG.ORIGIN_Z) / BREADBOARD_CONFIG.PITCH)

  // Clamp to valid range
  const clampedRow = Math.max(0, Math.min(BREADBOARD_CONFIG.ROWS - 1, row))
  const clampedCol = Math.max(0, Math.min(BREADBOARD_CONFIG.COLS - 1, col))

  // Return grid coordinates and snapped position
  return {
    row: clampedRow,
    col: clampedCol,
    position: gridToLocal(clampedRow, clampedCol),
    isValid: row >= 0 && row < BREADBOARD_CONFIG.ROWS &&
             col >= 0 && col < BREADBOARD_CONFIG.COLS
  }
}

/**
 * Check if grid coordinates are within valid bounds
 *
 * @param {number} row - Grid row
 * @param {number} col - Grid column
 * @returns {boolean}
 */
export function isValidGridPosition(row, col) {
  return row >= 0 && row < BREADBOARD_CONFIG.ROWS &&
         col >= 0 && col < BREADBOARD_CONFIG.COLS
}

// ============================================================================
// BREADBOARD COMPONENT
// ============================================================================

export default function Breadboard({ position = [0, 0, 0], componentId = 'breadboard-main' }) {
  const holes = []

  // Generate hole positions using grid system
  for (let row = 0; row < BREADBOARD_CONFIG.ROWS; row++) {
    for (let col = 0; col < BREADBOARD_CONFIG.COLS; col++) {
      const [x, y, z] = gridToLocal(row, col)
      holes.push({ row, col, x, z })
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
  }

  return (
    <group position={position} onClick={handleClick} userData={{
      placementSurface: 'breadboard',
      componentId: componentId,
      gridSize: BREADBOARD_CONFIG.PITCH,
      gridRows: BREADBOARD_CONFIG.ROWS,
      gridCols: BREADBOARD_CONFIG.COLS
    }}>
      {/* Internal rotation fix - makes breadboard holes align with world space */}
      <group rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, 0]} userData={{
        placementSurface: 'breadboard',
        componentId: componentId,
        gridSize: BREADBOARD_CONFIG.PITCH,
        gridRows: BREADBOARD_CONFIG.ROWS,
        gridCols: BREADBOARD_CONFIG.COLS,
        smartSurface: true // Flag for PlacementManager
      }}>
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
      {/* End internal rotation fix */}
    </group>
  )
}
