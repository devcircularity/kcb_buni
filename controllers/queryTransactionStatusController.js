const axios = require('axios');
const { QUERY_TRANSACTION_URL, MPESA_API_KEY, MPESA_API_SECRET, KCB_TOKEN_URL } = process.env;

async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_API_KEY}:${MPESA_API_SECRET}`).toString('base64');

  try {
    const { data } = await axios.post(
      KCB_TOKEN_URL,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Access Token:', data.access_token);
    return data.access_token;
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error('Access token error:', errorDetails);
    throw new Error('Could not retrieve access token');
  }
}

async function queryTransactionStatus(req, res) {
  const { transactionReference } = req.body;
  if (!transactionReference) {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  try {
    const accessToken = await getAccessToken();
    console.log('Using Access Token:', accessToken);

    const payload = {
      header: {
        messageID: `MSG${Date.now()}`,
        conversationId: `CONV${Date.now()}`,
        serviceName: 'WalletQueryTransactionStatus',
        serviceSubCategory: 'TransactionStatus',
        timeStamp: new Date().toISOString(),
        serviceMode: 'SYNC',
        channelCode: 'WEB',
      },
      requestPayload: {
        partnerId: '2',
        trxRequestId: transactionReference,
        additionalData: {},
      },
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const { data } = await axios.post(
      `${QUERY_TRANSACTION_URL}/api/transactioninfo`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API Response:', data);
    res.json({ message: 'Transaction status retrieved successfully', data });
  } catch (err) {
    console.error('Transaction status error:', err);

    if (err.response) {
      const { status, data: errorData } = err.response;
      res.status(status).json({
        error: 'Failed to retrieve transaction status',
        details: errorData,
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve transaction status',
        details: err.message,
      });
    }
  }
}

module.exports = { queryTransactionStatus };
