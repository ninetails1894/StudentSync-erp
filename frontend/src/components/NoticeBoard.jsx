import API_BASE from '../config'
import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import { speak } from '../voice'

export default function NoticeBoard({ onClose }) {
  const { user, darkMode } = useContext(AuthContext)
  const [notices, setNotices] = useState([])
  const [activeTab, setActiveTab] = useState('Fees')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const firstFocusRef = useRef(null)
  const [form, setForm] = useState({
    title: '',
    context: '',
    author: user?.department || '',
    eventDate: '',
    category: 'Fees',
    isUrgent: false
  })

  const token = JSON.parse(
    localStorage.getItem('studentsync_user')
  )?.token
  const categories = ['Fees', 'Fests and Seminars', 'Placements']

  // Move focus inside modal when it opens
  useEffect(() => {
    setTimeout(() => {
      firstFocusRef.current?.focus()
    }, 200)
  }, [])

  const fetchNotices = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/notices`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotices(res.data)
    } catch {
      console.log('Error fetching notices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchNotices()
    }
    loadData()
    // eslint-disable-next-line
  }, [])

  const filtered = notices
    .filter(n => n.category === activeTab)
    .sort((a, b) => b.isUrgent - a.isUrgent)

  // Build spoken summary of all notices in current tab
  const readAllNotices = () => {
    if (filtered.length === 0) {
      speak(`No notices in ${activeTab} category.`, 'assertive')
      return
    }
    const text = filtered.map((n, i) =>
      `Notice ${i + 1}. ${n.isUrgent ? 'URGENT. ' : ''}` +
      `Title: ${n.title}. ` +
      `${n.context}. ` +
      `Published by ${n.author} on ${n.eventDate || 'no date'}.`
    ).join(' ... ')
    speak(
      `${activeTab} notices. ${filtered.length} notices. ${text}`,
      'assertive'
    )
  }

  const handlePublish = async () => {
    if (!form.title || !form.context) return
    try {
      await axios.post(
        `${API_BASE}/api/notices`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchNotices()
      speak('Notice published successfully.', 'assertive')
      setForm({
        title: '',
        context: '',
        author: user?.department || '',
        eventDate: '',
        category: 'Fees',
        isUrgent: false
      })
      setShowForm(false)
    } catch {
      speak('Failed to publish notice.', 'assertive')
    }
  }

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
      padding: '28px',
      width: '90%',
      maxWidth: '680px',
      maxHeight: '85vh',
      overflowY: 'auto',
      color: darkMode ? '#e0e0e0' : '#1a1a2e',
      fontFamily: 'Segoe UI, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    tab: (active) => ({
      padding: '8px 14px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '13px',
      background: active ? '#4361ee' : darkMode ? '#0f3460' : '#f0f4ff',
      color: active ? '#fff' : darkMode ? '#e0e0e0' : '#4361ee'
    }),
    noticeCard: (urgent) => ({
      background: urgent
        ? darkMode ? '#3d0000' : '#fff0f0'
        : darkMode ? '#0f3460' : '#f9f9f9',
      border: urgent ? '2px solid #e63946' : '1px solid #eee',
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '12px',
      cursor: 'pointer',
      outline: 'none'
    }),
    urgentBadge: {
      background: '#e63946',
      color: '#fff',
      fontSize: '11px',
      padding: '2px 8px',
      borderRadius: '10px',
      marginLeft: '8px',
      fontWeight: '600'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginBottom: '10px',
      background: darkMode ? '#0f3460' : '#f9f9f9',
      color: darkMode ? '#e0e0e0' : '#333',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    readBtn: {
      padding: '8px 16px',
      background: '#4361ee',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '22px',
      cursor: 'pointer',
      color: darkMode ? '#e0e0e0' : '#333'
    },
    publishBtn: {
      padding: '10px 20px',
      background: '#4361ee',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px'
    }
  }

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notice Board"
    >
      <div
        style={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
            📋 Notice Board
          </h2>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onFocus={() => speak('Close notice board button')}
            aria-label="Close notice board"
            ref={firstFocusRef}
          >
            ✕
          </button>
        </div>

        {/* Read All Button */}
        <button
          style={styles.readBtn}
          onClick={readAllNotices}
          onFocus={() => speak(
            `Read all notices button. Press Enter to hear all ${activeTab} notices aloud.`
          )}
          aria-label={`Read all ${activeTab} notices aloud`}
        >
          🔊 Read All Notices
        </button>

        {/* Category Tabs */}
        <div style={styles.tabs} role="tablist">
          {categories.map(cat => (
            <button
              key={cat}
              style={styles.tab(activeTab === cat)}
              onClick={() => {
                setActiveTab(cat)
                speak(`${cat} tab selected`, 'assertive')
              }}
              onFocus={() => speak(
                `${cat} tab. Press Enter to view ${cat} notices.`
              )}
              role="tab"
              aria-selected={activeTab === cat}
              aria-label={`${cat} notices tab`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notices */}
        {loading && (
          <p style={{
            color: darkMode ? '#a0a0b0' : '#888',
            textAlign: 'center'
          }}>
            Loading notices...
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p
            style={{
              color: darkMode ? '#a0a0b0' : '#888',
              textAlign: 'center',
              padding: '20px'
            }}
            tabIndex={0}
            onFocus={() => speak(
              `No notices in ${activeTab} category yet.`
            )}
          >
            No notices in this category yet.
          </p>
        )}

        {filtered.map((notice, i) => (
          <div
            key={i}
            style={styles.noticeCard(notice.isUrgent)}
            tabIndex={0}
            onFocus={() => speak(
              `Notice ${i + 1} of ${filtered.length}. ` +
              `${notice.isUrgent ? 'URGENT notice. ' : ''}` +
              `Title: ${notice.title}. ` +
              `${notice.context}. ` +
              `Published by ${notice.author}` +
              `${notice.eventDate ? ` on ${notice.eventDate}` : ''}.`,
              'assertive'
            )}
            onClick={() => speak(
              `${notice.title}. ${notice.context}`,
              'assertive'
            )}
            aria-label={
              `${notice.isUrgent ? 'URGENT — ' : ''}` +
              `${notice.title}. ${notice.context}. ` +
              `By ${notice.author}.`
            }
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <strong style={{ fontSize: '15px' }}>
                {notice.title}
              </strong>
              {notice.isUrgent && (
                <span style={styles.urgentBadge}>URGENT</span>
              )}
            </div>
            <p style={{
              fontSize: '14px',
              color: darkMode ? '#a0a0b0' : '#555',
              marginBottom: '10px',
              lineHeight: '1.6'
            }}>
              {notice.context}
            </p>
            <div style={{
              fontSize: '12px',
              color: darkMode ? '#7070a0' : '#999'
            }}>
              By {notice.author}
              {notice.eventDate && ` • ${notice.eventDate}`}
            </div>
          </div>
        ))}

        {/* Publish Form — Admin and Teacher only */}
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div style={{ marginTop: '20px' }}>
            {!showForm ? (
              <button
                style={styles.publishBtn}
                onClick={() => setShowForm(true)}
                onFocus={() => speak(
                  'Publish notice button. Press Enter to open the publish form.'
                )}
                aria-label="Open publish notice form"
              >
                + Publish Notice
              </button>
            ) : (
              <div>
                <h3 style={{
                  marginBottom: '14px',
                  fontSize: '16px',
                  color: darkMode ? '#e0e0e0' : '#1a1a2e'
                }}>
                  New Notice
                </h3>
                <input
                  style={styles.input}
                  placeholder="Notice title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  onFocus={() => speak('Notice title field. Type the title.')}
                  aria-label="Notice title"
                />
                <textarea
                  style={{
                    ...styles.input,
                    height: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Notice content..."
                  value={form.context}
                  onChange={e => setForm({ ...form, context: e.target.value })}
                  onFocus={() => speak(
                    'Notice content field. Type the full notice here.'
                  )}
                  aria-label="Notice content"
                />
                <input
                  style={styles.input}
                  placeholder="Author / Department"
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  onFocus={() => speak('Author or department name field.')}
                  aria-label="Author or department"
                />
                <input
                  style={styles.input}
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm({
                    ...form, eventDate: e.target.value
                  })}
                  onFocus={() => speak('Event date picker.')}
                  aria-label="Event date"
                />
                <select
                  style={styles.input}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  onFocus={() => speak(
                    `Category selector. Currently ${form.category}.`
                  )}
                  aria-label="Notice category"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="checkbox"
                    id="urgent-check"
                    checked={form.isUrgent}
                    onChange={e => {
                      setForm({ ...form, isUrgent: e.target.checked })
                      speak(
                        e.target.checked
                          ? 'Urgent marked. This notice will appear at the top.'
                          : 'Urgent unmarked.',
                        'assertive'
                      )
                    }}
                    onFocus={() => speak(
                      `Urgent toggle. Currently ${form.isUrgent ? 'on' : 'off'}. ` +
                      'Press Space to toggle.'
                    )}
                    aria-label="Mark notice as urgent"
                  />
                  <label
                    htmlFor="urgent-check"
                    style={{
                      fontSize: '14px',
                      color: darkMode ? '#e0e0e0' : '#333'
                    }}
                  >
                    Mark as Urgent
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={styles.publishBtn}
                    onClick={handlePublish}
                    onFocus={() => speak(
                      'Publish button. Press Enter to publish this notice.'
                    )}
                    aria-label="Publish notice"
                  >
                    Publish
                  </button>
                  <button
                    style={{ ...styles.publishBtn, background: '#888' }}
                    onClick={() => setShowForm(false)}
                    onFocus={() => speak('Cancel button.')}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}