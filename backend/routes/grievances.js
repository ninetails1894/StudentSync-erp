const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const { protect } = require('../middleware/authMiddleware');

// GET all grievances (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 });
    res.json(grievances);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST submit grievance (any logged in user)
router.post('/', protect, async (req, res) => {
  try {
    const { studentId, department, phone, email, message } = req.body;
    const grievance = await Grievance.create({
      studentId, department, phone, email, message
    });
    res.status(201).json({ message: 'Grievance submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;