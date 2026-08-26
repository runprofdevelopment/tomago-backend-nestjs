const axios = require('axios');
const getAuthToken = require('./mylerzAuth');
const addOrder = async () => {
  ///////////////arguments🔴

  const token = await getAuthToken();
  const order = await axios.post(
    'https://mylerzintegrationtest.mylerz.com/api/Orders/AddOrders',
    [
      {
        Package_Serial: 123, //unique id
        Description: 'pigs', //what package contains
        Total_Weight: 1, // Fixed weight in KG
        Service_Type: 'DTD', // Door To Door
        Service: 'SD', //lookup package service
        Service_Category: 'DELIVERY', //lookup
        Payment_Type: 'PP', //optional
        COD_Value: 0, //cash on delivery amount
        Special_Notes: 'notes', //optional
        Customer_Name: 'tarek', //reciever name
        //"Customer_Email": "string",
        //"CustomerAddressZipCode": "string",
        //"Customer_ReferenceNumber": "string",
        Mobile_No: '+201006388619',
        Building_No: '387', //optional
        Street: 'abu qeer',
        Floor_No: 2, //optional
        Apartment_No: 2, //optional
        City: 'Alexandria', //optional lookup city zone
        Neighborhood: 'Alexandria', //lookup city zone
        District: 'sidi gaber', //optional
        Address_Category: 'business', //optional default is home could be business
        //"Reference": "string",
        //"Reference2": "string",
        Country: 'Egypt',
        CustVal: 'gamed', //optional extra information could be provided here
        Currency: 'EGP', //optional default is EGP
        GeoLocation: '31,29.8', //optional formated as lat,lng
        Pieces: [
          //should be list of one item when create
          {
            pieceNo: 0,
            Weight: 2,
            ItemCategory: 'Health',
            SpecialNotes: 'no',
            Dimensions: '5*6*3', //formated as width*depth*height
          },
        ],
        PickupDueDate: '2024-08-07T04:27:12.560Z',
        ServiceDate: '2024-08-06T04:27:12.560Z', //optional delivery date
        WarehouseName: 'Decoopa',
        ValueOfGoods: 0,
        AllowToOpenPackage: true,
        Mobile_No2: '+201093163191', //optional
        //"CompanyName": "Decoopa"
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
module.exports = addOrder;
