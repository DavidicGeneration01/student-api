// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  department: { type: String, required: true },
  creditUnits: { type: Number, required: true, min: 1, max: 6 },
  level: { type: Number, required: true, min: 100, max: 500 },
  semester: { type: String, required: true, enum: ['First', 'Second'] },
  isElective: { type: Boolean, default: false },
  description: { type: String, maxlength: 300 }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
