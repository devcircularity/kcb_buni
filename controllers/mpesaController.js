const axios = require('axios');
const { MPESA_API_KEY, MPESA_API_SECRET, KCB_TOKEN_URL, KCB_API_URL } = process.env;

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
 * Initiate STK Push Request with Customer Reference
 */
async function initiateStkPush(req, res) {
  console.log('Received STK Push request:', req.body);

  let { phoneNumber, amount, invoiceNumber, description, customerReference } = req.body;

  if (!phoneNumber || !amount || !invoiceNumber || !description || !customerReference) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  phoneNumber = sanitizePhoneNumber(phoneNumber);

  try {
    const accessToken = await getAccessToken();

    const stkPushRequest = {
      amount,
      phoneNumber,
      invoiceNumber,
      customerReference,  // Include customer reference here
      orgPassKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      orgShortCode: '174379',
      sharedShortCode: true,
      callbackUrl: 'https://7033-196-207-166-51.ngrok-free.app/api/mpesa/callback',
      transactionDescription: description,
    };

    console.log('STK Push Payload:', stkPushRequest);

    const response = await axios.post(`${KCB_API_URL}/stkpush`, stkPushRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('STK Push Response:', response.data);

    const { CheckoutRequestID } = response.data.response;

    if (!CheckoutRequestID) {
      throw new Error('No CheckoutRequestID returned in STK Push response');
    }

    res.json({
      message: 'STK Push initiated successfully',
      transactionReference: CheckoutRequestID,
      customerReference,  // Return customer reference in the response
    });
  } catch (error) {
    console.error('Error initiating STK Push:', error.message);
    res.status(500).json({ error: 'Failed to initiate STK Push', details: error.message });
  }
}

module.exports = { initiateStkPush };
