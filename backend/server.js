// This is the main entry point for the Node.js backend.
// It starts an Express server on port 3001.
// CORS is enabled so the React frontend on port 5173 can call it.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const generateRoute = require('./routes/generate');
const generateStreamRoute = require('./routes/generateStream');
const generateABRoute = require('./routes/generateAB');
const classifyRoute = require('./routes/classify');
const healthRoute = require('./routes/health');
const corpusRoute = require('./routes/corpus');
const historyRoute = require('./routes/history');
const authRoute = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const analyticsRoute = require('./routes/analytics');
const refineRoute = require('./routes/refine');
const feedbackRoute = require('./routes/feedback');
const sessionRoute = require('./routes/session');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/generate', generateRoute);
app.use('/api/generate/stream', generateStreamRoute);
app.use('/api/generate/ab', generateABRoute);
app.use('/api/classify', classifyRoute);
app.use('/api/health', healthRoute);
app.use('/api/corpus', corpusRoute);
app.use('/api/history', historyRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/refine', refineRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/session', sessionRoute);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});
