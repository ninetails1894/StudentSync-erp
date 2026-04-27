import API_BASE from '../config'
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import FaceAuth from '../components/FaceAuth'
import SkipNav from '../components/SkipNav'
import { speak } from '../voice'

export default function LoginPage() {
  const { login, darkMode } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFaceLogin, setShowFaceLogin] = useState(false)
  const [showManualLogin, setShowManualLogin] = useState(false)

  const handleFaceLoginSuccess = (userData) => {
    setShowFaceLogin(false)
    login(userData)
    speak(
      `Welcome ${userData.name}! Login successful. Loading your dashboard.`,
      'assertive'
    )
    if (userData.role === 'student') navigate('/student')
    else if (userData.role === 'teacher') navigate('/teacher')
    else if (userData.role === 'admin') navigate('/admin')
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    speak('Logging in. Please wait.')
    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/login`,
        formData
      )
      login(response.data)
      speak(
        `Welcome ${response.data.name}! Login successful.`,
        'assertive'
      )
      if (response.data.role === 'student') navigate('/student')
      else if (response.data.role === 'teacher') navigate('/teacher')
      else if (response.data.role === 'admin') navigate('/admin')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.'
      setError(msg)
      speak(msg, 'assertive')
    } finally {
      setLoading(false)
    }
  }

  const bg = darkMode ? '#1a1a2e' : '#f0f4ff'
  const cardBg = darkMode ? '#16213e' : '#ffffff'
  const textColor = darkMode ? '#e0e0e0' : '#1a1a2e'
  const mutedColor = darkMode ? '#a0a0b0' : '#666'
  const inputBg = darkMode ? '#0f3460' : '#f9f9f9'
  const inputColor = darkMode ? '#e0e0e0' : '#333'

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: inputBg,
    color: inputColor,
    fontSize: '15px',
    boxSizing: 'border-box'
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        fontFamily: 'Segoe UI, sans-serif',
        paddingTop: '60px'
      }}
      role="main"
    >
      <SkipNav />

      <h1 style={{
        position: 'absolute',
        width: '1px', height: '1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)'
      }}>
        StudentSync ERP System — Login Page
      </h1>

      <div style={{
        background: cardBg,
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: textColor,
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: '700'
        }}>
          StudentSync
        </h2>
        <p style={{
          textAlign: 'center',
          color: mutedColor,
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          ERP System
        </p>

        <p style={{
          textAlign: 'center',
          color: '#06d6a0',
          fontSize: '12px',
          marginBottom: '24px',
          fontWeight: '500'
        }}>
          🔊 Press Tab once for Voice Assistant
        </p>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: '#ffe0e0',
              color: '#c00',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center',
              fontSize: '14px'
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1 — Role Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="role-select"
            style={{
              display: 'block',
              marginBottom: '6px',
              color: mutedColor,
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            STEP 1 — Select Your Role
          </label>
          <select
            id="role-select"
            tabIndex={2}
            value={formData.role}
            onChange={(e) => {
              setFormData({ ...formData, role: e.target.value })
              speak(`Role selected: ${e.target.value}`, 'assertive')
            }}
            onFocus={() => speak(
              `Step 1. Select your role. Currently ${formData.role}.` +
              ' Use Arrow keys to change. Options are Student, Teacher, Admin.'
            )}
            aria-label={
              `Step 1 — Select your role — currently ${formData.role}` +
              ' — use Arrow keys to change'
            }
            style={{
              ...inputStyle,
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Step 2 — Face Login */}
        <div style={{
          background: darkMode ? '#0a2a1a' : '#e8fff5',
          border: '2px solid #06d6a0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '12px',
            color: darkMode ? '#06d6a0' : '#008060',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            ♿ FOR VISUALLY IMPAIRED USERS
          </p>
          <p style={{
            fontSize: '12px',
            color: mutedColor,
            marginBottom: '14px'
          }}>
            No typing required — uses face recognition
          </p>
          <button
            tabIndex={3}
            onClick={() => {
              setShowFaceLogin(true)
              speak(
                'Opening face recognition camera. ' +
                'Please look directly at the camera. ' +
                'Recognition is fully automatic. No typing needed.',
                'assertive'
              )
            }}
            onFocus={() => speak(
              'Step 2. Login with Face Recognition button. ' +
              'No typing required. ' +
              'Press Enter to open the camera and login with your face automatically.'
            )}
            aria-label={
              'Step 2 — Login with Face Recognition — ' +
              'no typing required — press Enter to open camera'
            }
            style={{
              width: '100%',
              padding: '14px',
              background: '#06d6a0',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '20px' }}>👁️</span>
            Login with Face Recognition
          </button>
        </div>

        {/* Step 3 — Manual Login */}
        <button
          tabIndex={4}
          onClick={() => {
            setShowManualLogin(prev => !prev)
            speak(
              showManualLogin
                ? 'Manual login form hidden'
                : 'Manual login form expanded. Tab to username field.',
              'assertive'
            )
          }}
          onFocus={() => speak(
            'Manual login toggle. For sighted users who prefer typing ' +
            'username and password. Press Enter to expand.'
          )}
          aria-label="Toggle manual login with username and password"
          aria-expanded={showManualLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: mutedColor,
            border: `1px solid ${darkMode ? '#333' : '#ddd'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>🔑</span>
          {showManualLogin
            ? 'Hide manual login'
            : 'Manual login (username & password)'
          }
        </button>

        {showManualLogin && (
          <form
            onSubmit={handleManualSubmit}
            style={{ marginTop: '16px' }}
            noValidate
          >
            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="username-input"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: mutedColor,
                  fontSize: '14px'
                }}
              >
                Username
              </label>
              <input
                id="username-input"
                type="text"
                tabIndex={5}
                aria-label="Username — type your username"
                aria-required="true"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({
                  ...formData, username: e.target.value
                })}
                onFocus={() => speak(
                  'Username text field. Required. Type your username.'
                )}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: mutedColor,
                  fontSize: '14px'
                }}
              >
                Password
              </label>
              <input
                id="password-input"
                type="password"
                tabIndex={6}
                aria-label="Password — type your password"
                aria-required="true"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({
                  ...formData, password: e.target.value
                })}
                onFocus={() => speak(
                  'Password field. Required. Type your password.'
                )}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              tabIndex={7}
              disabled={loading}
              aria-label="Submit — login with username and password"
              onFocus={() => speak(
                'Login button. Press Enter to submit your credentials.'
              )}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#999' : '#4361ee',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </div>

      {showFaceLogin && (
        <FaceAuth
          mode="login"
          role={formData.role}
          onSuccess={handleFaceLoginSuccess}
          onClose={() => {
            setShowFaceLogin(false)
            speak(
              'Face login cancelled. ' +
              'Press Tab to go back to the face login button.',
              'assertive'
            )
          }}
        />
      )}
    </div>
  )
}