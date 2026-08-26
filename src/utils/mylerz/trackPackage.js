const axios = require('axios');
const getAuthToken = require('./mylerzAuth');
const trackPackage = async (barCode) => {
  const token = await getAuthToken();
  const order = await axios.post(
    `https://mylerzintegrationtest.mylerz.com/api/packages/GetPackageTrackingDetailsByBarCode?barCode=${barCode}`,

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
module.exports = trackPackage;
