const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      role,
      studentId,
      registrationNumber,
      department,
      semester,
      section,
      phone,
      email
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ username: username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = await User.create({
      name: name,
      username: username,
      password: password,
      role: role,
      studentId: studentId || '',
      registrationNumber: registrationNumber || '',
      department: department || '',
      semester: semester || '',
      section: section || '',
      phone: phone || '',
      email: email || ''
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.log('REGISTER ERROR:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      details: error.message 
    });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findOne({ username: username, role: role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or role' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token: token,
      role: user.role,
      name: user.name,
      username: user.username,
      department: user.department,
      studentId: user.studentId,
      semester: user.semester,
      section: user.section,
      phone: user.phone,
      email: user.email,
      registrationNumber: user.registrationNumber
    });

  } catch (error) {
    console.log('LOGIN ERROR:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      details: error.message 
    });
  }
});

module.exports = router;