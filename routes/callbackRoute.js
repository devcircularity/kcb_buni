const express = require('express');
const router = express.Router();

/**
 * Handle callback from STK push
 */
router.post('/callback', (req, res) => {
  console.log('Callback received:', req.body);

  const { Body } = req.body;
  if (Body && Body.stkCallback) {
    const { CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;

    if (ResultCode === 0) {
      console.log(`Transaction ${CheckoutRequestID} was successful.`);
      res.status(200).send('Transaction successful');
    } else {
      console.error(`Transaction failed: ${ResultDesc}`);
      res.status(400).send('Transaction failed');
    }
  } else {
    res.status(400).send('Invalid callback payload');
  }
});

module.exports = router;
