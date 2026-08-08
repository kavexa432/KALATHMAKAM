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

app.use('/api/ocr', ocrRoutes);
app.use('/api/publish', publishRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kalathmakam Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
