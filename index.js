require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import CORS middleware

const app = express();

// List of allowed origins
const allowedOrigins = ['http://localhost:7777', 'http://localhost:3000', 'https://carolekinotifoundation.co.ke'];

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request if origin is in the allowed list
    } else {
      callback(new Error('Not allowed by CORS')); // Reject if origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.use(express.json()); // Middleware to parse JSON requests

// Import routes
const mpesaRoutes = require('./routes/mpesaRoutes');
const fundsTransferRoutes = require('./routes/fundsTransferRoutes');
const queryStatusRoute = require('./routes/queryStatusRoute');
const callbackRoute = require('./routes/callbackRoute');

// Use routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/funds-transfer', fundsTransferRoutes);
app.use('/api', queryStatusRoute);
app.use('/api/mpesa', callbackRoute);

// Root route
app.get('/', (req, res) => {
  res.send('KCB Buni Backend is running');
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
