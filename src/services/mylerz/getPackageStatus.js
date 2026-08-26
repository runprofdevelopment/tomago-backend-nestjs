const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Order = require('../../database/models/returnRequest');
const getAuthToken = require('./mylerzAuth');
const axios = require('axios');

module.exports = class PackageStattus {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Order();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  async orderReturnedMylerz(data) {
    try {
      const returnRequest =
        await this.repository.findDocumentById(data.id);

      if (!returnRequest) {
        throw new Error('Order not found');
      }
      if (returnRequest.status !== 'accepted') {
        throw new Error(
          `Order status = ${returnRequest.status} and cannot be changed to returned`,
        );
      }

      // const { shipping_company, tracking_link, tracking_number, status } = data

      const {
        shipping_company,
        tracking_link,
        tracking_number,
      } = data;

      const shipment_infomation = {
        orderId: data.id,
        shipping_company,
        tracking_link,
        tracking_number,
        status: 'returnRequestMylerz',
      };

      // Create the Pieces array dynamically
      const piecesArray = returnRequest.items.map(
        (item, index) => ({
          pieceNo: item.variantId,
          Weight: 1, // Always set to 1 kg
          ItemCategory: item.category || 'General',
          SpecialNotes: item.notes || 'Handle with care',
          Dimensions: `${item.width || 0}*${item.depth || 0}*${item.height || 0}`, // Format as width*depth*height
        }),
      );

      const token = await getAuthToken();
      const orders = await axios.post(
        'https://mylerzintegration.mylerz.com/api/Orders/AddOrders',
        [
          {
            Package_Serial: returnRequest.id, //unique id
            Description: data.decription, //what package contains
            Total_Weight: data.weight, //optional in KG
            Service_Type: data.serviceType, //lookup
            Service: data.service, //lookup package service
            Service_Category: data.serviceCategory, //lookup
            Payment_Type: data.paymentType, //optional
            COD_Value: data.cod, //cash on delivery amount
            Special_Notes: data.specialNotes, //optional
            Customer_Name: data.customerName, //reciever name
            Mobile_No: data.mobileNo,
            Building_No: data.buildingNo, //optional
            Street: data.street,
            Floor_No: data.floorNo, //optional
            Apartment_No: data.apartmentNo, //optional
            City: data.city, //optional lookup city zone
            Neighborhood: data.neighborhood, //lookup city zone
            District: data.district, //optional
            Address_Category: data.addressCategory, //optional default is home could be business
            Country: data.country, //optional default is EGY
            CustVal: data.customerValue, //optional extra information could be provided here
            Currency: data.currency, //optional default is EGP
            GeoLocation: data.geoLocation, //optional formated as lat,lng
            Pieces: piecesArray,
            PickupDueDate: data.pickupDueDate,
            ServiceDate: data.serviceDate, //optional delivery date
            WarehouseName: 'Decoopa',
            ValueOfGoods: 0,
            AllowToOpenPackage: true,
            Mobile_No2: data.mobileNo2, //optional
          },
        ],
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const orderData = orders.data;

      const batch = await FirebaseHelper.createBatch();
      const record = await new FirestoreRepository(
        'shipment',
      ).createDocument(shipment_infomation, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await new RequestReturnEditor(this).update(
        {
          id: data.id,
          status: 'returnedDeleveryOnTheWay',
        },
        batch,
      );
      console.log('data', data);
      ////////////////////////////////////.  get order and update status of items ////////////////////////////////////////

      const order = FirebaseHelper.mapDocument(
        await admin
          .firestore()
          .collection('order')
          .doc(returnRequest.orderID)
          .get(),
      );

      const itemsID = returnRequest['items'].map(
        (item) => item.variantId,
      );
      console.log(itemsID, 'itemsIDdddd');
      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          return {
            ...item,
            status: 'returnedDeleveryOnTheWay',
          };
        }
        console.log(item, 'firstName');
        return item;
      });

      batch.update(
        admin
          .firestore()
          .collection('order')
          .doc(returnRequest['orderID']),
        {
          items: order.items,
        },
      );

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      // await new OrderEditor(this).update(
      //   {
      //     id: data.orderID,
      //     orderStatus: 'shipped',
      //     shippingId: record.id,
      //   },
      //   batch,
      // );

      // await TimelineEventCreator.execute(
      //   {
      //     orderId: order.id,
      //     event_type: 'orderShipped',
      //     event_description: `Order was shipped via Decoopa carrier.`,
      //   },
      //   this.ctx,
      //   batch,
      // );

      await FirebaseHelper.commitBatch(batch);
      return orderData;
    } catch (error) {
      throw error;
    }
  }

  async getPackageStatus(barCode) {
    try {
      const token = await getAuthToken();
      const order = await axios.get(
        `https://mylerzintegration.mylerz.com/api/packages/GetPackageStatus?AWB=${barCode}`,
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const orderData = order.data;

      return orderData;
    } catch (error) {
      throw error;
    }
  }

  // orderShippedMaylerz
};
