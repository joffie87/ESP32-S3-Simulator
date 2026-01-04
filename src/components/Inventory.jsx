import { useEffect } from 'react'
import { useCoding } from '../CodingContext'

const ITEMS = [
  { id: 'led-red', name: 'Red LED', icon: '🔴', color: '#ff0000' },
  { id: 'led-green', name: 'Green LED', icon: '🟢', color: '#00ff00' },
  { id: 'led-yellow', name: 'Yellow LED', icon: '🟡', color: '#ffff00' },
  { id: 'button', name: 'Button', icon: '🔘', color: '#666666' },
  { id: 'wire', name: 'Wire', icon: '➖', color: '#4CAF50' }
]

export default function Inventory() {
  const { isEditMode, selectedItem, setSelectedItem } = useCoding()

  useEffect(() => {
    if (!isEditMode) return

    const handleKeyPress = (e) => {
      const num = parseInt(e.key)
      if (num >= 1 && num <= 5) {
        setSelectedItem(ITEMS[num - 1].id)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isEditMode, setSelectedItem])

  if (!isEditMode) return null

  const styles = {
    hotbar: {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      zIndex: 1000
    },
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
      transition: 'all 0.2s',
      position: 'relative'
    }),
    icon: {
      fontSize: '28px',
      marginBottom: '4px'
    },
    number: {
      position: 'absolute',
      top: '2px',
      left: '4px',
      fontSize: '10px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    label: {
      fontSize: '9px',
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'monospace',
      textAlign: 'center'
    }
  }

  return (
    <div style={styles.hotbar}>
      {ITEMS.map((item, index) => (
        <div
          key={item.id}
          style={styles.slot(selectedItem === item.id)}
          onClick={() => setSelectedItem(item.id)}
        >
          <div style={styles.number}>{index + 1}</div>
          <div style={styles.icon}>{item.icon}</div>
          <div style={styles.label}>{item.name.split(' ')[0]}</div>
        </div>
      ))}
    </div>
  )
}
