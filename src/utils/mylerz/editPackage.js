const axios = require('axios');
const getAuthToken = require('./mylerzAuth');
const editOrder = async () => {
  ///////////////arguments🔴
  const token = await getAuthToken();
  const order = await axios.post(
    'https://mylerzintegrationtest.mylerz.com/api/packages/EditPackage',
    {
      Barcode: '63769290676001',
      Description: 'asdasd',
      //"SpecialComment": "string",
      Weight: 4,
      Pieces: [
        {
          PieceBarcode: '63769290676001-01-01',
          Weight: 2,
          SpecialNotes: 'string',
        },
      ],
    },
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
module.exports = editOrder;
