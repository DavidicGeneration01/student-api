const Course = require('../models/Course');
const mongoose = require('mongoose');

// GET all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, data: courses });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET course by ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CREATE course
exports.createCourse = async (req, res) => {
  const { title, code, department, creditUnits, level, semester } = req.body;

  if (!title || !code || !department || !creditUnits || !level || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE course
exports.updateCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  try {
    const course = await Course.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE course
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  try {
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
