// routes/courseRoutes.js
const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middleware/authenticate');

const {
  validateCourseCreation,
  validateCourseUpdate,
  validateCourseId
} = require('../middleware/Validate');

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

router.get('/', getCourses);
router.get('/:id', validateCourseId, getCourseById);
router.post('/', isAuthenticated, validateCourseCreation, createCourse);
router.put('/:id', isAuthenticated, validateCourseUpdate, updateCourse);
router.delete('/:id', isAuthenticated, validateCourseId, deleteCourse);

module.exports = router;
