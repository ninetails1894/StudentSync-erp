const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect } = require('../middleware/authMiddleware');

// GET all notices
router.get('/', protect, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ isUrgent: -1, createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create notice (admin/teacher only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, context, author, eventDate, category, isUrgent } = req.body;
    const notice = await Notice.create({
      title, context, author, eventDate, category, isUrgent
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;