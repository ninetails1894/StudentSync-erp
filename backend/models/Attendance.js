const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  semester: { type: String, required: true },
  subjects: [
    {
      name: { type: String },
      present: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);