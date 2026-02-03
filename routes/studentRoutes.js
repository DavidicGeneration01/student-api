const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../middleware/authenticate');

const {
  validateStudentCreation,
  validateStudentUpdate,
  validateStudentId
} = require('../middleware/Validate');

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// Routes
router.get('/', getStudents);
router.get('/:id', validateStudentId, getStudentById);
router.post('/', isAuthenticated, validateStudentCreation, createStudent);
router.put('/:id', isAuthenticated, validateStudentUpdate, updateStudent);
router.delete('/:id', isAuthenticated, validateStudentId, deleteStudent);

module.exports = router;
