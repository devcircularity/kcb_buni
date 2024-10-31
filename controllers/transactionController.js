const Transaction = require('../../models/Transaction');

// Create a new transaction with pending status
async function createTransaction(req, res) {
  try {
    const { phoneNumber, amount, invoiceNumber } = req.body;

    const newTransaction = new Transaction({
      phoneNumber,
      amount,
      invoiceNumber,
      status: 'pending', // Initial status
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

// Update a transaction when callback is received
async function updateTransaction(req, res) {
  try {
    const { CheckoutRequestID, ResultCode } = req.body.Body.stkCallback;

    // Determine transaction status based on ResultCode
    const status = ResultCode === 0 ? 'completed' : 'failed';

    // Update the transaction in the database based on CheckoutRequestID
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionReference: CheckoutRequestID },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
}

module.exports = { createTransaction, updateTransaction };
