const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Level is required'],
      min: [100, 'Level must be at least 100'],
      max: [500, 'Level cannot exceed 500'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
