require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'http://localhost:7777',
  'http://localhost:3000',
  'https://carolekinotifoundation.co.ke'
];

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

// MongoDB connection
const dbUri = process.env.MONGODB_URI;

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the app if the connection fails
  });

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB error:', error);
});

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
