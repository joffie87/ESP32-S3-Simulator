import { memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Environment } from '@react-three/drei'
import Level from './Level'
import { CodingProvider, useCoding } from './CodingContext'
import CodingOverlay from './components/CodingOverlay'

// Memoize Level to prevent re-renders when context updates (fixes player bounce glitch)
const MemoizedLevel = memo(Level)

function AppContent() {
  const { isCoding, setIsCoding, isEditMode } = useCoding()

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
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          border: '2px solid #45a049'
        }}>
          🎯 EDIT MODE - Drag to move objects | Press G to exit
        </div>
      )}

      <CodingOverlay
        isVisible={isCoding}
        onClose={() => setIsCoding(false)}
      />
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
