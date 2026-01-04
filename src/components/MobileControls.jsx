import { useState, useEffect, useRef } from 'react'

export default function MobileControls({ onMove, onJump }) {
  const [isMobile, setIsMobile] = useState(false)
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef(null)
  const touchIdRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleJoystickStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    touchIdRef.current = touch.identifier
    setJoystickActive(true)
    handleJoystickMove(e)
  }

  const handleJoystickMove = (e) => {
    if (!joystickActive && touchIdRef.current === null) return
    e.preventDefault()

    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current)
    if (!touch) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = touch.clientX - centerX
    let deltaY = touch.clientY - centerY

    // Limit to joystick radius
    const maxDistance = 40
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance
      deltaY = (deltaY / distance) * maxDistance
    }

    setJoystickPosition({ x: deltaX, y: deltaY })

    // Convert to movement vector (-1 to 1)
    const moveX = deltaX / maxDistance
    const moveY = deltaY / maxDistance

    onMove({ forward: -moveY, rightward: moveX })
  }

  const handleJoystickEnd = (e) => {
    e.preventDefault()
    setJoystickActive(false)
    setJoystickPosition({ x: 0, y: 0 })
    touchIdRef.current = null
    onMove({ forward: 0, rightward: 0 })
  }

  const handleJumpPress = () => {
    onJump(true)
  }

  const handleJumpRelease = () => {
    onJump(false)
  }

  if (!isMobile) return null

  const styles = {
    joystickContainer: {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '120px',
      height: '120px',
      zIndex: 1500
    },
    joystickOuter: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '3px solid rgba(255, 255, 255, 0.5)',
      position: 'relative',
      touchAction: 'none'
    },
    joystickInner: {
      position: 'absolute',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: '2px solid rgba(0, 0, 0, 0.3)',
      top: '50%',
      left: '50%',
      transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
      transition: joystickActive ? 'none' : 'transform 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    },
    jumpButton: {
      position: 'fixed',
      bottom: '160px',
      right: '20px',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: 'rgba(76, 175, 80, 0.8)',
      border: '3px solid rgba(255, 255, 255, 0.5)',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1500,
      touchAction: 'none',
      userSelect: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      cursor: 'pointer'
    }
  }

  return (
    <>
      {/* Virtual Joystick */}
      <div style={styles.joystickContainer}>
        <div
          ref={joystickRef}
          style={styles.joystickOuter}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          <div style={styles.joystickInner} />
        </div>
      </div>

      {/* Jump Button */}
      <button
        style={styles.jumpButton}
        onTouchStart={handleJumpPress}
        onTouchEnd={handleJumpRelease}
        onTouchCancel={handleJumpRelease}
      >
        ↑
      </button>
    </>
  )
}
