const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
// Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root route (friendly message)
app.get('/', (req, res) => {
  res.send(
    `<h1>Welcome to the Student API!</h1>
     <p>Use <a href="/api-docs">/api-docs</a> to access Swagger UI.</p>`
  );
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
