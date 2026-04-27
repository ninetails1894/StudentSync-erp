import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContextObject'

export { AuthContext }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('studentsync_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ss_theme') === 'dark'
  })

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('ss_fontsize') || 'medium'
  })

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('ss_contrast') === 'true'
  })

  const [lineSpacing, setLineSpacingState] = useState(() => {
    return localStorage.getItem('ss_spacing') || 'normal'
  })

  useEffect(() => {
    document.body.classList.remove(
      'font-small', 'font-medium', 'font-large', 'font-xlarge'
    )
    document.body.classList.add(`font-${fontSize}`)
    localStorage.setItem('ss_fontsize', fontSize)
  }, [fontSize])

  useEffect(() => {
    const spacingMap = {
      normal: '1.5',
      relaxed: '1.8',
      double: '2.2'
    }
    document.documentElement.style.setProperty(
      '--line-height-base',
      spacingMap[lineSpacing] || '1.5'
    )
    localStorage.setItem('ss_spacing', lineSpacing)
  }, [lineSpacing])

  useEffect(() => {
    document.body.classList.remove('dark', 'high-contrast')
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else if (darkMode) {
      document.body.classList.add('dark')
    }
    localStorage.setItem('ss_theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('ss_contrast', String(highContrast))
  }, [darkMode, highContrast])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('studentsync_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('studentsync_user')
  }

  const toggleDarkMode = () => setDarkMode(prev => !prev)
  const toggleHighContrast = () => setHighContrast(prev => !prev)
  const setFontSize = (size) => setFontSizeState(size)
  const setLineSpacing = (spacing) => setLineSpacingState(spacing)

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      darkMode, toggleDarkMode,
      highContrast, toggleHighContrast,
      fontSize, setFontSize,
      lineSpacing, setLineSpacing
    }}>
      {children}
    </AuthContext.Provider>
  )
}