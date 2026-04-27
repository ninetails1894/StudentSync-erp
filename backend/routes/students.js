const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/authMiddleware');

// GET student profile by studentId
router.get('/:studentId', protect, async (req, res) => {
  try {
    const student = await User.findOne({ 
      studentId: req.params.studentId,
      role: 'student'
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET marks for a student
router.get('/:studentId/marks', protect, async (req, res) => {
  try {
    const marks = await Marks.find({ 
      studentId: req.params.studentId 
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET attendance for a student
router.get('/:studentId/attendance', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      studentId: req.params.studentId 
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST upload marks (teacher/admin only)
router.post('/marks/upload', protect, async (req, res) => {
  try {
    const { studentId, semester, subjects } = req.body;
    
    const existing = await Marks.findOne({ studentId, semester });
    if (existing) {
      existing.subjects = subjects;
      await existing.save();
      return res.json({ message: 'Marks updated successfully' });
    }

    await Marks.create({ studentId, semester, subjects });
    res.status(201).json({ message: 'Marks uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST upload attendance (teacher/admin only)
router.post('/attendance/upload', protect, async (req, res) => {
  try {
    const { studentId, semester, subjects } = req.body;

    const existing = await Attendance.findOne({ studentId, semester });
    if (existing) {
      existing.subjects = subjects;
      await existing.save();
      return res.json({ message: 'Attendance updated successfully' });
    }

    await Attendance.create({ studentId, semester, subjects });
    res.status(201).json({ message: 'Attendance uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE student by studentId (admin only)
router.delete('/:studentId', protect, async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ 
      studentId: req.params.studentId,
      role: 'student'
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await Marks.deleteMany({ studentId: req.params.studentId });
    await Attendance.deleteMany({ studentId: req.params.studentId });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
// Save face descriptor for a user
router.post('/face/register', protect, async (req, res) => {
  try {
    const { descriptor } = req.body
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.faceDescriptor = descriptor
    await user.save()
    res.json({ message: 'Face registered successfully' })
  } catch (error) {
    console.log('Face register error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
})
// Admin registers face for any user by username
router.post('/face/admin-register', protect, async (req, res) => {
  try {
    const { descriptor, targetUsername } = req.body

    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only admins can register faces for other users' 
      })
    }

    // Find by studentId first, then by username
    let targetUser = await User.findOne({ studentId: targetUsername })
    if (!targetUser) {
      targetUser = await User.findOne({ username: targetUsername })
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    targetUser.faceDescriptor = descriptor
    await targetUser.save()

    res.json({ 
      message: `Face registered successfully for ${targetUser.name}` 
    })
  } catch (error) {
    console.log('Admin face register error:', error.message)
    res.status(500).json({ message: 'Server error', details: error.message })
  }
})

// Authenticate using face descriptor
router.post('/face/login', async (req, res) => {
  try {
    const { descriptor, role } = req.body
    const users = await User.find({ 
      role: role,
      faceDescriptor: { $exists: true, $ne: [] }
    })

    if (users.length === 0) {
      return res.status(404).json({ 
        message: 'No face registrations found for this role' 
      })
    }

    const jwt = require('jsonwebtoken')
    let bestMatch = null
    let bestDistance = 1.0

    for (const user of users) {
      if (!user.faceDescriptor || user.faceDescriptor.length === 0) continue
      
      const storedDesc = new Float32Array(user.faceDescriptor)
      const inputDesc = new Float32Array(descriptor)
      
      // Calculate Euclidean distance
      let sum = 0
      for (let i = 0; i < storedDesc.length; i++) {
        sum += Math.pow(storedDesc[i] - inputDesc[i], 2)
      }
      const distance = Math.sqrt(sum)
      
      if (distance < bestDistance) {
        bestDistance = distance
        bestMatch = user
      }
    }

    // Threshold of 0.5 — lower = stricter matching
    if (!bestMatch || bestDistance > 0.5) {
      return res.status(401).json({ 
        message: 'Face not recognized. Try again or use password login.' 
      })
    }

    const token = jwt.sign(
      { id: bestMatch._id, role: bestMatch.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      token,
      role: bestMatch.role,
      name: bestMatch.name,
      username: bestMatch.username,
      department: bestMatch.department,
      studentId: bestMatch.studentId,
      semester: bestMatch.semester,
      section: bestMatch.section,
      phone: bestMatch.phone,
      email: bestMatch.email,
      registrationNumber: bestMatch.registrationNumber,
      hasFaceRegistered: true
    })

  } catch (error) {
    console.log('Face login error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router;