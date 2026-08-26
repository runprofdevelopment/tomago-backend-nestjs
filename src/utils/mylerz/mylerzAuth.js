const axios = require('axios');
const qs = require('qs');

/**
 * Authenticate with Mylerz test integration API (utils helpers).
 */
const getAuthToken = async () => {
  const username = process.env.MYLERZ_USERNAME || 'decoopa';
  const password = process.env.MYLERZ_PASSWORD || 'Decoopa@2020';

  const token = await axios.post(
    'https://mylerzintegrationtest.mylerz.com/token',
    qs.stringify({
      username,
      password,
      grant_type: 'password',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return token.data.access_token;
};

module.exports = getAuthToken;
