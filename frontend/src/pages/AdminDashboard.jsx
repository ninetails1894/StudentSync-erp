import API_BASE from '../config'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import NoticeBoard from '../components/NoticeBoard'
import HelpDesk from '../components/HelpDesk'
import SkipNav from '../components/SkipNav'
import FaceAuth from '../components/FaceAuth'
import axios from 'axios'
import { useKeyboard } from '../useKeyboard'
import { speak } from '../voice'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#4361ee', '#e63946']

export default function AdminDashboard() {
  const { user, darkMode, toggleDarkMode } = useContext(AuthContext)

  const [showNotice, setShowNotice] = useState(false)
  const [showHelpDesk, setShowHelpDesk] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [grievances, setGrievances] = useState([])
  const [searchId, setSearchId] = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [studentMarks, setStudentMarks] = useState([])
  const [studentAttendance, setStudentAttendance] = useState([])
  const [searchError, setSearchError] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadType, setUploadType] = useState('')
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [faceSearchId, setFaceSearchId] = useState('')
  const [faceTargetUser, setFaceTargetUser] = useState(null)
  const [faceSearchError, setFaceSearchError] = useState('')
  const [faceSuccessMsg, setFaceSuccessMsg] = useState('')

  const [newStudent, setNewStudent] = useState({
    name: '', username: '', password: '',
    studentId: '', registrationNumber: '',
    department: '', semester: '', section: '',
    phone: '', email: ''
  })

  const [newTeacher, setNewTeacher] = useState({
    name: '', username: '', password: '',
    department: '', phone: '', email: ''
  })

  const [marksForm, setMarksForm] = useState({
    studentId: '', semester: '1',
    subjects: [{ name: '', marks: '', totalMarks: '100' }]
  })

  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '', semester: '1',
    subjects: [{ name: '', present: '', total: '' }]
  })

  const token = JSON.parse(
    localStorage.getItem('studentsync_user')
  )?.token

  const bg = darkMode ? '#1a1a2e' : '#f0f4ff'
  const cardBg = darkMode ? '#16213e' : '#ffffff'
  const textColor = darkMode ? '#e0e0e0' : '#1a1a2e'
  const mutedColor = darkMode ? '#a0a0b0' : '#666'

  const tabs = [
    'overview', 'add-student', 'add-teacher', 'delete-student',
    'search', 'upload-marks', 'upload-attendance', 'grievances',
    'face-register'
  ]

  useKeyboard({
    onArrowRight: () => {
      const i = tabs.indexOf(activeSection)
      const next = tabs[(i + 1) % tabs.length]
      setActiveSection(next)
      speak(`${next} section`, 'assertive')
    },
    onArrowLeft: () => {
      const i = tabs.indexOf(activeSection)
      const prev = tabs[(i - 1 + tabs.length) % tabs.length]
      setActiveSection(prev)
      speak(`${prev} section`, 'assertive')
    },
    onEscape: () => {
      if (showNotice) { setShowNotice(false); speak('Notice board closed') }
      if (showHelpDesk) {
        setShowHelpDesk(false); speak('Help desk closed')
      }
      if (showFaceCapture) {
        setShowFaceCapture(false); speak('Face capture cancelled')
      }
    },
    onN: () => { setShowNotice(true); speak('Opening notice board') },
    onH: () => { setShowHelpDesk(true); speak('Opening help desk') },
    onD: () => toggleDarkMode(),
    onSlash: () => {
      document.getElementById('admin-search')?.focus()
    }
  })

  const fetchGrievances = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/grievances`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setGrievances(res.data)
    } catch {
      console.log('Error fetching grievances')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (activeSection === 'grievances') await fetchGrievances()
    }
    loadData()
    // eslint-disable-next-line
  }, [activeSection])

  const showMsg = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    speak(msg, 'assertive')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAddStudent = async () => {
    speak('Adding student. Please wait.')
    try {
      await axios.post(
        `${API_BASE}/api/auth/register`,
        { ...newStudent, role: 'student' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showMsg('Student added successfully!', 'success')
      setNewStudent({
        name: '', username: '', password: '',
        studentId: '', registrationNumber: '',
        department: '', semester: '', section: '',
        phone: '', email: ''
      })
    } catch (err) {
      showMsg(
        err.response?.data?.message || 'Failed to add student', 'error'
      )
    }
  }

  const handleAddTeacher = async () => {
    speak('Adding teacher. Please wait.')
    try {
      await axios.post(
        `${API_BASE}/api/auth/register`,
        { ...newTeacher, role: 'teacher' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showMsg('Teacher added successfully!', 'success')
      setNewTeacher({
        name: '', username: '', password: '',
        department: '', phone: '', email: ''
      })
    } catch (err) {
      showMsg(
        err.response?.data?.message || 'Failed to add teacher', 'error'
      )
    }
  }

  const handleDeleteStudent = async () => {
    if (!deleteId) return
    const confirm1 = window.confirm(
      `Are you sure you want to delete student: ${deleteId}?`
    )
    if (!confirm1) return
    speak('Deleting student. Please wait.')
    try {
      await axios.delete(
        `${API_BASE}/api/students/${deleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showMsg('Student deleted successfully!', 'success')
      setDeleteId('')
    } catch {
      showMsg('Failed to delete. Check Student ID.', 'error')
    }
  }

  const handleFaceSearch = async () => {
    setFaceSearchError('')
    setFaceTargetUser(null)
    setFaceSuccessMsg('')
    if (!faceSearchId) return
    speak('Searching user for face registration.')
    try {
      const res = await axios.get(
        `${API_BASE}/api/students/${faceSearchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFaceTargetUser(res.data)
      speak(
        `User found. Name: ${res.data.name}. Press Tab to reach Register Face button.`,
        'assertive'
      )
    } catch {
      setFaceSearchError(
        'User not found. Enter a valid Student ID or Teacher username.'
      )
      speak(
        'User not found. Please enter a valid Student ID or Teacher username.',
        'assertive'
      )
    }
  }

  const handleSearch = async () => {
    setSearchError('')
    setFoundStudent(null)
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
        `Student found. Name: ${studentRes.data.name}.`,
        'assertive'
      )
    } catch {
      setSearchError('Student not found. Check the Student ID.')
      speak('Student not found.', 'assertive')
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

  const totalAttendance = studentAttendance.flatMap(s => s.subjects)
  const overallPct = totalAttendance.length > 0
    ? (totalAttendance.reduce(
        (sum, s) => sum + (s.present / s.total) * 100, 0
      ) / totalAttendance.length).toFixed(1)
    : 0

  const attendancePieData = [
    { name: 'Present', value: parseFloat(overallPct) },
    { name: 'Absent', value: parseFloat((100 - overallPct).toFixed(1)) }
  ]

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
      speak('Failed to upload marks.', 'assertive')
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
      speak('Failed to upload attendance.', 'assertive')
    }
  }

  const riskList = getRiskStudents()

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
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginBottom: '10px',
      background: darkMode ? '#0f3460' : '#f9f9f9',
      color: darkMode ? '#e0e0e0' : '#333',
      fontSize: '14px'
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
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '13px',
      background: active ? '#4361ee' : cardBg,
      color: active ? '#fff' : textColor,
      boxShadow: '0 2px 4px rgba(0,0,0,0.07)'
    }),
    msgBox: (type) => ({
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      background: type === 'success' ? '#e0ffe0' : '#ffe0e0',
      color: type === 'success' ? '#006600' : '#cc0000',
      fontSize: '14px'
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: (color) => ({
      background: color,
      borderRadius: '12px',
      padding: '20px',
      color: '#fff'
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
    grievanceCard: {
      background: darkMode ? '#0f3460' : '#f9f9f9',
      border: `1px solid ${darkMode ? '#1a4a8a' : '#eee'}`,
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '12px'
    }
  }

  const tabLabels = {
    'overview': '📊 Overview',
    'add-student': '➕ Add Student',
    'add-teacher': '👨‍🏫 Add Teacher',
    'delete-student': '🗑️ Delete Student',
    'search': '🔍 Search Student',
    'upload-marks': '📝 Upload Marks',
    'upload-attendance': '📅 Upload Attendance',
    'grievances': '📨 Grievances',
    'face-register': '👁️ Register Faces'
  }

  const tabVoiceLabels = {
    'overview': 'Overview section. Press Enter to open.',
    'add-student': 'Add Student section. Press Enter to add a new student.',
    'add-teacher': 'Add Teacher section. Press Enter to add a new teacher.',
    'delete-student': 'Delete Student section. Press Enter to delete a student.',
    'search': 'Search Student section. Press Enter to search by student ID.',
    'upload-marks': 'Upload Marks section. Press Enter to upload marks.',
    'upload-attendance': 'Upload Attendance section. Press Enter to upload attendance.',
    'grievances': 'Grievances section. Press Enter to read student complaints.',
    'face-register': 'Register Faces section. Press Enter to register face for a user.'
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
        <div style={styles.grid}>
          {[
            { label: 'Full Access', icon: 'Admin', color: '#4361ee',
              voice: `Admin dashboard. Welcome ${user?.name}. You have full system access.` },
            { label: 'Manage Students', icon: '🎓', color: '#3a86ff',
              voice: 'Manage students option available.' },
            { label: 'Manage Teachers', icon: '👨‍🏫', color: '#7209b7',
              voice: 'Manage teachers option available.' },
            { label: 'Publish Notices', icon: '📋', color: '#e63946',
              voice: 'Publish notices via the Notice Board button in the navbar.' },
            { label: 'Read Grievances', icon: '📨', color: '#06d6a0',
              voice: 'Read grievances in the Grievances tab.' },
          ].map((card, i) => (
            <div
              key={i}
              style={styles.statCard(card.color)}
              tabIndex={0}
              onFocus={() => speak(card.voice)}
              aria-label={card.voice}
            >
              <div style={{ fontSize: '22px', fontWeight: '700' }}>
                {card.icon}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.tabs} role="tablist">
          {tabs.map(s => (
            <button
              key={s}
              style={styles.tab(activeSection === s)}
              onClick={() => setActiveSection(s)}
              onFocus={() => speak(tabVoiceLabels[s])}
              tabIndex={0}
              role="tab"
              aria-selected={activeSection === s}
              aria-label={tabVoiceLabels[s]}
            >
              {tabLabels[s]}
            </button>
          ))}
        </div>

        {message && (
          <div
            style={styles.msgBox(messageType)}
            role="alert"
            aria-live="assertive"
          >
            {message}
          </div>
        )}
        {uploadMsg && (
          <div
            style={styles.msgBox(uploadType)}
            role="alert"
            aria-live="assertive"
          >
            {uploadMsg}
          </div>
        )}

        {activeSection === 'overview' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Welcome, {user?.name}!</div>
            <p
              style={{ color: mutedColor, lineHeight: '1.7' }}
              tabIndex={0}
              onFocus={() => speak(
                `Welcome ${user?.name}. You are logged in as Administrator ` +
                'with full system access. Use Arrow keys to switch between tabs. ' +
                'Use N for notices, H for help desk.'
              )}
            >
              You are logged in as <strong>Administrator</strong> with full
              system access. Use the tabs above to manage all ERP functions.
            </p>
          </div>
        )}

        {activeSection === 'add-student' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Add New Student</div>
            {[
              { key: 'name', placeholder: "Student's Full Name",
                voice: "Student's full name field" },
              { key: 'studentId', placeholder: 'Student ID',
                voice: 'Student ID field' },
              { key: 'username', placeholder: 'Username (same as Student ID)',
                voice: 'Username field. Usually same as student ID.' },
              { key: 'password', placeholder: 'Password', type: 'password',
                voice: 'Password field for this student.' },
              { key: 'registrationNumber', placeholder: 'Registration Number',
                voice: 'Registration number field' },
              { key: 'department', placeholder: 'Department',
                voice: 'Department field' },
              { key: 'semester', placeholder: 'Semester',
                voice: 'Semester field' },
              { key: 'section', placeholder: 'Section',
                voice: 'Section field' },
              { key: 'phone', placeholder: 'Phone Number',
                voice: 'Phone number field' },
              { key: 'email', placeholder: 'Email Address',
                voice: 'Email address field' },
            ].map(field => (
              <input
                key={field.key}
                style={styles.input}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={newStudent[field.key]}
                onChange={e => setNewStudent({
                  ...newStudent, [field.key]: e.target.value
                })}
                onFocus={() => speak(field.voice)}
                aria-label={field.voice}
              />
            ))}
            <button
              style={styles.btn('#4361ee')}
              onClick={handleAddStudent}
              onFocus={() => speak(
                'Add Student button. Press Enter to save this student.'
              )}
              aria-label="Add Student button"
            >
              Add Student
            </button>
          </div>
        )}

        {activeSection === 'add-teacher' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Add New Teacher</div>
            {[
              { key: 'name', placeholder: "Teacher's Full Name",
                voice: "Teacher's full name field" },
              { key: 'username', placeholder: 'Username',
                voice: 'Username field. Teacher will use this to login.' },
              { key: 'password', placeholder: 'Password', type: 'password',
                voice: 'Password field for this teacher.' },
              { key: 'department', placeholder: 'Department',
                voice: 'Department field' },
              { key: 'phone', placeholder: 'Phone Number',
                voice: 'Phone number field' },
              { key: 'email', placeholder: 'Email Address',
                voice: 'Email address field' },
            ].map(field => (
              <input
                key={field.key}
                style={styles.input}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={newTeacher[field.key]}
                onChange={e => setNewTeacher({
                  ...newTeacher, [field.key]: e.target.value
                })}
                onFocus={() => speak(field.voice)}
                aria-label={field.voice}
              />
            ))}
            <button
              style={styles.btn('#3a86ff')}
              onClick={handleAddTeacher}
              onFocus={() => speak(
                'Add Teacher button. Press Enter to save this teacher.'
              )}
              aria-label="Add Teacher button"
            >
              Add Teacher
            </button>
          </div>
        )}

        {activeSection === 'delete-student' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Delete Student</div>
            <p style={{
              color: mutedColor, marginBottom: '16px', fontSize: '14px'
            }}>
              Enter the Student ID. A confirmation prompt will appear.
            </p>
            <input
              style={styles.input}
              placeholder="Enter Student ID"
              value={deleteId}
              onChange={e => setDeleteId(e.target.value)}
              onFocus={() => speak(
                'Student ID field. Enter the ID of the student to delete.'
              )}
              aria-label="Student ID to delete"
            />
            <button
              style={styles.btn('#e63946')}
              onClick={handleDeleteStudent}
              onFocus={() => speak(
                'Delete Student button. Press Enter to delete. ' +
                'A confirmation will appear before deleting.'
              )}
              aria-label="Delete Student button"
            >
              Delete Student
            </button>
          </div>
        )}

        {activeSection === 'search' && (
          <div>
            <div style={styles.card}>
              <div style={styles.sectionTitle}>Search Student by ID</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="admin-search"
                  style={{ ...styles.input, marginBottom: 0 }}
                  placeholder="Enter Student ID"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  onFocus={() => speak(
                    'Student search field. Type a student ID and press Enter to search.'
                  )}
                  aria-label="Enter student ID to search"
                />
                <button
                  style={styles.btn('#4361ee')}
                  onClick={handleSearch}
                  onFocus={() => speak('Search button. Press Enter to search.')}
                  aria-label="Search for student"
                >
                  Search
                </button>
              </div>
              {searchError && (
                <p style={{
                  color: '#e63946', marginTop: '10px', fontSize: '14px'
                }}
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
                          onFocus={() => speak(
                            `${label}: ${value || 'not available'}`
                          )}
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
                      ⚠️ Risk List — Below 75%
                    </div>
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
                              `${item.percentage} percent, at risk`
                            )}
                            aria-label={
                              `${item.subject} sem ${item.semester} ` +
                              `${item.percentage}% at risk`
                            }
                          >
                            <td style={styles.td}>{item.subject}</td>
                            <td style={styles.td}>Sem {item.semester}</td>
                            <td style={styles.td}>{item.percentage}%</td>
                            <td style={styles.td}>
                              <span style={{
                                background: '#ffe0e0',
                                color: '#cc0000',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                AT RISK
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              onFocus={() => speak('Student ID field for marks upload.')}
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
              aria-label="Select semester"
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
                  onFocus={() => speak(`Subject ${i + 1} name`)}
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
                  aria-label={`Subject ${i + 1} marks`}
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
              onClick={() => setMarksForm({
                ...marksForm,
                subjects: [
                  ...marksForm.subjects,
                  { name: '', marks: '', totalMarks: '100' }
                ]
              })}
              onFocus={() => speak('Add subject button. Press Enter to add a row.')}
              aria-label="Add another subject"
            >
              + Add Subject
            </button>
            <button
              style={styles.btn('#4361ee')}
              onClick={handleUploadMarks}
              onFocus={() => speak('Upload Marks button. Press Enter to save.')}
              aria-label="Upload marks"
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
              onFocus={() => speak('Student ID field for attendance upload.')}
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
                  onFocus={() => speak(`Subject ${i + 1} name`)}
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
                  aria-label={`Subject ${i + 1} present`}
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
              onClick={() => setAttendanceForm({
                ...attendanceForm,
                subjects: [
                  ...attendanceForm.subjects,
                  { name: '', present: '', total: '' }
                ]
              })}
              onFocus={() => speak('Add subject button. Press Enter to add a row.')}
              aria-label="Add another subject"
            >
              + Add Subject
            </button>
            <button
              style={styles.btn('#4361ee')}
              onClick={handleUploadAttendance}
              onFocus={() => speak('Upload Attendance button. Press Enter to save.')}
              aria-label="Upload attendance"
            >
              Upload Attendance
            </button>
          </div>
        )}

        {activeSection === 'grievances' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              📨 Student Grievances & Queries
            </div>
            {grievances.length === 0 ? (
              <p
                style={{ color: mutedColor }}
                tabIndex={0}
                onFocus={() => speak('No grievances submitted yet.')}
              >
                No grievances submitted yet.
              </p>
            ) : (
              <>
                <button
                  onClick={() => {
                    const text = grievances.map((g, i) =>
                      `Grievance ${i + 1}. From ${g.studentId}, ` +
                      `${g.department}. Message: ${g.message}.`
                    ).join(' ')
                    speak(`${grievances.length} grievances. ${text}`, 'assertive')
                  }}
                  onFocus={() => speak(
                    'Read all grievances button. Press Enter to hear all submitted queries.'
                  )}
                  aria-label="Read all grievances aloud"
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
                  🔊 Read All Grievances
                </button>
                {grievances.map((g, i) => (
                  <div
                    key={i}
                    style={styles.grievanceCard}
                    tabIndex={0}
                    onFocus={() => speak(
                      `Grievance from ${g.studentId}, ${g.department}. ` +
                      `Message: ${g.message}. ` +
                      `Phone: ${g.phone}. Email: ${g.email}.`
                    )}
                    aria-label={
                      `Grievance from ${g.studentId} — ${g.message}`
                    }
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <strong style={{ color: textColor }}>
                        {g.studentId} — {g.department}
                      </strong>
                      <span style={{ fontSize: '12px', color: mutedColor }}>
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{
                      color: textColor, fontSize: '14px', marginBottom: '8px'
                    }}>
                      {g.message}
                    </p>
                    <div style={{ fontSize: '12px', color: mutedColor }}>
                      📞 {g.phone} • ✉️ {g.email}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeSection === 'face-register' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>👁️ Register Face for a User</div>
            <p style={{
              color: mutedColor, fontSize: '14px',
              marginBottom: '16px', lineHeight: '1.7'
            }}
              tabIndex={0}
              onFocus={() => speak(
                'Face registration section. Search for a student by their ID ' +
                'or a teacher by their username. Then click Register Face ' +
                'to capture their face for biometric login.'
              )}
            >
              Search for a student by their Student ID. Once found, click
              Register Face to capture and save their face for biometric login.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                style={{ ...styles.input, marginBottom: 0 }}
                placeholder="Enter Student ID or Teacher username"
                value={faceSearchId}
                onChange={e => setFaceSearchId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFaceSearch()}
                onFocus={() => speak(
                  'Face registration search field. Enter a Student ID ' +
                  'or Teacher username and press Enter to find the user.'
                )}
                aria-label="Enter user ID to register face"
              />
              <button
                style={styles.btn('#4361ee')}
                onClick={handleFaceSearch}
                onFocus={() => speak('Search button for face registration.')}
                aria-label="Search user for face registration"
              >
                Search
              </button>
            </div>

            {faceSearchError && (
              <p style={{
                color: '#e63946', fontSize: '14px', marginBottom: '12px'
              }}
                role="alert"
              >
                {faceSearchError}
              </p>
            )}

            {faceSuccessMsg && (
              <div
                style={styles.msgBox('success')}
                role="alert"
              >
                {faceSuccessMsg}
              </div>
            )}

            {faceTargetUser && (
              <div style={{
                background: darkMode ? '#0f3460' : '#f0f4ff',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <p style={{
                      color: textColor, fontWeight: '600', fontSize: '16px'
                    }}>
                      {faceTargetUser.name}
                    </p>
                    <p style={{ color: mutedColor, fontSize: '13px' }}>
                      {faceTargetUser.role === 'student'
                        ? `Student ID: ${faceTargetUser.studentId} • ${faceTargetUser.department}`
                        : `Teacher • ${faceTargetUser.department}`
                      }
                    </p>
                  </div>
                  <button
                    style={styles.btn('#06d6a0')}
                    onClick={() => {
                      setShowFaceCapture(true)
                      speak(
                        `Opening camera to register face for ${faceTargetUser.name}. ` +
                        'Please have the user look directly at the camera.',
                        'assertive'
                      )
                    }}
                    onFocus={() => speak(
                      `Register Face button for ${faceTargetUser.name}. ` +
                      'Press Enter to open the camera.'
                    )}
                    aria-label={`Register face for ${faceTargetUser.name}`}
                  >
                    📸 Register Face
                  </button>
                </div>
              </div>
            )}

            <div style={{
              background: darkMode ? '#0f2030' : '#fff8e1',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '13px',
              color: mutedColor,
              lineHeight: '1.8'
            }}>
              <strong style={{ color: textColor }}>Instructions:</strong><br />
              1. Have the student sit in front of the camera<br />
              2. Search their Student ID above<br />
              3. Click Register Face<br />
              4. Student looks directly at the camera<br />
              5. Click Capture Face<br />
              6. They can now login using face recognition
            </div>
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
      {showFaceCapture && faceTargetUser && (
        <FaceAuth
          mode="admin-register"
          targetUser={faceTargetUser}
          onSuccess={() => {
            setShowFaceCapture(false)
            setFaceSuccessMsg(
              `Face registered successfully for ${faceTargetUser.name}!`
            )
            speak(
              `Face registered successfully for ${faceTargetUser.name}.`,
              'assertive'
            )
            setFaceTargetUser(null)
            setFaceSearchId('')
          }}
          onClose={() => {
            setShowFaceCapture(false)
            speak('Face registration cancelled.', 'assertive')
          }}
        />
      )}
    </div>
  )
}