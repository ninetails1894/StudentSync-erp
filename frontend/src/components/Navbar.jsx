import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import KeyboardHelp from './KeyboardHelp'

export default function Navbar({ onNoticeClick, onHelpdeskClick }) {
  const { user, logout, darkMode, toggleDarkMode } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showKeyHelp, setShowKeyHelp] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const roleColor = {
    student: '#4361ee',
    teacher: '#3a86ff',
    admin: '#e63946'
  }

  const styles = {
    navbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '60px',
      background: darkMode ? '#16213e' : '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: 'Segoe UI, sans-serif',
      flexWrap: 'wrap',
      gap: '8px'
    },
    logo: {
      fontSize: '18px',
      fontWeight: '700',
      color: darkMode ? '#e0e0e0' : '#1a1a2e'
    },
    roleBadge: {
      background: roleColor[user?.role] || '#4361ee',
      color: '#fff',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'capitalize',
      marginLeft: '10px'
    },
    welcomeText: {
      fontSize: '13px',
      color: darkMode ? '#a0a0b0' : '#555',
      marginLeft: '8px'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    navBtn: {
      padding: '7px 12px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      background: darkMode ? '#0f3460' : '#f0f4ff',
      color: darkMode ? '#e0e0e0' : '#4361ee'
    },
    toggleBtn: {
      padding: '7px 12px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      background: darkMode ? '#f0f4ff' : '#1a1a2e',
      color: darkMode ? '#1a1a2e' : '#f0f4ff'
    },
    logoutBtn: {
      padding: '7px 12px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      background: '#e63946',
      color: '#fff'
    }
  }

  return (
    <>
      <nav
        style={styles.navbar}
        role="navigation"
        aria-label="Main navigation"
      >
        <div style={styles.leftSection}>
          <span style={styles.logo} aria-label="StudentSync ERP">
            StudentSync
          </span>
          <span
            style={styles.roleBadge}
            aria-label={`Logged in as ${user?.role}`}
          >
            {user?.role}
          </span>
          <span
            style={styles.welcomeText}
            aria-live="polite"
          >
            Welcome, {user?.name}!
          </span>
        </div>

        <div style={styles.rightSection} role="menubar">
          <button
            style={styles.navBtn}
            onClick={onNoticeClick}
            onKeyDown={e => e.key === 'Enter' && onNoticeClick()}
            tabIndex={0}
            role="menuitem"
            aria-label="Open Notice Board (press N)"
            title="Notice Board (N)"
          >
            📋 Notices
          </button>

          <button
            style={styles.navBtn}
            onClick={onHelpdeskClick}
            onKeyDown={e => e.key === 'Enter' && onHelpdeskClick()}
            tabIndex={0}
            role="menuitem"
            aria-label="Open Help Desk (press H)"
            title="Help Desk (H)"
          >
            🎧 Help Desk
          </button>

          <button
            style={styles.toggleBtn}
            onClick={toggleDarkMode}
            onKeyDown={e => e.key === 'Enter' && toggleDarkMode()}
            tabIndex={0}
            role="menuitem"
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode (press D)`}
            aria-pressed={darkMode}
            title="Toggle Dark Mode (D)"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            style={styles.navBtn}
            onClick={() => setShowKeyHelp(true)}
            onKeyDown={e => e.key === 'Enter' && setShowKeyHelp(true)}
            tabIndex={0}
            role="menuitem"
            aria-label="View keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            ⌨️
          </button>

          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
            onKeyDown={e => e.key === 'Enter' && handleLogout()}
            tabIndex={0}
            role="menuitem"
            aria-label="Logout from StudentSync"
          >
            Logout
          </button>
        </div>
      </nav>

      {showKeyHelp && (
        <KeyboardHelp onClose={() => setShowKeyHelp(false)} />
      )}
    </>
  )
}