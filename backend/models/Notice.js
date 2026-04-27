const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  context: { type: String, required: true },
  author: { type: String, required: true },
  eventDate: { type: String },
  category: { 
    type: String, 
    enum: ['Fees', 'Fests and Seminars', 'Placements'],
    required: true 
  },
  isUrgent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);