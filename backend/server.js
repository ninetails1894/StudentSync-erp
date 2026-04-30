const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const studentRoutes = require('./routes/students')
const noticeRoutes = require('./routes/notices')
const grievanceRoutes = require('./routes/grievances')

const app = express()

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true)
  },
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/notices', noticeRoutes)
app.use('/api/grievances', grievanceRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'StudentSync ERP Server is running!' })
})

// ONE-TIME SEED ROUTE
app.get('/seed', async (req, res) => {
  try {
    const User = require('./models/User')
    await User.deleteMany({})
    await User.create({
      name: 'Admin User',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      department: 'Administration'
    })
    await User.create({
      name: 'Prof. Sharma',
      username: 'teacher01',
      password: 'teacher123',
      role: 'teacher',
      department: 'Computer Science'
    })
    await User.create({
      name: 'Ritesh Saha',
      username: 'STU2024001',
      password: 'ritesh123',
      role: 'student',
      studentId: 'STU2024001',
      registrationNumber: 'REG2024001',
      department: 'Computer Science',
      semester: '4',
      section: 'A',
      phone: '9876543210',
      email: 'ritesh@example.com'
    })
    res.json({
      success: true,
      message: 'All users created!',
      users: [
        { role: 'admin', username: 'admin', password: 'admin123' },
        { role: 'teacher', username: 'teacher01', password: 'teacher123' },
        { role: 'student', username: 'STU2024001', password: 'ritesh123' }
      ]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ONE-TIME DATA SEED
app.get('/seed-data', async (req, res) => {
  try {
    const Marks = require('./models/Marks')
    const Attendance = require('./models/Attendance')
    await Marks.deleteMany({ studentId: 'STU2024001' })
    await Attendance.deleteMany({ studentId: 'STU2024001' })
    await Marks.create({
      studentId: 'STU2024001',
      semester: '4',
      subjects: [
        { name: 'Data Structures', marks: 78, totalMarks: 100 },
        { name: 'DBMS', marks: 85, totalMarks: 100 },
        { name: 'Computer Networks', marks: 72, totalMarks: 100 },
        { name: 'Operating Systems', marks: 90, totalMarks: 100 },
        { name: 'Web Technology', marks: 88, totalMarks: 100 }
      ]
    })
    await Attendance.create({
      studentId: 'STU2024001',
      semester: '4',
      subjects: [
        { name: 'Data Structures', present: 38, total: 45 },
        { name: 'DBMS', present: 42, total: 45 },
        { name: 'Computer Networks', present: 30, total: 45 },
        { name: 'Operating Systems', present: 40, total: 45 },
        { name: 'Web Technology', present: 44, total: 45 }
      ]
    })
    res.json({
      success: true,
      message: 'Marks and attendance added for Ritesh!'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('MongoDB connected successfully')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err)
  })