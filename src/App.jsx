import { memo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Environment } from '@react-three/drei'
import Level from './Level'
import { CodingProvider, useCoding } from './CodingContext'
import CodingOverlay from './components/CodingOverlay'
import Tutorial from './components/Tutorial'
import MobileControls from './components/MobileControls'
import Inventory from './components/Inventory'
import GameMenu from './components/GameMenu'
import useGamepad from './hooks/useGamepad'

// Memoize Level to prevent re-renders when context updates (fixes player bounce glitch)
const MemoizedLevel = memo(Level)

function AppContent() {
  const {
    isCoding,
    setIsCoding,
    isEditMode,
    gizmoModeActive,
    setVirtualInput,
    hoveredPinInfoRef,
    subscribeToHoverInfo,
    wireInProgress,
    isMouseMode,
    isPointerLocked,
    setIsPointerLocked
  } = useCoding()

  // Local state for hover tooltip - isolated from context
  const [hoveredPinInfo, setHoveredPinInfo] = useState(null)

  // Subscribe to hover info changes
  useEffect(() => {
    const updateHoverInfo = () => {
      setHoveredPinInfo(hoveredPinInfoRef.current)
    }

    // Set initial value
    updateHoverInfo()

    // Subscribe to changes
    return subscribeToHoverInfo(updateHoverInfo)
  }, [hoveredPinInfoRef, subscribeToHoverInfo])

  // Pointer lock management
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null)
    }

    const handleClick = () => {
      // Lock pointer when clicking canvas in normal gameplay mode
      if (!isEditMode && !isMouseMode && !isCoding) {
        document.body.requestPointerLock()
      }
    }

    // Auto-release pointer lock when entering edit/mouse/coding modes
    if (isEditMode || isMouseMode || isCoding) {
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('click', handleClick)
    }
  }, [isEditMode, isMouseMode, isCoding, setIsPointerLocked])

  // Handle mobile virtual controls
  const handleMobileMove = ({ forward, rightward }) => {
    setVirtualInput(prev => ({ ...prev, forward, rightward }))
  }

  const handleMobileJump = (isJumping) => {
    setVirtualInput(prev => ({ ...prev, jump: isJumping }))
  }

  // Handle gamepad input
  const handleGamepadInput = (input) => {
    setVirtualInput({
      forward: input.forward - input.backward,
      rightward: input.rightward - input.leftward,
      jump: input.jump
    })
  }

  useGamepad(handleGamepadInput)

  return (
    <>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
          { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
          { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
          { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
          { name: 'jump', keys: ['Space'] },
          { name: 'run', keys: ['Shift'] },
        ]}
      >
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 50 }}
          style={{ width: '100vw', height: '100vh' }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Environment preset="city" />
          <MemoizedLevel />
        </Canvas>
      </KeyboardControls>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          backgroundColor: gizmoModeActive ? '#FF6B35' : '#4CAF50',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          border: `2px solid ${gizmoModeActive ? '#E55934' : '#45a049'}`
        }}>
          {gizmoModeActive ? (
            <>🎯 GIZMO MODE - Click=Select | T/R/S=Transform | Delete=Remove | X=Exit Gizmo</>
          ) : (
            <>✏️ EDIT MODE - 1-5=Tools | Click=Place | X=Gizmo Mode | G=Exit</>
          )}
        </div>
      )}

      {/* Wire In Progress Indicator */}
      {wireInProgress && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          backgroundColor: '#FFA500',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          border: '2px solid #FF8C00',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🔌 WIRE IN PROGRESS - Click pin to complete | ESC or Right-click to cancel
        </div>
      )}

      {/* Crosshairs - Center screen aim point */}
      {!isEditMode && !isMouseMode && !isCoding && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 999
        }}>
          {/* Horizontal line */}
          <div style={{
            position: 'absolute',
            width: '20px',
            height: '2px',
            backgroundColor: '#2d5016',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            width: '2px',
            height: '20px',
            backgroundColor: '#2d5016',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            backgroundColor: '#2d5016',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
        </div>
      )}

      {/* Hover Tooltip - Shows pin/component name when hovering */}
      {hoveredPinInfo && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333333',
          color: '#ffffff',
          padding: '16px 32px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 6px 12px rgba(0,0,0,0.6)',
          border: '3px solid #ffffff',
          pointerEvents: 'none',
          letterSpacing: '1px'
        }}>
          {hoveredPinInfo}
        </div>
      )}

      <CodingOverlay
        isVisible={isCoding}
        onClose={() => setIsCoding(false)}
      />

      {/* Tutorial and Control Hints */}
      <Tutorial />

      {/* Creative Mode Inventory Hotbar */}
      <Inventory />

      {/* Mobile Touch Controls */}
      <MobileControls onMove={handleMobileMove} onJump={handleMobileJump} />

      {/* Game Menu (ESC key) */}
      <GameMenu />
    </>
  )
}

function App() {
  return (
    <CodingProvider>
      <AppContent />
    </CodingProvider>
  )
}

export default App
