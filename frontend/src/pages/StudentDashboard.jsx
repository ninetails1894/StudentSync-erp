import API_BASE from '../config'
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import NoticeBoard from '../components/NoticeBoard'
import HelpDesk from '../components/HelpDesk'
import SkipNav from '../components/SkipNav'
import axios from 'axios'
import { useKeyboard } from '../useKeyboard'
import { speak } from '../voice'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#4361ee', '#e63946']

export default function StudentDashboard() {
  const { user, darkMode, toggleDarkMode } = useContext(AuthContext)

  const [marks, setMarks] = useState([])
  const [attendance, setAttendance] = useState([])
  const [showNotice, setShowNotice] = useState(false)
  const [showHelpDesk, setShowHelpDesk] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedSemester, setSelectedSemester] = useState(
    user?.semester || '4'
  )

  const bg = darkMode ? '#1a1a2e' : '#f0f4ff'
  const cardBg = darkMode ? '#16213e' : '#ffffff'
  const textColor = darkMode ? '#e0e0e0' : '#1a1a2e'
  const mutedColor = darkMode ? '#a0a0b0' : '#666'
  const token = JSON.parse(
    localStorage.getItem('studentsync_user')
  )?.token

  const tabs = ['overview', 'marks', 'attendance']

  useKeyboard({
    onArrowRight: () => {
      const i = tabs.indexOf(activeSection)
      const next = tabs[(i + 1) % tabs.length]
      setActiveSection(next)
      speak(`${next} tab`, 'assertive')
    },
    onArrowLeft: () => {
      const i = tabs.indexOf(activeSection)
      const prev = tabs[(i - 1 + tabs.length) % tabs.length]
      setActiveSection(prev)
      speak(`${prev} tab`, 'assertive')
    },
    onEscape: () => {
      if (showNotice) { setShowNotice(false); speak('Notice board closed') }
      if (showHelpDesk) { setShowHelpDesk(false); speak('Help desk closed') }
    },
    onN: () => { setShowNotice(true); speak('Opening notice board') },
    onH: () => { setShowHelpDesk(true); speak('Opening help desk') },
    onD: () => toggleDarkMode()
  })

  const fetchMarks = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/students/${user.studentId}/marks`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMarks(res.data)
    } catch {
      console.log('Error fetching marks')
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/students/${user.studentId}/attendance`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAttendance(res.data)
    } catch {
      console.log('Error fetching attendance')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchMarks()
      await fetchAttendance()
    }
    loadData()
    // eslint-disable-next-line
  }, [selectedSemester])

  // Announce dashboard loaded
  useEffect(() => {
    speak(
      `Student dashboard loaded. Welcome ${user?.name}. ` +
      'Use Arrow keys to switch between tabs. ' +
      'My Profile, My Marks, and My Attendance are available.'
    )
  }, [])

  const currentMarks = marks.find(m => m.semester === selectedSemester)
  const currentAttendance = attendance.find(
    a => a.semester === selectedSemester
  )

  const calculateSGPA = (subjects) => {
    if (!subjects || subjects.length === 0) return 0
    const total = subjects.reduce(
      (sum, s) => sum + (s.marks / s.totalMarks) * 10, 0
    )
    return (total / subjects.length).toFixed(2)
  }

  const calculateCGPA = () => {
    if (marks.length === 0) return 0
    const allSGPAs = marks.map(m => parseFloat(calculateSGPA(m.subjects)))
    return (
      allSGPAs.reduce((a, b) => a + b, 0) / allSGPAs.length
    ).toFixed(2)
  }

  const styles = {
    page: {
      minHeight: '100vh',
      background: bg,
      fontFamily: 'Segoe UI, sans-serif'
    },
    content: {
      padding: '24px',
      maxWidth: '1100px',
      margin: '0 auto'
    },
    card: {
      background: cardBg,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: textColor,
      marginBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: (color) => ({
      background: color,
      borderRadius: '12px',
      padding: '20px',
      color: '#fff',
      cursor: 'default'
    }),
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    tab: (active) => ({
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      background: active ? '#4361ee' : cardBg,
      color: active ? '#fff' : textColor,
      boxShadow: '0 2px 4px rgba(0,0,0,0.07)'
    }),
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '12px',
      textAlign: 'left',
      borderBottom: `2px solid ${darkMode ? '#0f3460' : '#eee'}`,
      color: mutedColor,
      fontSize: '13px',
      fontWeight: '600'
    },
    td: {
      padding: '12px',
      borderBottom: `1px solid ${darkMode ? '#0f3460' : '#f0f0f0'}`,
      color: textColor,
      fontSize: '14px'
    },
    select: {
      padding: '8px 14px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      background: darkMode ? '#0f3460' : '#f9f9f9',
      color: darkMode ? '#e0e0e0' : '#333',
      fontSize: '14px',
      marginBottom: '16px'
    },
    badge: (pct) => ({
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      background: pct >= 75 ? '#e0ffe0' : '#ffe0e0',
      color: pct >= 75 ? '#006600' : '#cc0000'
    })
  }

  // Build spoken summary for profile
  const getProfileSummary = () => {
    return [
      `Name: ${user?.name}.`,
      `Student ID: ${user?.studentId}.`,
      `Department: ${user?.department}.`,
      `Semester: ${user?.semester}.`,
      `Section: ${user?.section}.`,
      `Phone: ${user?.phone || 'not provided'}.`,
      `Email: ${user?.email || 'not provided'}.`
    ].join(' ')
  }

  // Build spoken summary for marks
  const getMarksSummary = () => {
    if (!currentMarks) return `No marks uploaded for semester ${selectedSemester} yet.`
    const subjectList = currentMarks.subjects.map(s =>
      `${s.name}: ${s.marks} out of ${s.totalMarks}`
    ).join('. ')
    return [
      `Marks for semester ${selectedSemester}.`,
      `SGPA: ${calculateSGPA(currentMarks.subjects)}.`,
      `CGPA: ${calculateCGPA()}.`,
      `Subjects: ${subjectList}.`
    ].join(' ')
  }

  // Build spoken summary for attendance
  const getAttendanceSummary = () => {
    if (!currentAttendance) {
      return `No attendance uploaded for semester ${selectedSemester} yet.`
    }
    const subjectList = currentAttendance.subjects.map(s => {
      const pct = Math.round((s.present / s.total) * 100)
      const status = pct >= 75 ? 'safe' : 'at risk'
      return `${s.name}: ${s.present} out of ${s.total} classes, ${pct} percent, ${status}`
    }).join('. ')
    return [
      `Attendance for semester ${selectedSemester}.`,
      subjectList
    ].join(' ')
  }

  return (
    <div style={styles.page}>
      <SkipNav />
      <Navbar
        onNoticeClick={() => {
          setShowNotice(true)
          speak('Opening notice board')
        }}
        onHelpdeskClick={() => {
          setShowHelpDesk(true)
          speak('Opening help desk')
        }}
      />

      <div id="main-content" style={styles.content}>

        {/* Welcome Banner */}
        <div
          style={{
            ...styles.card,
            background: 'linear-gradient(135deg, #4361ee, #3a86ff)',
            color: '#fff'
          }}
          tabIndex={0}
          onFocus={() => speak(
            `Welcome ${user?.name}. ` +
            `${user?.department}, Semester ${user?.semester}, Section ${user?.section}. ` +
            `Student ID ${user?.studentId}.`
          )}
          aria-label={
            `Welcome ${user?.name}. Department ${user?.department}. ` +
            `Semester ${user?.semester}. Section ${user?.section}.`
          }
        >
          <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>
            Welcome, {user?.name}! 👋
          </h2>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>
            {user?.department} • Semester {user?.semester} • Section {user?.section}
          </p>
          <p style={{ opacity: 0.75, fontSize: '13px', marginTop: '4px' }}>
            Student ID: {user?.studentId} • Reg: {user?.registrationNumber}
          </p>
        </div>

        {/* Stats */}
        <div style={styles.grid}>
          <div
            style={styles.statCard('#4361ee')}
            tabIndex={0}
            onFocus={() => speak(`CGPA: ${calculateCGPA()}`)}
            aria-label={`CGPA: ${calculateCGPA()}`}
          >
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {calculateCGPA()}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>CGPA</div>
          </div>
          <div
            style={styles.statCard('#3a86ff')}
            tabIndex={0}
            onFocus={() => speak(
              `SGPA for semester ${selectedSemester}: ${calculateSGPA(currentMarks?.subjects)}`
            )}
            aria-label={`SGPA semester ${selectedSemester}: ${calculateSGPA(currentMarks?.subjects)}`}
          >
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {calculateSGPA(currentMarks?.subjects)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>
              SGPA (Sem {selectedSemester})
            </div>
          </div>
          <div
            style={styles.statCard('#06d6a0')}
            tabIndex={0}
            onFocus={() => speak(`Current semester: ${user?.semester}`)}
            aria-label={`Current semester: ${user?.semester}`}
          >
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {user?.semester}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>Current Semester</div>
          </div>
          <div
            style={styles.statCard('#e63946')}
            tabIndex={0}
            onFocus={() => speak(`Section: ${user?.section}`)}
            aria-label={`Section: ${user?.section}`}
          >
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {user?.section}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>Section</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs} role="tablist">
          {tabs.map(section => (
            <button
              key={section}
              style={styles.tab(activeSection === section)}
              onClick={() => {
                setActiveSection(section)
                speak(`${section} tab opened`, 'assertive')
              }}
              onFocus={() => speak(
                section === 'overview'
                  ? 'My Profile tab. Press Enter to view your personal details.'
                  : section === 'marks'
                  ? 'My Marks tab. Press Enter to view your marks and CGPA.'
                  : 'My Attendance tab. Press Enter to view your attendance.'
              )}
              tabIndex={0}
              role="tab"
              aria-selected={activeSection === section}
              aria-label={
                section === 'overview' ? 'My Profile tab' :
                section === 'marks' ? 'My Marks tab' :
                'My Attendance tab'
              }
            >
              {section === 'overview' && '👤 My Profile'}
              {section === 'marks' && '📝 My Marks'}
              {section === 'attendance' && '📅 My Attendance'}
            </button>
          ))}
        </div>

        {/* Semester Selector */}
        {(activeSection === 'marks' || activeSection === 'attendance') && (
          <select
            style={styles.select}
            value={selectedSemester}
            onChange={e => {
              setSelectedSemester(e.target.value)
              speak(`Semester ${e.target.value} selected`, 'assertive')
            }}
            onFocus={() => speak(
              `Semester selector. Currently semester ${selectedSemester}.` +
              ' Use Arrow keys to change.'
            )}
            aria-label={`Select semester — currently semester ${selectedSemester}`}
          >
            {['1','2','3','4','5','6','7','8'].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        )}

        {/* Profile Section */}
        {activeSection === 'overview' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>My Details</div>
            {/* Read all button */}
            <button
              onClick={() => speak(getProfileSummary(), 'assertive')}
              onFocus={() => speak(
                'Read my details button. Press Enter to hear all your personal information.'
              )}
              aria-label="Read all my details aloud"
              style={{
                padding: '8px 16px',
                background: '#4361ee',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500'
              }}
            >
              🔊 Read My Details
            </button>
            <table style={styles.table}>
              <tbody>
                {[
                  ['Full Name', user?.name],
                  ['Student ID', user?.studentId],
                  ['Registration No.', user?.registrationNumber],
                  ['Department', user?.department],
                  ['Semester', user?.semester],
                  ['Section', user?.section],
                  ['Phone', user?.phone],
                  ['Email', user?.email],
                ].map(([label, value]) => (
                  <tr
                    key={label}
                    tabIndex={0}
                    onFocus={() => speak(`${label}: ${value || 'not provided'}`)}
                    aria-label={`${label}: ${value || 'not provided'}`}
                  >
                    <td style={{ ...styles.td, color: mutedColor, width: '200px' }}>
                      {label}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>
                      {value || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Marks Section */}
        {activeSection === 'marks' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              Marks — Semester {selectedSemester}
            </div>
            {/* Read marks button */}
            <button
              onClick={() => speak(getMarksSummary(), 'assertive')}
              onFocus={() => speak(
                'Read marks button. Press Enter to hear all your marks for this semester.'
              )}
              aria-label="Read all marks aloud"
              style={{
                padding: '8px 16px',
                background: '#4361ee',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500'
              }}
            >
              🔊 Read My Marks
            </button>
            {!currentMarks ? (
              <p
                style={{ color: mutedColor }}
                tabIndex={0}
                onFocus={() => speak(
                  `No marks uploaded for semester ${selectedSemester} yet.`
                )}
              >
                No marks uploaded for semester {selectedSemester} yet.
              </p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Marks Obtained</th>
                    <th style={styles.th}>Total Marks</th>
                    <th style={styles.th}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMarks.subjects.map((s, i) => {
                    const pct = ((s.marks / s.totalMarks) * 100).toFixed(1)
                    return (
                      <tr
                        key={i}
                        tabIndex={0}
                        onFocus={() => speak(
                          `${s.name}. Marks: ${s.marks} out of ${s.totalMarks}. Percentage: ${pct} percent.`
                        )}
                        aria-label={`${s.name} — ${s.marks} out of ${s.totalMarks} — ${pct} percent`}
                      >
                        <td style={styles.td}>{s.name}</td>
                        <td style={styles.td}>{s.marks}</td>
                        <td style={styles.td}>{s.totalMarks}</td>
                        <td style={styles.td}>{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Attendance Section */}
        {activeSection === 'attendance' && (
          <div>
            {/* Read attendance button */}
            <button
              onClick={() => speak(getAttendanceSummary(), 'assertive')}
              onFocus={() => speak(
                'Read attendance button. Press Enter to hear your attendance for all subjects.'
              )}
              aria-label="Read all attendance aloud"
              style={{
                padding: '8px 16px',
                background: '#4361ee',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500'
              }}
            >
              🔊 Read My Attendance
            </button>

            {!currentAttendance ? (
              <div style={styles.card}>
                <p
                  style={{ color: mutedColor }}
                  tabIndex={0}
                  onFocus={() => speak(
                    `No attendance uploaded for semester ${selectedSemester} yet.`
                  )}
                >
                  No attendance uploaded for semester {selectedSemester} yet.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {currentAttendance.subjects.map((subject, i) => {
                  const pct = Math.round(
                    (subject.present / subject.total) * 100
                  )
                  const status = pct >= 75 ? 'safe' : 'at risk — below 75 percent'
                  const pieData = [
                    { name: 'Present', value: subject.present },
                    { name: 'Absent', value: subject.total - subject.present }
                  ]
                  return (
                    <div
                      key={i}
                      style={styles.card}
                      tabIndex={0}
                      onFocus={() => speak(
                        `${subject.name}. ` +
                        `${subject.present} out of ${subject.total} classes attended. ` +
                        `${pct} percent. Status: ${status}.`
                      )}
                      aria-label={
                        `${subject.name} — ${subject.present} of ${subject.total} — ${pct}% — ${status}`
                      }
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <strong style={{ color: textColor, fontSize: '15px' }}>
                          {subject.name}
                        </strong>
                        <span style={styles.badge(pct)}>{pct}%</span>
                      </div>
                      <p style={{
                        color: mutedColor,
                        fontSize: '13px',
                        marginBottom: '12px'
                      }}>
                        {subject.present} / {subject.total} classes attended
                      </p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={80}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showNotice && (
        <NoticeBoard onClose={() => {
          setShowNotice(false)
          speak('Notice board closed', 'assertive')
        }} />
      )}
      {showHelpDesk && (
        <HelpDesk onClose={() => {
          setShowHelpDesk(false)
          speak('Help desk closed', 'assertive')
        }} />
      )}
    </div>
  )
}