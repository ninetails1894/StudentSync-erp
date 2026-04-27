import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function KeyboardHelp({ onClose }) {
  const { darkMode } = useContext(AuthContext)

  const shortcuts = [
    { key: 'Tab', desc: 'Move to next interactive element' },
    { key: 'Shift + Tab', desc: 'Move to previous element' },
    { key: 'Enter / Space', desc: 'Activate buttons and links' },
    { key: '← →', desc: 'Navigate between dashboard tabs' },
    { key: 'Escape', desc: 'Close any open popup or modal' },
    { key: '/', desc: 'Focus the search bar' },
    { key: 'N', desc: 'Open Notice Board' },
    { key: 'H', desc: 'Open Help Desk' },
    { key: 'D', desc: 'Toggle Dark Mode' },
  ]

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modal: {
      background: darkMode ? '#16213e' : '#fff',
      borderRadius: '16px',
      padding: '28px',
      width: '90%',
      maxWidth: '480px',
      fontFamily: 'Segoe UI, sans-serif',
      color: darkMode ? '#e0e0e0' : '#1a1a2e'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: darkMode ? '#e0e0e0' : '#333'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px solid ${darkMode ? '#0f3460' : '#f0f0f0'}`
    },
    keyBadge: {
      background: darkMode ? '#0f3460' : '#f0f4ff',
      color: darkMode ? '#e0e0e0' : '#4361ee',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      fontFamily: 'monospace',
      border: `1px solid ${darkMode ? '#4361ee' : '#c0d0ff'}`
    },
    desc: {
      fontSize: '13px',
      color: darkMode ? '#a0a0b0' : '#555',
      flex: 1,
      marginLeft: '16px'
    }
  }

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>⌨️ Keyboard Shortcuts</span>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
          >
            ✕
          </button>
        </div>

        {shortcuts.map((s, i) => (
          <div key={i} style={styles.row}>
            <span style={styles.keyBadge}>{s.key}</span>
            <span style={styles.desc}>{s.desc}</span>
          </div>
        ))}

        <p style={{
          marginTop: '16px',
          fontSize: '12px',
          color: darkMode ? '#7070a0' : '#aaa',
          textAlign: 'center'
        }}>
          Press Escape to close this panel
        </p>
      </div>
    </div>
  )
}