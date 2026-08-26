const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const OrderEditor = require('./orderEditor');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const Order = require('../../database/models/order');
const axios = require('axios');
const getAuthToken = require('./mylerzAuth');

module.exports = class OrderShipmentMylerzSimple {
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

  async orderShippedMylerz(data) {
    try {
      const order = await this.repository.findDocumentById(
        data.id,
      );

      if (!order) {
        throw new Error('Order not found');
      }
      if (order.orderStatus !== 'pendingDelivery') {
        throw new Error(
          `Order status = ${order.orderStatus} and cannot be changed to shipped`,
        );
      }
      if (
        order.financialStatus === 'pending' &&
        order.paymentMethod === 'visa'
      ) {
        throw new Error(
          'Order payment method is visa and is unpaid, cannot ship.',
        );
      }

      // Get items associated with this order from Firestore
      const allItemsIn = order.items.map(
        (item) => item.variantId,
      );
      console.log('allItemsIn', allItemsIn);

      const itemsInThisOrder = FirebaseHelper.mapCollection(
        await admin
          .firestore()
          .collection('product-variants')
          .where('id', 'in', allItemsIn)
          .get(),
      );
      console.log(itemsInThisOrder, 'itemsInThisOrder');

      const { shipping_company } = data;

      // Create the Pieces array dynamically
      const piecesArray = itemsInThisOrder.map((item) => {
        // Parse width and depth from possible combined field or single value
        let width = 0;
        let depth = 0;
        const widthDepth = item.shipping_width_Depth;
        if (typeof widthDepth === 'string') {
          const parts = widthDepth.split('*').map((p) => Number(p));
          width = Number.isFinite(parts[0]) ? parts[0] : 0;
          depth = Number.isFinite(parts[1]) ? parts[1] : 0;
        } else if (widthDepth != null) {
          width = Number(widthDepth) || 0;
        }

        const height = Number(item.shipping_height) || 0;

        return {
          pieceNo: item.id,
          Weight: 1, // Always set to 1 kg
          ItemCategory: item.model_name?.ar || 'General',
          SpecialNotes: data.specialNotes || 'Handle with care',
          Dimensions: `${width}*${depth}*${height}`,
        };
      });

      require('dotenv').config();

      // Constants
      const BASE_URL =
        process.env.MYLERZ_API_URL ||
        'https://mylerzintegration.mylerz.com/api';
      const ADD_ORDER_ENDPOINT = '/Orders/AddOrders';

      // Utility function to add hours to the current date
      const addHoursToDate = (date, hours) => {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
      };
      const currentDateTime = new Date();
      const pickupDueDate = addHoursToDate(
        currentDateTime,
        1,
      ).toISOString();

      // Pull address fields from user's saved address if present on order
      const addressRepo = new FirestoreRepository('addresses');
      let shippingAddress = null;
      try {
        if (order.addressId) {
          shippingAddress = await addressRepo.findDocumentById(order.addressId);
        }
      } catch {}

      // Debug: Log the address data being used
      console.log('🔍 Mylerz Address Data:', {
        name: shippingAddress?.name,
        first_name: shippingAddress?.first_name,
        phoneNumber: shippingAddress?.phoneNumber,
        address: shippingAddress?.address,
        city: shippingAddress?.city,
        area: shippingAddress?.area,
        province: shippingAddress?.province,
        country: shippingAddress?.country,
        lat: shippingAddress?.lat,
        lng: shippingAddress?.lng
      });

      const orderData = {
        Package_Serial: order.id, // Unique ID
        Description: 'pigs', // Package contents
        Total_Weight: 1, // Always set to 1 kg
        Service_Type: 'DTD', // Door To Door
        Service: 'SD', // Lookup value for service
        Service_Category: 'DELIVERY', // Lookup value for category
        Payment_Type: 'PP', // Optional
        COD_Value: 0, // Cash on delivery amount
        Special_Notes: 'Handle with care', // Optional notes
        Customer_Name: shippingAddress?.name || shippingAddress?.first_name || 'Customer', // Receiver's name
        Mobile_No: shippingAddress?.phoneNumber || '', // Receiver's phone
        Building_No: undefined, // Not available in address model
        Street: shippingAddress?.address || '', // Street name
        Floor_No: undefined, // Not available in address model
        Apartment_No: undefined, // Not available in address model
        City: shippingAddress?.city || 'Cairo', // City
        Neighborhood: shippingAddress?.area || shippingAddress?.city || 'Cairo', // Area (zone)
        District: shippingAddress?.province || '', // Province (subzone)
        Address_Category: shippingAddress?.address_label || 'home', // home/business
        Country: shippingAddress?.country || 'Egypt', // Country name
        CustVal: 'gamed', // Optional extra information
        Currency: 'EGP', // Default currency
        GeoLocation: (shippingAddress?.lat != null && shippingAddress?.lng != null) ? `${shippingAddress.lat},${shippingAddress.lng}` : undefined, // Optional formatted as "lat,lng"
        Pieces: piecesArray,
        PickupDueDate: pickupDueDate,
        ServiceDate: addHoursToDate(
          currentDateTime,
          24,
        ).toISOString(),
        WarehouseName: 'Decoopa', // Warehouse name for order pickup
        ValueOfGoods: 0, // Value of the goods
        AllowToOpenPackage: true, // Can the package be opened during delivery
        Mobile_No2: undefined, // Not needed for now
      };

      // Create order function
      const createOrder = async (orderData) => {
        try {
          const token = await getAuthToken();
          console.log(token, 'tokenMylerz');
          const response = await axios.post(
            `${BASE_URL}${ADD_ORDER_ENDPOINT}`,
            [orderData], // Mylerz API requires an array of orders
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          );
          console.log(
            'Order successfully created:',
            response.data,
          );
          return response.data;
        } catch (error) {
          console.error(
            'Error creating order:',
            error.response
              ? error.response.data
              : error.message,
          );
          throw new Error('Failed to create order');
        }
      };

      // Create Order Execution
      let orderResponse;
      try {
        orderResponse = await createOrder(orderData);
        console.log('Order Response:', orderResponse);
      } catch (error) {
        console.error('Error:', error.message);
      }

      // Extract tracking number from orderResponse if available
      let tracking_number = null;
      let tracking_link = null;

      if (
        orderResponse &&
        Array.isArray(orderResponse) &&
        orderResponse.length > 0
      ) {
        // Check if Mylerz returned a tracking number/AWB
        const firstPackage = orderResponse[0];
        if (firstPackage && firstPackage.AWB) {
          tracking_number = firstPackage.AWB;
          tracking_link = `https://www.mylerz.net/tracking?awb=${tracking_number}`;
          console.log(
            'Got tracking number from Mylerz response:',
            tracking_number,
          );
        }
      }

      const batch = await FirebaseHelper.createBatch();

      const shipment_infomation = {
        orderId: data.id,
        shipping_company: shipping_company || 'Mylerz',
        tracking_link: tracking_link,
        tracking_number: tracking_number,
        status: 'shippedMylerz',
      };

      console.log(
        'Saving shipment information with tracking number:',
        tracking_number,
      );

      const record = await new FirestoreRepository(
        'shipment',
      ).createDocument(shipment_infomation, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      await new OrderEditor(this).update(
        {
          id: data.id,
          orderStatus: 'shipped',
          shippingId: record.id,
        },
        batch,
      );

      await TimelineEventCreator.execute(
        {
          orderId: order.id,
          event_type: 'orderShipped',
          event_description: `Order was shipped via Decoopa carrier.`,
        },
        this.ctx,
        batch,
      );

      await FirebaseHelper.commitBatch(batch);

      if (tracking_number) {
        console.log(
          'Order shipped successfully with tracking number:',
          tracking_number,
        );
      } else {
        console.log(
          'Order shipped successfully but no tracking number was provided by Mylerz',
        );
      }

      return {
        success: true,
        orderData: orderData,
        trackingNumber: tracking_number,
        trackingLink: tracking_link,
      };
    } catch (error) {
      console.error(
        'Error shipping order with Mylerz:',
        error.message,
      );
      throw error;
    }
  }
};
