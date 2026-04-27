import API_BASE from '../config'
import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

export default function HelpDesk({ onClose }) {
  const { user, darkMode } = useContext(AuthContext)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    studentId: user?.studentId || user?.username || '',
    department: user?.department || '',
    phone: user?.phone || '',
    email: user?.email || '',
    message: ''
  })

  const token = JSON.parse(localStorage.getItem('studentsync_user'))?.token

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modal: {
      background: darkMode ? '#16213e' : '#fff',
      borderRadius: '16px',
      padding: '32px',
      width: '90%',
      maxWidth: '500px',
      color: darkMode ? '#e0e0e0' : '#1a1a2e',
      fontFamily: 'Segoe UI, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginBottom: '12px',
      background: darkMode ? '#0f3460' : '#f9f9f9',
      color: darkMode ? '#e0e0e0' : '#333',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    submitBtn: {
      width: '100%',
      padding: '12px',
      background: '#4361ee',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '15px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '22px',
      cursor: 'pointer',
      color: darkMode ? '#e0e0e0' : '#333'
    }
  }

  const handleSubmit = async () => {
    if (!form.message) return
    try {
      await axios.post(`${API_BASE}/api/grievances`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>🎧 Help Desk</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
              Response Submitted!
            </h3>
            <p style={{ color: darkMode ? '#a0a0b0' : '#666' }}>
              Your response has been Submitted. The team will contact you ASAP!
            </p>
            <button
              style={{ ...styles.submitBtn, marginTop: '24px' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <input
              style={styles.input}
              placeholder="Student ID"
              value={form.studentId}
              onChange={e => setForm({ ...form, studentId: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Department"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              style={{ ...styles.input, height: '120px', resize: 'vertical' }}
              placeholder="Submit your complaint or query..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
            />
            <button style={styles.submitBtn} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}