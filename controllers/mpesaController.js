const axios = require('axios');
const { MPESA_API_KEY, MPESA_API_SECRET, KCB_TOKEN_URL, KCB_API_URL } = process.env;

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

    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
}

/**
 * Initiate STK Push and Save Transaction Reference
 */
async function initiateStkPush(req, res) {
  const { phoneNumber, amount, invoiceNumber, description } = req.body;

  if (!phoneNumber || !amount || !invoiceNumber || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const accessToken = await getAccessToken();

    const stkPushRequest = {
      amount,
      phoneNumber,
      invoiceNumber,
      orgPassKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      orgShortCode: '174379',
      sharedShortCode: true,
      callbackUrl: 'https://d10c-196-207-166-51.ngrok-free.app/api/callback',
      transactionDescription: description,
    };

    const response = await axios.post(`${KCB_API_URL}/stkpush`, stkPushRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('STK Push Response:', response.data);

    const { CheckoutRequestID } = response.data.response; // Extract relevant ID

    if (!CheckoutRequestID) {
      throw new Error('No CheckoutRequestID returned in STK Push response');
    }

    // Store the CheckoutRequestID for querying
    res.json({
      message: 'STK Push initiated successfully',
      transactionReference: CheckoutRequestID,
    });
  } catch (error) {
    console.error('Error initiating STK Push:', error.message);
    res.status(500).json({ error: 'Failed to initiate STK Push', details: error.message });
  }
}

module.exports = { initiateStkPush };
