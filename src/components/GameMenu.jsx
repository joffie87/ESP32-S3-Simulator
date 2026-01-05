/**
 * ============================================================================
 * GAMEMENU.JSX - Main pause menu with reset and credits
 * ============================================================================
 *
 * Opens with ESC key
 * Contains: Reset Simulation, Credits
 */

import { useState, useEffect } from 'react'
import { useCoding } from '../CodingContext'

export default function GameMenu() {
  const { setPlacedComponents, setWires, setWiring, setPinStates } = useCoding()
  const [isOpen, setIsOpen] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCredits) {
          setShowCredits(false)
        } else if (showResetConfirm) {
          setShowResetConfirm(false)
        } else {
          setIsOpen(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCredits, showResetConfirm])

  const handleReset = () => {
    setShowResetConfirm(true)
  }

  const confirmReset = () => {
    // Reset to initial state
    setPlacedComponents([
      {
        id: 'default-led',
        type: 'led',
        position: [-0.3, 1.52, 0],
        props: { color: '#ff0000' }
      },
      {
        id: 'default-button',
        type: 'button',
        position: [-0.7, 1.52, 0],
        props: {}
      }
    ])
    setWires([])
    setWiring({})
    setPinStates({})

    // Close all menus
    setShowResetConfirm(false)
    setIsOpen(false)

    console.log('[GameMenu] 🔄 Simulation reset to initial state')
  }

  if (!isOpen) return null

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    },
    menu: {
      backgroundColor: '#2a2a2a',
      padding: '40px',
      borderRadius: '16px',
      border: '3px solid #4CAF50',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      minWidth: '400px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: '30px',
      fontFamily: 'monospace',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    button: {
      padding: '15px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#3a3a3a',
      color: '#ffffff',
      border: '2px solid #666666',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    buttonHover: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
      transform: 'scale(1.05)'
    },
    closeButton: {
      marginTop: '20px',
      padding: '10px 20px',
      fontSize: '14px',
      fontFamily: 'monospace',
      backgroundColor: 'transparent',
      color: '#888888',
      border: '2px solid #555555',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    creditsBox: {
      backgroundColor: '#2a2a2a',
      padding: '40px',
      borderRadius: '16px',
      border: '3px solid #4CAF50',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      maxWidth: '600px',
      textAlign: 'left'
    },
    creditsTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: '20px',
      fontFamily: 'monospace',
      textAlign: 'center'
    },
    creditsText: {
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#cccccc',
      fontFamily: 'monospace',
      marginBottom: '15px'
    },
    disclaimer: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#999999',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #555555'
    },
    confirmBox: {
      backgroundColor: '#3a2020',
      padding: '30px',
      borderRadius: '12px',
      border: '3px solid #ff4444',
      maxWidth: '400px'
    },
    confirmTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ff4444',
      marginBottom: '20px',
      fontFamily: 'monospace'
    },
    confirmText: {
      fontSize: '16px',
      color: '#cccccc',
      marginBottom: '25px',
      lineHeight: '1.6'
    },
    confirmButtons: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center'
    },
    cancelButton: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#555555',
      color: '#ffffff',
      border: '2px solid #777777',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    confirmButton: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#ff4444',
      color: '#ffffff',
      border: '2px solid #ff4444',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  }

  // Reset Confirmation Screen
  if (showResetConfirm) {
    return (
      <div style={styles.overlay}>
        <div style={styles.confirmBox}>
          <div style={styles.confirmTitle}>⚠️ RESET SIMULATION?</div>
          <div style={styles.confirmText}>
            This will remove all placed components and wires, returning the simulation to its initial state.
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </div>
          <div style={styles.confirmButtons}>
            <button
              style={styles.cancelButton}
              onClick={() => setShowResetConfirm(false)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#666666'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#555555'}
            >
              Cancel
            </button>
            <button
              style={styles.confirmButton}
              onClick={confirmReset}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#cc3333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4444'}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Credits Screen
  if (showCredits) {
    return (
      <div style={styles.overlay}>
        <div style={styles.creditsBox}>
          <div style={styles.creditsTitle}>ESP32-S3 SIMULATOR</div>

          <div style={styles.creditsText}>
            <strong>Project Lead & Developer:</strong><br />
            [Your Name/Handle]
          </div>

          <div style={styles.creditsText}>
            <strong>Technology Stack:</strong><br />
            React • Three.js • React Three Fiber • Pyodide • Rapier Physics
          </div>

          <div style={styles.creditsText}>
            <strong>Development Approach:</strong><br />
            Educational tool for learning embedded systems programming without physical hardware.
          </div>

          <div style={styles.disclaimer}>
            <strong>AI Development Disclosure:</strong><br /><br />

            This project was developed with AI assistance (Claude by Anthropic) at every step of the process,
            including architecture design, implementation, debugging, and documentation.
            <br /><br />

            However, it would be <strong>currently impossible</strong> for any AI to create a simulation of
            this complexity and scope without extensive human input, decision-making, vision, and iterative
            refinement. The AI served as a tool to accelerate development, but all architectural decisions,
            design choices, feature priorities, and creative direction were human-driven.
            <br /><br />

            This represents a collaboration between human creativity and AI capabilities,
            not autonomous AI generation.
          </div>

          <button
            style={styles.closeButton}
            onClick={() => setShowCredits(false)}
            onMouseEnter={(e) => e.target.style.borderColor = '#888888'}
            onMouseLeave={(e) => e.target.style.borderColor = '#555555'}
          >
            Close (ESC)
          </button>
        </div>
      </div>
    )
  }

  // Main Menu
  return (
    <div style={styles.overlay}>
      <div style={styles.menu}>
        <div style={styles.title}>⚙️ Menu</div>
        <div style={styles.buttonContainer}>
          <button
            style={styles.button}
            onClick={handleReset}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3a3a3a'
              e.target.style.borderColor = '#666666'
              e.target.style.transform = 'scale(1)'
            }}
          >
            🔄 Reset Simulation
          </button>
          <button
            style={styles.button}
            onClick={() => setShowCredits(true)}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3a3a3a'
              e.target.style.borderColor = '#666666'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ℹ️ Credits
          </button>
        </div>
        <button
          style={styles.closeButton}
          onClick={() => setIsOpen(false)}
          onMouseEnter={(e) => e.target.style.borderColor = '#888888'}
          onMouseLeave={(e) => e.target.style.borderColor = '#555555'}
        >
          Resume (ESC)
        </button>
      </div>
    </div>
  )
}
