const express = require('express');
const { initiateStkPush } = require('../controllers/mpesaController');
const router = express.Router();

router.post('/stkpush', (req, res, next) => {
  console.log('Incoming STK Push request'); // Log when the route is accessed
  next(); // Pass the request to the controller
}, initiateStkPush);

module.exports = router;
