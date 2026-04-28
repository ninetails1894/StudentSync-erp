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
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || '*'
  ],
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