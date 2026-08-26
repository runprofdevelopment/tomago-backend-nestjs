const axios = require('axios');
const getAuthToken = require('./mylerzAuth');
const cancelPackage = async (barCode) => {
  const token = await getAuthToken();
  const order = await axios.post(
    'https://mylerzintegrationtest.mylerz.com/api/packages/CancelPackage',
    [
      {
        Barcode: `${barCode}`,
      },
    ],
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const orderData = order.data;
  return orderData;
};
module.exports = cancelPackage;
