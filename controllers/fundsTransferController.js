const axios = require('axios');
const { MPESA_API_KEY, MPESA_API_SECRET, KCB_TOKEN_URL, FUNDS_TRANSFER_URL } = process.env;

/**
 * Generate OAuth access token
 */
async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_API_KEY}:${MPESA_API_SECRET}`).toString('base64');

  try {
    const response = await axios.post(
      KCB_TOKEN_URL,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
}

/**
 * Initiate Funds Transfer
 */
async function initiateFundsTransfer(req, res) {
  const {
    companyCode,
    transactionType,
    debitAccountNumber,
    debitAmount,
    paymentDetails,
    creditAccountNumber,
    currency,
    beneficiaryDetails, // Includes beneficiaryName
    transactionReference, // Replaces retrievalRefNumber
    beneficiaryBankCode,
  } = req.body;

  // Validate all required fields
  if (
    !companyCode || !transactionType || !debitAccountNumber ||
    !debitAmount || !paymentDetails || !creditAccountNumber ||
    !currency || !beneficiaryDetails || !transactionReference
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const accessToken = await getAccessToken();

    const transferDetails = {
      companyCode,
      transactionType,
      debitAccountNumber,
      debitAmount,
      paymentDetails,
      creditAccountNumber,
      currency,
      beneficiaryDetails,
      transactionReference,
      beneficiaryBankCode,
    };

    console.log('Transfer Details:', JSON.stringify(transferDetails, null, 2));

    const apiEndpoint = `${FUNDS_TRANSFER_URL}/api/v1/transfer`;

    const response = await axios.post(apiEndpoint, transferDetails, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Funds Transfer Response:', response.data);
    res.json({ message: 'Funds Transfer initiated successfully', data: response.data });
  } catch (error) {
    console.error('Error initiating Funds Transfer:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to initiate Funds Transfer',
      details: error.response?.data || error.message,
    });
  }
}

module.exports = { initiateFundsTransfer };
