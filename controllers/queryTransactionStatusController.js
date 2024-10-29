const axios = require('axios');
const { QUERY_TRANSACTION_URL, MPESA_API_KEY, MPESA_API_SECRET, KCB_TOKEN_URL } = process.env;

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
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
    throw new Error('Failed to get access token');
  }
}

/**
 * Query Transaction Status
 */
async function queryTransactionStatus(req, res) {
  const { transactionReference } = req.body;

  if (!transactionReference) {
    return res.status(400).json({ error: 'Missing transaction reference' });
  }

  try {
    const accessToken = await getAccessToken();

    const requestPayload = {
      header: {
        messageID: `MSG${Date.now()}`,
        featureCode: "101",
        featureName: "FinancialInquiries",
        serviceCode: "1004",
        serviceName: "TransactionInfo",
        serviceSubCategory: "ACCOUNT",
        minorServiceVersion: "1.0",
        channelCode: "206",
        channelName: "ibank",
        routeCode: "001",
        timeStamp: new Date().toISOString(),
        serviceMode: "sync",
        subscribeEvents: "1",
        callBackURL: ""
      },
      requestPayload: {
        transactionInfo: {
          primaryData: {
            businessKey: transactionReference,
            businessKeyType: "CHECKOUT"
          },
          additionalDetails: {
            companyCode: "KE0010001"
          }
        }
      }
    };

    const response = await axios.post(`${QUERY_TRANSACTION_URL}/api/transactioninfo`, requestPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Transaction Status:', response.data);
    res.json({ message: 'Transaction status retrieved successfully', data: response.data });

  } catch (error) {
    console.error('Error querying transaction status:', error.message);
    res.status(500).json({ error: 'Failed to query transaction status', details: error.message });
  }
}

module.exports = { queryTransactionStatus };
