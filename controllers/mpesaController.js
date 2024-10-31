const axios = require('axios');
const { MPESA_API_KEY, MPESA_API_SECRET, KCB_TOKEN_URL, KCB_API_URL } = process.env;
const Transaction = require('../model/Transaction');

/**
 * Generate OAuth Access Token
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

    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
}

/**
 * Sanitize phone number by removing any '+' symbols
 */
function sanitizePhoneNumber(phoneNumber) {
  const sanitizedNumber = phoneNumber.replace(/\+/g, '');
  console.log('Sanitized Phone Number:', sanitizedNumber);
  return sanitizedNumber;
}

/**
 * Initiate STK Push Request with the correct payload structure
 */
async function initiateStkPush(req, res) {
  console.log('Payload received from frontend:', req.body);

  const {
    phoneNumber,
    amount,
    invoiceNumber,
    sharedShortCode = true,  // Default value
    orgShortCode = '',  // Replace with your default organization short code
    orgPassKey = '',  // Replace with your actual pass key
    callbackUrl = 'https://webhook.site/2a5a9aac-4cf1-4775-ba1a-661e7e6a22dd',  // Replace with your actual callback URL
    transactionDescription = 'Payment for order',  // Default description
  } = req.body;

  try {
    const accessToken = await getAccessToken();
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);

    const stkPushRequest = {
      amount,
      phoneNumber: sanitizedPhone,
      invoiceNumber,
      sharedShortCode,
      orgShortCode,
      orgPassKey,
      callbackUrl,
      transactionDescription,
    };

    console.log('STK Push Request Payload:', stkPushRequest);

    const response = await axios.post(`${KCB_API_URL}/stkpush`, stkPushRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response from STK Push request:', response.data);

    const { CheckoutRequestID } = response.data.response;

    const newTransaction = new Transaction({
      phoneNumber: sanitizedPhone,
      amount,
      invoiceNumber,
      transactionReference: CheckoutRequestID,
      status: 'pending',  // Initial status
    });

    await newTransaction.save();

    res.json({ message: 'STK Push initiated successfully', CheckoutRequestID });
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    res.status(500).json({ error: 'Failed to initiate STK Push' });
  }
}

module.exports = { initiateStkPush };
