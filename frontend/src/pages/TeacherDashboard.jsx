import API_BASE from '../config'
import { useState, useContext } from 'react'
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

export default function TeacherDashboard() {
  const { user, darkMode, toggleDarkMode } = useContext(AuthContext)

  const [showNotice, setShowNotice] = useState(false)
  const [showHelpDesk, setShowHelpDesk] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [searchId, setSearchId] = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [studentMarks, setStudentMarks] = useState([])
  const [studentAttendance, setStudentAttendance] = useState([])
  const [searchError, setSearchError] = useState('')
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadType, setUploadType] = useState('')

  const [marksForm, setMarksForm] = useState({
    studentId: '',
    semester: '1',
    subjects: [{ name: '', marks: '', totalMarks: '100' }]
  })

  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    semester: '1',
    subjects: [{ name: '', present: '', total: '' }]
  })

  const token = JSON.parse(
    localStorage.getItem('studentsync_user')
  )?.token

  const bg = darkMode ? '#1a1a2e' : '#f0f4ff'
  const cardBg = darkMode ? '#16213e' : '#ffffff'
  const textColor = darkMode ? '#e0e0e0' : '#1a1a2e'
  const mutedColor = darkMode ? '#a0a0b0' : '#666'

  const tabs = ['overview', 'search', 'upload-marks', 'upload-attendance']

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
    onD: () => toggleDarkMode(),
    onSlash: () => {
      document.getElementById('student-search')?.focus()
    }
  })

  const styles = {
    page: {
      minHeight: '100vh',
      background: bg,
      fontFamily: 'Segoe UI, sans-serif'
    },
    content: {
      padding: '24px',
      maxWidth: '1000px',
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
    btn: (color) => ({
      padding: '10px 20px',
      background: color || '#4361ee',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      marginRight: '8px',
      marginTop: '8px'
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
      color: '#fff'
    }),
    msgBox: (type) => ({
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      background: type === 'success' ? '#e0ffe0' : '#ffe0e0',
      color: type === 'success' ? '#006600' : '#cc0000',
      fontSize: '14px'
    }),
    select: {
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      background: darkMode ? '#0f3460' : '#f9f9f9',
      color: darkMode ? '#e0e0e0' : '#333',
      fontSize: '14px',
      marginBottom: '10px',
      width: '100%'
    },
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
    riskBadge: {
      background: '#ffe0e0',
      color: '#cc0000',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    },
    safeBadge: {
      background: '#e0ffe0',
      color: '#006600',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    }
  }

  const handleSearch = async () => {
    setSearchError('')
    setFoundStudent(null)
    setStudentMarks([])
    setStudentAttendance([])
    if (!searchId) return
    speak('Searching for student. Please wait.')
    try {
      const [studentRes, marksRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE}/api/students/${searchId}`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/students/${searchId}/marks`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(
          `${API_BASE}/api/students/${searchId}/attendance`,
          { headers: { Authorization: `Bearer ${token}` } })
      ])
      setFoundStudent(studentRes.data)
      setStudentMarks(marksRes.data)
      setStudentAttendance(attendanceRes.data)
      speak(
        `Student found. Name: ${studentRes.data.name}. ` +
        `Department: ${studentRes.data.department}.`,
        'assertive'
      )
    } catch {
      setSearchError('Student not found. Check the Student ID.')
      speak('Student not found. Please check the Student ID.', 'assertive')
    }
  }

  const calculateSGPA = (subjects) => {
    if (!subjects || subjects.length === 0) return 0
    const total = subjects.reduce(
      (sum, s) => sum + (s.marks / s.totalMarks) * 10, 0
    )
    return (total / subjects.length).toFixed(2)
  }

  const calculateCGPA = (allMarks) => {
    if (!allMarks || allMarks.length === 0) return 0
    const sgpas = allMarks.map(m => parseFloat(calculateSGPA(m.subjects)))
    return (sgpas.reduce((a, b) => a + b, 0) / sgpas.length).toFixed(2)
  }

  const getRiskStudents = () => {
    const riskSubjects = []
    studentAttendance.forEach(sem => {
      sem.subjects.forEach(subject => {
        const pct = (subject.present / subject.total) * 100
        if (pct < 75) {
          riskSubjects.push({
            subject: subject.name,
            semester: sem.semester,
            percentage: pct.toFixed(1)
          })
        }
      })
    })
    return riskSubjects
  }

  const addMarksSubject = () => {
    setMarksForm({
      ...marksForm,
      subjects: [
        ...marksForm.subjects,
        { name: '', marks: '', totalMarks: '100' }
      ]
    })
  }

  const addAttendanceSubject = () => {
    setAttendanceForm({
      ...attendanceForm,
      subjects: [
        ...attendanceForm.subjects,
        { name: '', present: '', total: '' }
      ]
    })
  }

  const handleUploadMarks = async () => {
    speak('Uploading marks. Please wait.')
    try {
      await axios.post(
        `${API_BASE}/api/students/marks/upload`,
        {
          studentId: marksForm.studentId,
          semester: marksForm.semester,
          subjects: marksForm.subjects.map(s => ({
            name: s.name,
            marks: Number(s.marks),
            totalMarks: Number(s.totalMarks)
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUploadMsg('Marks uploaded successfully!')
      setUploadType('success')
      speak('Marks uploaded successfully!', 'assertive')
      setTimeout(() => setUploadMsg(''), 3000)
    } catch {
      setUploadMsg('Failed to upload marks')
      setUploadType('error')
      speak('Failed to upload marks. Please try again.', 'assertive')
    }
  }

  const handleUploadAttendance = async () => {
    speak('Uploading attendance. Please wait.')
    try {
      await axios.post(
        `${API_BASE}/api/students/attendance/upload`,
        {
          studentId: attendanceForm.studentId,
          semester: attendanceForm.semester,
          subjects: attendanceForm.subjects.map(s => ({
            name: s.name,
            present: Number(s.present),
            total: Number(s.total)
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUploadMsg('Attendance uploaded successfully!')
      setUploadType('success')
      speak('Attendance uploaded successfully!', 'assertive')
      setTimeout(() => setUploadMsg(''), 3000)
    } catch {
      setUploadMsg('Failed to upload attendance')
      setUploadType('error')
      speak('Failed to upload attendance. Please try again.', 'assertive')
    }
  }

  const riskList = getRiskStudents()
  const totalAttendance = studentAttendance.length > 0
    ? studentAttendance.flatMap(s => s.subjects)
    : []
  const overallPct = totalAttendance.length > 0
    ? (totalAttendance.reduce(
        (sum, s) => sum + (s.present / s.total) * 100, 0
      ) / totalAttendance.length).toFixed(1)
    : 0

  const attendancePieData = [
    { name: 'Present', value: parseFloat(overallPct) },
    { name: 'Absent', value: parseFloat((100 - overallPct).toFixed(1)) }
  ]

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
        <div style={styles.grid}>
          <div
            style={styles.statCard('#3a86ff')}
            tabIndex={0}
            onFocus={() => speak(
              `Teacher dashboard. Welcome ${user?.name}. Department: ${user?.department}.`
            )}
            aria-label={`Teacher — ${user?.department}`}
          >
            <div style={{ fontSize: '24px', fontWeight: '700' }}>Teacher</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>
              {user?.department}
            </div>
          </div>
          <div
            style={styles.statCard('#4361ee')}
            tabIndex={0}
            onFocus={() => speak('Upload marks tab available')}
            aria-label="Upload Marks"
          >
            <div style={{ fontSize: '24px', fontWeight: '700' }}>📝</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>Upload Marks</div>
          </div>
          <div
            style={styles.statCard('#06d6a0')}
            tabIndex={0}
            onFocus={() => speak('Upload attendance tab available')}
            aria-label="Upload Attendance"
          >
            <div style={{ fontSize: '24px', fontWeight: '700' }}>📅</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>
              Upload Attendance
            </div>
          </div>
          <div
            style={styles.statCard('#e63946')}
            tabIndex={0}
            onFocus={() => speak('Risk list available in search section')}
            aria-label="Risk List"
          >
            <div style={{ fontSize: '24px', fontWeight: '700' }}>⚠️</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>Risk List</div>
          </div>
        </div>

        <div style={styles.tabs} role="tablist">
          {tabs.map(s => (
            <button
              key={s}
              style={styles.tab(activeSection === s)}
              onClick={() => {
                setActiveSection(s)
                speak(`${s} tab opened`, 'assertive')
              }}
              onFocus={() => speak(
                s === 'overview'
                  ? 'Overview tab. Press Enter to open.'
                  : s === 'search'
                  ? 'Search Student tab. Press Enter to search a student by ID.'
                  : s === 'upload-marks'
                  ? 'Upload Marks tab. Press Enter to upload marks for a student.'
                  : 'Upload Attendance tab. Press Enter to upload attendance.'
              )}
              tabIndex={0}
              role="tab"
              aria-selected={activeSection === s}
              aria-label={
                s === 'overview' ? 'Overview tab' :
                s === 'search' ? 'Search Student tab' :
                s === 'upload-marks' ? 'Upload Marks tab' :
                'Upload Attendance tab'
              }
            >
              {s === 'overview' && '📊 Overview'}
              {s === 'search' && '🔍 Search Student'}
              {s === 'upload-marks' && '📝 Upload Marks'}
              {s === 'upload-attendance' && '📅 Upload Attendance'}
            </button>
          ))}
        </div>

        {uploadMsg && (
          <div style={styles.msgBox(uploadType)}>{uploadMsg}</div>
        )}

        {activeSection === 'overview' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Welcome, {user?.name}!</div>
            <p
              style={{ color: mutedColor, lineHeight: '1.7' }}
              tabIndex={0}
              onFocus={() => speak(
                `Welcome ${user?.name}. You are logged in as Teacher ` +
                `from ${user?.department} department. ` +
                'Use the tabs to search students, upload marks and attendance. ' +
                'Press Arrow Right to move to next tab.'
              )}
            >
              You are logged in as <strong>Teacher</strong> from{' '}
              <strong>{user?.department}</strong> department.
              Use the tabs above to search students, upload marks and attendance.
            </p>
          </div>
        )}

        {activeSection === 'search' && (
          <div>
            <div style={styles.card}>
              <div style={styles.sectionTitle}>Search Student by ID</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="student-search"
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Enter Student ID (e.g. STU2024001)"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  onFocus={() => speak(
                    'Student search field. Type a Student ID and press Enter to search. ' +
                    'Press slash key to jump here from anywhere in the dashboard.'
                  )}
                  aria-label="Enter student ID to search"
                />
                <button
                  style={styles.btn('#4361ee')}
                  onClick={handleSearch}
                  onFocus={() => speak(
                    'Search button. Press Enter to search for the student.'
                  )}
                  aria-label="Search for student"
                >
                  Search
                </button>
              </div>
              {searchError && (
                <p
                  style={{ color: '#e63946', marginTop: '10px', fontSize: '14px' }}
                  role="alert"
                >
                  {searchError}
                </p>
              )}
            </div>

            {foundStudent && (
              <>
                <div style={styles.card}>
                  <div style={styles.sectionTitle}>Student Details</div>
                  {/* Read all button */}
                  <button
                    onClick={() => {
                      const cgpa = calculateCGPA(studentMarks)
                      speak(
                        `Student details. Name: ${foundStudent.name}. ` +
                        `Student ID: ${foundStudent.studentId}. ` +
                        `Department: ${foundStudent.department}. ` +
                        `Semester: ${foundStudent.semester}. ` +
                        `Section: ${foundStudent.section}. ` +
                        `CGPA: ${cgpa}. ` +
                        `Overall attendance: ${overallPct} percent.`,
                        'assertive'
                      )
                    }}
                    onFocus={() => speak(
                      'Read student details button. Press Enter to hear all details.'
                    )}
                    aria-label="Read student details aloud"
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
                    🔊 Read Student Details
                  </button>
                  <table style={styles.table}>
                    <tbody>
                      {[
                        ['Name', foundStudent.name],
                        ['Student ID', foundStudent.studentId],
                        ['Department', foundStudent.department],
                        ['Semester', foundStudent.semester],
                        ['Section', foundStudent.section],
                        ['CGPA', calculateCGPA(studentMarks)],
                        ['Overall Attendance', `${overallPct}%`]
                      ].map(([label, value]) => (
                        <tr
                          key={label}
                          tabIndex={0}
                          onFocus={() => speak(`${label}: ${value || 'not available'}`)}
                          aria-label={`${label}: ${value || 'not available'}`}
                        >
                          <td style={{
                            ...styles.td, color: mutedColor, width: '200px'
                          }}>
                            {label}
                          </td>
                          <td style={{ ...styles.td, fontWeight: '500' }}>
                            {value || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalAttendance.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <p style={{
                        color: mutedColor, fontSize: '14px', marginBottom: '8px'
                      }}>
                        Overall Attendance
                      </p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={attendancePieData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={80}
                            dataKey="value"
                          >
                            {attendancePieData.map((entry, index) => (
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
                  )}
                </div>

                {riskList.length > 0 && (
                  <div style={styles.card}>
                    <div style={styles.sectionTitle}>
                      ⚠️ Risk List — Attendance Below 75%
                    </div>
                    <button
                      onClick={() => {
                        const riskText = riskList.map(r =>
                          `${r.subject}, semester ${r.semester}, ${r.percentage} percent`
                        ).join('. ')
                        speak(
                          `Risk list. ${riskList.length} subjects below 75 percent. ${riskText}`,
                          'assertive'
                        )
                      }}
                      onFocus={() => speak(
                        'Read risk list button. Press Enter to hear all at-risk subjects.'
                      )}
                      aria-label="Read risk list aloud"
                      style={{
                        padding: '8px 16px',
                        background: '#e63946',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        marginBottom: '16px',
                        fontWeight: '500'
                      }}
                    >
                      🔊 Read Risk List
                    </button>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Subject</th>
                          <th style={styles.th}>Semester</th>
                          <th style={styles.th}>Attendance %</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskList.map((item, i) => (
                          <tr
                            key={i}
                            tabIndex={0}
                            onFocus={() => speak(
                              `${item.subject}, semester ${item.semester}, ` +
                              `${item.percentage} percent — AT RISK`
                            )}
                            aria-label={
                              `${item.subject} semester ${item.semester} ` +
                              `${item.percentage}% at risk`
                            }
                          >
                            <td style={styles.td}>{item.subject}</td>
                            <td style={styles.td}>Sem {item.semester}</td>
                            <td style={styles.td}>{item.percentage}%</td>
                            <td style={styles.td}>
                              <span style={styles.riskBadge}>AT RISK</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {riskList.length === 0 && totalAttendance.length > 0 && (
                  <div
                    style={styles.card}
                    tabIndex={0}
                    onFocus={() => speak(
                      'All subjects are above 75 percent attendance. No risk.'
                    )}
                  >
                    <span style={styles.safeBadge}>
                      ✓ All subjects above 75% — No risk
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeSection === 'upload-marks' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Upload Marks</div>
            <input
              style={styles.input}
              placeholder="Student ID"
              value={marksForm.studentId}
              onChange={e => setMarksForm({
                ...marksForm, studentId: e.target.value
              })}
              onFocus={() => speak(
                'Student ID field for marks upload. Type the student ID.'
              )}
              aria-label="Student ID for marks upload"
            />
            <select
              style={styles.select}
              value={marksForm.semester}
              onChange={e => setMarksForm({
                ...marksForm, semester: e.target.value
              })}
              onFocus={() => speak(
                `Semester selector. Currently semester ${marksForm.semester}.`
              )}
              aria-label="Select semester for marks"
            >
              {['1','2','3','4','5','6','7','8'].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>

            {marksForm.subjects.map((subject, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Subject Name"
                  value={subject.name}
                  onChange={e => {
                    const updated = [...marksForm.subjects]
                    updated[i].name = e.target.value
                    setMarksForm({ ...marksForm, subjects: updated })
                  }}
                  onFocus={() => speak(`Subject ${i + 1} name field`)}
                  aria-label={`Subject ${i + 1} name`}
                />
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Marks"
                  type="number"
                  value={subject.marks}
                  onChange={e => {
                    const updated = [...marksForm.subjects]
                    updated[i].marks = e.target.value
                    setMarksForm({ ...marksForm, subjects: updated })
                  }}
                  onFocus={() => speak(`Subject ${i + 1} marks obtained`)}
                  aria-label={`Subject ${i + 1} marks obtained`}
                />
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Total"
                  type="number"
                  value={subject.totalMarks}
                  onChange={e => {
                    const updated = [...marksForm.subjects]
                    updated[i].totalMarks = e.target.value
                    setMarksForm({ ...marksForm, subjects: updated })
                  }}
                  onFocus={() => speak(`Subject ${i + 1} total marks`)}
                  aria-label={`Subject ${i + 1} total marks`}
                />
              </div>
            ))}

            <button
              style={styles.btn('#06d6a0')}
              onClick={addMarksSubject}
              onFocus={() => speak(
                'Add subject button. Press Enter to add another subject row.'
              )}
              aria-label="Add another subject"
            >
              + Add Subject
            </button>
            <button
              style={styles.btn('#4361ee')}
              onClick={handleUploadMarks}
              onFocus={() => speak(
                'Upload marks button. Press Enter to save all marks.'
              )}
              aria-label="Upload marks button"
            >
              Upload Marks
            </button>
          </div>
        )}

        {activeSection === 'upload-attendance' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Upload Attendance</div>
            <input
              style={styles.input}
              placeholder="Student ID"
              value={attendanceForm.studentId}
              onChange={e => setAttendanceForm({
                ...attendanceForm, studentId: e.target.value
              })}
              onFocus={() => speak(
                'Student ID field for attendance upload. Type the student ID.'
              )}
              aria-label="Student ID for attendance upload"
            />
            <select
              style={styles.select}
              value={attendanceForm.semester}
              onChange={e => setAttendanceForm({
                ...attendanceForm, semester: e.target.value
              })}
              onFocus={() => speak(
                `Semester selector. Currently semester ${attendanceForm.semester}.`
              )}
              aria-label="Select semester for attendance"
            >
              {['1','2','3','4','5','6','7','8'].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>

            {attendanceForm.subjects.map((subject, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Subject Name"
                  value={subject.name}
                  onChange={e => {
                    const updated = [...attendanceForm.subjects]
                    updated[i].name = e.target.value
                    setAttendanceForm({ ...attendanceForm, subjects: updated })
                  }}
                  onFocus={() => speak(`Subject ${i + 1} name field`)}
                  aria-label={`Subject ${i + 1} name`}
                />
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Present"
                  type="number"
                  value={subject.present}
                  onChange={e => {
                    const updated = [...attendanceForm.subjects]
                    updated[i].present = e.target.value
                    setAttendanceForm({ ...attendanceForm, subjects: updated })
                  }}
                  onFocus={() => speak(`Subject ${i + 1} classes present`)}
                  aria-label={`Subject ${i + 1} present classes`}
                />
                <input
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Total Classes"
                  type="number"
                  value={subject.total}
                  onChange={e => {
                    const updated = [...attendanceForm.subjects]
                    updated[i].total = e.target.value
                    setAttendanceForm({ ...attendanceForm, subjects: updated })
                  }}
                  onFocus={() => speak(`Subject ${i + 1} total classes`)}
                  aria-label={`Subject ${i + 1} total classes`}
                />
              </div>
            ))}

            <button
              style={styles.btn('#06d6a0')}
              onClick={addAttendanceSubject}
              onFocus={() => speak(
                'Add subject button. Press Enter to add another subject row.'
              )}
              aria-label="Add another subject"
            >
              + Add Subject
            </button>
            <button
              style={styles.btn('#4361ee')}
              onClick={handleUploadAttendance}
              onFocus={() => speak(
                'Upload attendance button. Press Enter to save attendance.'
              )}
              aria-label="Upload attendance button"
            >
              Upload Attendance
            </button>
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