const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  semester: { type: String, required: true },
  subjects: [
    {
      name: { type: String },
      marks: { type: Number },
      totalMarks: { type: Number }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);