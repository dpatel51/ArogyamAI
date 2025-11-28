const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

// Import Routes
const resourcesRoutes = require('./routes/resources');
const procurementRoutes = require('./routes/procurement');
const aiAgentRoutes = require('./routes/ai-agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Hospital Backend API is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

// API Routes
app.use('/api/resources', resourcesRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/ai-agent', aiAgentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
