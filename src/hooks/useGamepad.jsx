import { useEffect, useRef } from 'react'

export default function useGamepad(onInput) {
  const gamepadRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const handleGamepadConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad.id)
      gamepadRef.current = e.gamepad
    }

    const handleGamepadDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id)
      gamepadRef.current = null
    }

    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]

      if (gamepad) {
        // Left stick for movement
        const leftStickX = gamepad.axes[0] // -1 (left) to 1 (right)
        const leftStickY = gamepad.axes[1] // -1 (up) to 1 (down)

        // Apply deadzone
        const deadzone = 0.15
        const forward = Math.abs(leftStickY) > deadzone ? -leftStickY : 0
        const rightward = Math.abs(leftStickX) > deadzone ? leftStickX : 0
        const leftward = Math.abs(leftStickX) > deadzone ? -leftStickX : 0
        const backward = Math.abs(leftStickY) > deadzone ? leftStickY : 0

        // Buttons
        // A button (index 0) or Bottom face button = Jump
        // B button (index 1) or Right face button
        // Right trigger (index 7) or Right shoulder = Run
        const jump = gamepad.buttons[0]?.pressed || false
        const run = gamepad.buttons[7]?.pressed || gamepad.buttons[5]?.pressed || false

        onInput({
          forward: forward > 0 ? forward : 0,
          backward: backward > 0 ? backward : 0,
          leftward: Math.abs(leftward) > 0 ? Math.abs(leftward) : 0,
          rightward: Math.abs(rightward) > 0 ? Math.abs(rightward) : 0,
          jump,
          run
        })
      }

      animationFrameRef.current = requestAnimationFrame(pollGamepad)
    }

    pollGamepad()

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [onInput])

  return gamepadRef.current
}
