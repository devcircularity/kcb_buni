const express = require('express');
const { initiateFundsTransfer } = require('../controllers/fundsTransferController');

const router = express.Router();

// Funds Transfer Route
router.post('/', initiateFundsTransfer);

module.exports = router;
