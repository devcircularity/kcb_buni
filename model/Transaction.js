const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    transactionReference: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'donation_mpesa' }
);

module.exports = mongoose.model('Transaction', transactionSchema);
