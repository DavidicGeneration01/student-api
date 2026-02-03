const mongoose = require('mongoose');

// ==================== STUDENT VALIDATORS ====================

// Validate student creation
exports.validateStudentCreation = (req, res, next) => {
  const { name, course, level } = req.body;
  const errors = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push('Student name is required');
  } else if (typeof name !== 'string') {
    errors.push('Student name must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  // Validate course
  if (!course || course.trim() === '') {
    errors.push('Course is required');
  } else if (typeof course !== 'string') {
    errors.push('Course must be a string');
  }

  // Validate level
  if (level === undefined || level === null || level === '') {
    errors.push('Level is required');
  } else if (isNaN(level)) {
    errors.push('Level must be a number');
  } else if (parseInt(level) < 100 || parseInt(level) > 500) {
    errors.push('Level must be between 100 and 500');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validate student update
exports.validateStudentUpdate = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student ID format'
    });
  }

  // Check if request body is not empty
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body cannot be empty'
    });
  }

  // Validate name if provided
  if (req.body.name !== undefined) {
    if (!req.body.name || req.body.name.trim() === '') {
      errors.push('Student name cannot be empty');
    } else if (typeof req.body.name !== 'string') {
      errors.push('Student name must be a string');
    } else if (req.body.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
  }

  // Validate course if provided
  if (req.body.course !== undefined) {
    if (!req.body.course || req.body.course.trim() === '') {
      errors.push('Course cannot be empty');
    } else if (typeof req.body.course !== 'string') {
      errors.push('Course must be a string');
    }
  }

  // Validate level if provided
  if (req.body.level !== undefined) {
    if (req.body.level === null || req.body.level === '') {
      errors.push('Level cannot be empty');
    } else if (isNaN(req.body.level)) {
      errors.push('Level must be a number');
    } else if (parseInt(req.body.level) < 100 || parseInt(req.body.level) > 500) {
      errors.push('Level must be between 100 and 500');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validate student ID in params
exports.validateStudentId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student ID format'
    });
  }

  next();
};

// ==================== COURSE VALIDATORS ====================

// Validate course creation
exports.validateCourseCreation = (req, res, next) => {
  const { title, code, department, creditUnits, level, semester } = req.body;
  const errors = [];

  // Validate title
  if (!title || title.trim() === '') {
    errors.push('Course title is required');
  } else if (typeof title !== 'string') {
    errors.push('Course title must be a string');
  }

  // Validate code
  if (!code || code.trim() === '') {
    errors.push('Course code is required');
  } else if (typeof code !== 'string') {
    errors.push('Course code must be a string');
  } else if (code.trim().length < 2) {
    errors.push('Course code must be at least 2 characters');
  }

  // Validate department
  if (!department || department.trim() === '') {
    errors.push('Department is required');
  } else if (typeof department !== 'string') {
    errors.push('Department must be a string');
  }

  // Validate creditUnits
  if (creditUnits === undefined || creditUnits === null || creditUnits === '') {
    errors.push('Credit units are required');
  } else if (isNaN(creditUnits)) {
    errors.push('Credit units must be a number');
  } else if (parseInt(creditUnits) < 1 || parseInt(creditUnits) > 6) {
    errors.push('Credit units must be between 1 and 6');
  }

  // Validate level
  if (level === undefined || level === null || level === '') {
    errors.push('Level is required');
  } else if (isNaN(level)) {
    errors.push('Level must be a number');
  } else if (parseInt(level) < 100 || parseInt(level) > 500) {
    errors.push('Level must be between 100 and 500');
  }

  // Validate semester
  if (!semester || semester.trim() === '') {
    errors.push('Semester is required');
  } else if (typeof semester !== 'string') {
    errors.push('Semester must be a string');
  } else if (!['First', 'Second'].includes(semester)) {
    errors.push("Semester must be either 'First' or 'Second'");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validate course update
exports.validateCourseUpdate = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID format'
    });
  }

  // Check if request body is not empty
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body cannot be empty'
    });
  }

  // Validate title if provided
  if (req.body.title !== undefined) {
    if (!req.body.title || req.body.title.trim() === '') {
      errors.push('Course title cannot be empty');
    } else if (typeof req.body.title !== 'string') {
      errors.push('Course title must be a string');
    }
  }

  // Validate code if provided
  if (req.body.code !== undefined) {
    if (!req.body.code || req.body.code.trim() === '') {
      errors.push('Course code cannot be empty');
    } else if (typeof req.body.code !== 'string') {
      errors.push('Course code must be a string');
    }
  }

  // Validate department if provided
  if (req.body.department !== undefined) {
    if (!req.body.department || req.body.department.trim() === '') {
      errors.push('Department cannot be empty');
    } else if (typeof req.body.department !== 'string') {
      errors.push('Department must be a string');
    }
  }

  // Validate creditUnits if provided
  if (req.body.creditUnits !== undefined) {
    if (req.body.creditUnits === null || req.body.creditUnits === '') {
      errors.push('Credit units cannot be empty');
    } else if (isNaN(req.body.creditUnits)) {
      errors.push('Credit units must be a number');
    } else if (parseInt(req.body.creditUnits) < 1 || parseInt(req.body.creditUnits) > 6) {
      errors.push('Credit units must be between 1 and 6');
    }
  }

  // Validate level if provided
  if (req.body.level !== undefined) {
    if (req.body.level === null || req.body.level === '') {
      errors.push('Level cannot be empty');
    } else if (isNaN(req.body.level)) {
      errors.push('Level must be a number');
    } else if (parseInt(req.body.level) < 100 || parseInt(req.body.level) > 500) {
      errors.push('Level must be between 100 and 500');
    }
  }

  // Validate semester if provided
  if (req.body.semester !== undefined) {
    if (!req.body.semester || req.body.semester.trim() === '') {
      errors.push('Semester cannot be empty');
    } else if (typeof req.body.semester !== 'string') {
      errors.push('Semester must be a string');
    } else if (!['First', 'Second'].includes(req.body.semester)) {
      errors.push("Semester must be either 'First' or 'Second'");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validate course ID in params
exports.validateCourseId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID format'
    });
  }

  next();
};

// ==================== GLOBAL ERROR HANDLER ====================

// Global error handling middleware
exports.errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  let message = err.message || 'An unexpected error occurred';
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    message = 'Validation error: ' + Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  res.status(status).json({
    success: false,
    message: message,
    error: isDevelopment ? err : {},
    ...(isDevelopment && { stack: err.stack })
  });
};

// 404 Not Found handler
exports.notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};
