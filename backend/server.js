const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wellness', require('./routes/wellnessRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/clinics', require('./routes/clinicRoutes'));
app.use('/api/pregnancy', require('./routes/pregnancyRoutes')); // <-- NEW pregnancy tracking route
app.use("/api/guidance", require("./routes/guidanceRoutes"));
// backend/server.js (add this line with others)
app.use("/api/forum", require("./routes/forumRoutes"));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MamaCare API' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
