require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Updated CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // Handle preflight requests

const allowedOrigins = [
  'http://localhost:7777',
  'http://localhost:3000',
  'https://carolekinotifoundation.co.ke',
  'https://payments.fotrapp.com' // Add this if it's your backend domain
];

// MongoDB connection setup
const dbUri = process.env.MONGODB_URI;
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB error:', error));

// Import and use routes
const mpesaRoutes = require('./routes/mpesaRoutes');
const fundsTransferRoutes = require('./routes/fundsTransferRoutes');
const queryStatusRoute = require('./routes/queryStatusRoute');
const callbackRoute = require('./routes/callbackRoute');

app.use('/api/mpesa', mpesaRoutes);
app.use('/api/funds-transfer', fundsTransferRoutes);
app.use('/api', queryStatusRoute);
app.use('/api/mpesa', callbackRoute);

// Root route
app.get('/', (req, res) => {
  res.send('KCB Buni Backend is running');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
