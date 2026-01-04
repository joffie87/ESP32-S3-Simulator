import { createContext, useContext, useState, useEffect, useRef } from 'react'

const CodingContext = createContext()

export function CodingProvider({ children }) {
  const [isCoding, setIsCoding] = useState(false)
  const [pinStates, setPinStates] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const workerRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCoding) {
        setIsCoding(false)
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsEditMode(prev => !prev)
        console.log('Edit mode:', !isEditMode ? 'ON' : 'OFF')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCoding, isEditMode])

  const setPinInput = (pin, value) => {
    console.log(`setPinInput called: pin=${pin}, value=${value}, worker=${workerRef.current ? 'ready' : 'not ready'}`)
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'INPUT_UPDATE',
        pin: pin,
        value: value
      })
      console.log(`Sent INPUT_UPDATE to worker`)
    } else {
      console.warn('Worker not initialized yet, cannot set pin input')
    }
  }

  return (
    <CodingContext.Provider value={{
      isCoding,
      setIsCoding,
      pinStates,
      setPinStates,
      workerRef,
      setPinInput,
      isEditMode,
      setIsEditMode
    }}>
      {children}
    </CodingContext.Provider>
  )
}

export function useCoding() {
  const context = useContext(CodingContext)
  if (!context) {
    throw new Error('useCoding must be used within CodingProvider')
  }
  return context
}
