const express = require('express');
const { queryTransactionStatus } = require('../controllers/queryTransactionStatusController');

const router = express.Router();

// Define the route for querying transaction status
router.post('/transactioninfo', queryTransactionStatus);

module.exports = router;
