/**
 * ============================================================================
 * INVENTORY.JSX - COMPONENT SELECTION HOTBAR FOR EDIT MODE
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * Creates a Minecraft-style inventory hotbar that appears at the bottom of
 * the screen when edit mode is active. Players can select components to
 * place on the breadboard.
 *
 * KEY FEATURES:
 * - Number key shortcuts (1-5) for quick selection
 * - Visual feedback showing selected item
 * - Only visible in edit mode
 * - Displays 5 items: Red LED, Green LED, Yellow LED, Button, Wire
 */

import { useEffect } from 'react'
import { useCoding } from '../CodingContext'

/**
 * AVAILABLE ITEMS:
 * Array of all placeable components with their display properties.
 * The order matches the number keys (1=Red LED, 2=Green LED, etc.)
 */
const ITEMS = [
  { id: 'led-red', name: 'Red LED', icon: '🔴', color: '#ff0000' },
  { id: 'led-green', name: 'Green LED', icon: '🟢', color: '#00ff00' },
  { id: 'led-yellow', name: 'Yellow LED', icon: '🟡', color: '#ffff00' },
  { id: 'button', name: 'Button', icon: '🔘', color: '#666666' },
  { id: 'wire', name: 'Wire', icon: '➖', color: '#4CAF50' }
]

export default function Inventory() {
  const { isEditMode, selectedItem, setSelectedItem } = useCoding()

  // ========================================================================
  // KEYBOARD SHORTCUTS (Number Keys 1-5)
  // ========================================================================

  useEffect(() => {
    if (!isEditMode) return // Only active in edit mode

    /**
     * Handle number key presses (1-5) to select items
     * Example: Press '1' → Select Red LED (index 0)
     */
    const handleKeyPress = (e) => {
      const num = parseInt(e.key)
      if (num >= 1 && num <= 5) {
        setSelectedItem(ITEMS[num - 1].id) // Arrays are 0-indexed
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress) // Cleanup
  }, [isEditMode, setSelectedItem])

  // Don't render hotbar if not in edit mode
  if (!isEditMode) return null

  // ========================================================================
  // STYLES (Inline CSS-in-JS)
  // ========================================================================

  const styles = {
    // Main hotbar container (centered at bottom)
    hotbar: {
      position: 'fixed',
      bottom: '80px', // Above mobile controls
      left: '50%',
      transform: 'translateX(-50%)', // Center horizontally
      display: 'flex',
      gap: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      zIndex: 1000 // Above 3D scene
    },
    // Individual item slot (changes when selected)
    slot: (isSelected) => ({
      width: '60px',
      height: '60px',
      backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.5)' : 'rgba(40, 40, 40, 0.8)',
      border: isSelected ? '3px solid #4CAF50' : '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s', // Smooth selection animation
      position: 'relative'
    }),
    // Emoji icon (main visual)
    icon: {
      fontSize: '28px',
      marginBottom: '4px'
    },
    // Number indicator (1-5 in top-left corner)
    number: {
      position: 'absolute',
      top: '2px',
      left: '4px',
      fontSize: '10px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    // Item name label (below icon)
    label: {
      fontSize: '9px',
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'monospace',
      textAlign: 'center'
    }
  }

  // ========================================================================
  // RENDER HOTBAR
  // ========================================================================

  return (
    <div style={styles.hotbar}>
      {/* Map through all items and create slots */}
      {ITEMS.map((item, index) => (
        <div
          key={item.id}
          style={styles.slot(selectedItem === item.id)} // Highlight if selected
          onClick={() => setSelectedItem(item.id)} // Click to select
        >
          {/* Number indicator (1-5) */}
          <div style={styles.number}>{index + 1}</div>
          {/* Item icon (emoji) */}
          <div style={styles.icon}>{item.icon}</div>
          {/* Item name (first word only to save space) */}
          <div style={styles.label}>{item.name.split(' ')[0]}</div>
        </div>
      ))}
    </div>
  )
}
