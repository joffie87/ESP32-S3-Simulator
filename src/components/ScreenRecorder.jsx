/**
 * ============================================================================
 * SCREENRECORDER.JSX - Gameplay Video Recording
 * ============================================================================
 *
 * Captures entire display (including UI) to MP4/WebM video file.
 * Uses Screen Capture API to record browser tab/window with all UI elements.
 */

import { useState, useRef } from 'react'

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const mimeTypeRef = useRef(null)

  const startRecording = async () => {
    try {
      // Use Screen Capture API to record the entire display (including UI)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: 30
        },
        audio: false
      })

      // Try MP4 first, fallback to WebM if not supported
      let mimeType = 'video/mp4'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'
        console.log('[ScreenRecorder] MP4 not supported, using WebM')
      }
      mimeTypeRef.current = mimeType

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Collect data chunks as they become available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop - save the file
      mediaRecorder.onstop = () => {
        saveRecording()
      }

      // Handle when user stops sharing screen via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (isRecording) {
          stopRecording()
        }
      })

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      console.log('[ScreenRecorder] ✅ Recording started with format:', mimeType)
    } catch (error) {
      console.error('[ScreenRecorder] ❌ Failed to start recording:', error)
      alert('Failed to start recording. Your browser may not support this feature.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log('[ScreenRecorder] ⏹️ Recording stopped, processing video...')
    }
  }

  const saveRecording = () => {
    if (chunksRef.current.length === 0) {
      console.warn('[ScreenRecorder] No video data captured')
      return
    }

    // Create blob from recorded chunks
    const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const extension = mimeTypeRef.current === 'video/mp4' ? 'mp4' : 'webm'
    const filename = `esp32-sim-gameplay-${timestamp}.${extension}`

    // Create temporary download link and trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    console.log('[ScreenRecorder] 💾 Recording saved:', filename)
  }

  return (
    <>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 18px',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          backgroundColor: isRecording ? '#ff0000' : 'rgba(128, 128, 128, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isRecording) {
            e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.9)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isRecording) {
            e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.7)'
          }
        }}
      >
        <span style={{ fontSize: '16px', lineHeight: '1' }}>
          {isRecording ? '■' : '●'}
        </span>
        {isRecording ? 'STOP' : 'REC'}
      </button>

      {/* CSS animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
            box-shadow: 0 4px 8px rgba(255,0,0,0.6);
          }
        }
      `}</style>
    </>
  )
}
