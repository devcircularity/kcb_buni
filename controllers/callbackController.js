// controllers/callbackController.js

/**
 * Handle STK Push Callback
 */
function handleCallback(req, res) {
    console.log('Received Callback:', req.body); // Log the entire callback response
  
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback structure:', req.body);
      return res.status(400).json({ error: 'Invalid callback response' });
    }
  
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
  
    // Check if the transaction was successful
    if (ResultCode !== 0) {
      console.error(`Transaction failed: ${ResultDesc}`);
      return res.status(400).json({ error: 'Transaction failed', details: ResultDesc });
    }
  
    console.log('Transaction Reference:', CheckoutRequestID);
  
    // Respond with success message and the transaction reference
    res.status(200).json({
      message: 'Callback received successfully',
      transactionReference: CheckoutRequestID,
    });
  }
  
  module.exports = { handleCallback };
  