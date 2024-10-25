require('dotenv').config();
const express = require('express');

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Import routes
const mpesaRoutes = require('./routes/mpesaRoutes');
const fundsTransferRoutes = require('./routes/fundsTransferRoutes');
const queryStatusRoute = require('./routes/queryStatusRoute');
const callbackRoute = require('./routes/callbackRoute'); // Import callback route

// Use routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/funds-transfer', fundsTransferRoutes);
app.use('/api', queryStatusRoute);
app.use('/api/mpesa', callbackRoute); // Ensure callback route is registered correctly

// Root route
app.get('/', (req, res) => {
  res.send('KCB Buni Backend is running');
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
