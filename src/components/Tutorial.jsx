import { useState } from 'react'

export default function Tutorial() {
  const [isVisible, setIsVisible] = useState(true)
  const [tutorialActive, setTutorialActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const tutorialSteps = [
    {
      title: "Welcome to ESP32 Simulator!",
      content: "Learn the basics in this quick tutorial. Click 'Start Tutorial' to begin!"
    },
    {
      title: "Movement Controls",
      content: "Use WASD or Arrow Keys to move around. Press SPACE to jump. Hold SHIFT to run faster."
    },
    {
      title: "Camera Control",
      content: "Move your mouse to look around. Explore the environment!"
    },
    {
      title: "Workbench Interaction",
      content: "Walk up to the workbench (the brown table) and click on it to open the code editor."
    },
    {
      title: "Try the Examples",
      content: "In the code editor, you'll find 3 example programs:\n1. Blink LED - Makes the red LED blink\n2. Button Input - Read button presses\n3. Button Toggle - Toggle LED with button"
    },
    {
      title: "Edit Mode (Advanced)",
      content: "Press G to enter Edit Mode - you can drag and reposition objects in the scene!"
    },
    {
      title: "Tutorial Complete!",
      content: "You're ready to start coding! Click the workbench to begin."
    }
  ]

  const startTutorial = () => {
    setTutorialActive(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setTutorialActive(false)
      setIsVisible(false)
    }
  }

  const skipTutorial = () => {
    setTutorialActive(false)
    setIsVisible(false)
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}
      >
        Show Tutorial
      </button>
    )
  }

  return (
    <>
      {/* Control Hints - Always visible in corner */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Controls</div>
        <div style={{ lineHeight: '1.6' }}>
          <div><strong>WASD</strong> - Move</div>
          <div><strong>SPACE</strong> - Jump</div>
          <div><strong>SHIFT</strong> - Run</div>
          <div><strong>MOUSE</strong> - Look</div>
          <div><strong>CLICK</strong> - Interact</div>
          <div><strong>G</strong> - Edit Mode</div>
          <div><strong>ESC</strong> - Menu</div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {tutorialActive && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          maxWidth: '500px',
          width: '90%',
          zIndex: 2000,
          border: '2px solid #4CAF50'
        }}>
          <h2 style={{ marginTop: 0, color: '#4CAF50' }}>
            {tutorialSteps[currentStep].title}
          </h2>
          <p style={{
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            fontSize: '14px'
          }}>
            {tutorialSteps[currentStep].content}
          </p>

          <div style={{
            marginTop: '20px',
            fontSize: '12px',
            color: '#aaa'
          }}>
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={nextStep}
              style={{
                flex: 1,
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
            </button>
            <button
              onClick={skipTutorial}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Start Tutorial Button */}
      {!tutorialActive && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 1000
        }}>
          <button
            onClick={startTutorial}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
          >
            Start Tutorial
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
          >
            Hide
          </button>
        </div>
      )}
    </>
  )
}
