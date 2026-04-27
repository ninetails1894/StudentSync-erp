const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  department: { type: String },
  phone: { type: String },
  email: { type: String },
  message: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);