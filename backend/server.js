const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const ocrRoutes = require('./routes/ocr');
const publishRoutes = require('./routes/publish');
const authRoutes = require('./routes/auth');

// Simple keep-alive route to prevent Render free instance from sleeping
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Use routes
app.use('/api/ocr', ocrRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kalathmakam Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
