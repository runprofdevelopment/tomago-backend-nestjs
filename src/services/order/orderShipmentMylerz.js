const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const OrderEditor = require('./orderEditor');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const Order = require('../../database/models/order');
const axios = require('axios');
const getAuthToken = require('./mylerzAuth');

module.exports = class OrderShipmentMylerz {
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

  async getTrackingNumberMylerz(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // First check if the order exists in our system
      const order = await this.repository.findDocumentById(
        orderId,
      );
      if (!order) {
        throw new Error('Order not found in our system');
      }

      const token = await getAuthToken();

      // Try POST method with form-urlencoded content type based on other successful Mylerz API calls
      const response = await axios.post(
        `https://integration.mylerz.net/api/packages/GetByReferenceNumber?referenceNumber=${orderId}`,
        {}, // Empty body with query param in URL
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Check if response has data
      if (!response.data || !response.data.length) {
        // If no tracking information yet, check if there's a shipment record
        const shipments = await admin
          .firestore()
          .collection('shipment')
          .where('orderId', '==', orderId)
          .where('status', '==', 'shippedMylerz')
          .get();

        const shipmentData =
          FirebaseHelper.mapCollection(shipments);

        if (shipmentData && shipmentData.length > 0) {
          return {
            orderId,
            trackingNumber: shipmentData[0].tracking_number,
            message:
              'Retrieved from local shipment records',
            source: 'local_db',
          };
        }

        throw new Error(
          'No packages found for this order ID in Mylerz system',
        );
      }

      // Extract tracking numbers (AWB numbers) from the response
      // Mylerz might return multiple packages for a single order
      const packages = response.data;
      const trackingNumbers = packages.map((pkg) => ({
        trackingNumber: pkg.AWB,
        packageId: pkg.PackageID,
        status: pkg.Status,
        creationDate: pkg.CreationDate,
      }));

      return {
        orderId,
        packages: packages,
        trackingNumbers: trackingNumbers,
        source: 'mylerz_api',
      };
    } catch (error) {
      console.error(
        'Error fetching tracking number:',
        error.message,
      );
      if (error.response) {
        console.error(
          'Response data:',
          error.response.data,
        );
        console.error(
          'Response status:',
          error.response.status,
        );
        console.error(
          'Response headers:',
          error.response.headers,
        );
      }
      throw error;
    }
  }

  async getTrackingLinkMylerz(trackingNumber) {
    try {
      if (!trackingNumber) {
        throw new Error('Tracking number is required');
      }

      const token = await getAuthToken();

      // Get package details from Mylerz API
      const response = await axios.get(
        `https://mylerzintegration.mylerz/api/packages/GetPackageTrackingDetailsByBarCode?barCode=${trackingNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Check if response has data
      if (!response.data) {
        throw new Error(
          'No tracking data returned from Mylerz',
        );
      }

      // Generate tracking URL with AWB number
      // This URL format may need adjustment based on Mylerz's actual tracking URL pattern
      const trackingLink = `https://www.mylerz.net/tracking?awb=${trackingNumber}`;

      return {
        trackingNumber,
        trackingLink,
        packageDetails: response.data,
      };
    } catch (error) {
      console.error(
        'Error fetching tracking link:',
        error.message,
      );
      throw error;
    }
  }

  async orderShippedMylerz(_data) {
    throw new Error(
      'Mylerz shipping is disabled. Use orderShippedDecoopa instead.',
    );
  }

  async __legacyOrderShippedMylerz(data) {
    try {
      const order = await this.repository.findDocumentById(
        data.id,
      );

      // const allItemsIn =
      //   order.items.forEach((item) => {
      //     console.log('item', item.variantId);
      //   });
      const allItemsIn = order.items.map(
        (item) => item.variantId,
      );
      console.log('allItemsIn', allItemsIn);

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

      // New: Get items associated with this order from Firestore
      const itemsInThisOrder = FirebaseHelper.mapCollection(
        await admin
          .firestore()
          .collection('product-variants')
          .where('id', 'in', allItemsIn)
          .get(),
      );
      console.log(itemsInThisOrder, 'itemsInThisOrder');

      // const { shipping_company, tracking_link, tracking_number, status } = data
      const { shipping_company } = data;

      // Fetch user and address data for shipping info
      const userRepository = new FirestoreRepository(
        'user',
      );
      const user = await userRepository.findDocumentById(
        order.userID,
      );
      if (!user) {
        throw new Error('User not found for this order');
      }

      let address = null;
      if (order.addressId) {
        const addressRepository = new FirestoreRepository(
          'addresses',
        );
        address = await addressRepository.findDocumentById(
          order.addressId,
        );
      }
      const billingInfo = order.billingInfo || {};

      const customerName =
        (user &&
          (user.fullName ||
            [user.firstName, user.lastName]
              .filter(Boolean)
              .join(' '))) ||
        (billingInfo &&
          (billingInfo.fullName ||
            [billingInfo.firstName, billingInfo.lastName]
              .filter(Boolean)
              .join(' '))) ||
        'Customer';
      const mobileNo =
        user.phoneNumber || billingInfo.phoneNumber || '';

      const street = (address && address.address) || billingInfo.address || '';
      const city = (address && address.city) || billingInfo.city || 'Cairo';
      // Neighborhood (city zone) and District from user data
      const neighborhood = (address && address.area) || billingInfo.area || '';
      const district = (address && address.province) || billingInfo.province || '';
      const country =
        (address && address.country) ||
        billingInfo.country ||
        'Egypt';
      const addressCategory =
        (address && address.address_label) || 'home';
      const geoLocation =
        address &&
        address.lat != null &&
        address.lng != null
          ? `${address.lat},${address.lng}`
          : undefined;

      // Create the Pieces array dynamically
      const piecesArray = itemsInThisOrder.map(
        (item, index) => {
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
        },
      );

      console.log('hjfgfdhgjkdfhdfk', piecesArray);

      require('dotenv').config();
      const axios = require('axios');

      // Constants
      const BASE_URL =
        process.env.MYLERZ_API_URL ||
        'https://integration.mylerz.net/api';
      const AUTH_TOKEN_ENDPOINT = '/Auth/Token'; // Example endpoint for token, adjust if needed
      const ADD_ORDER_ENDPOINT = '/Orders/AddOrders';

      /**
       * Create Order on Mylerz
       * @param {Object} orderData - The order details to be sent to Mylerz
       * @returns {Promise<Object>} The response data from Mylerz API
       */
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

      // Compute total weight and payment details
      const totalWeight = piecesArray.reduce(
        (sum, p) => sum + (Number(p.Weight) || 0),
        0,
      );
      const paymentType =
        order.paymentMethod === 'cod' ? 'COD' : 'PP';
      const codValue =
        paymentType === 'COD'
          ? Number(order.totalPrice) || 0
          : 0;

      const orderData = {
        Package_Serial: order.id, // Unique ID
        Description: `Order ${order.id}`, // Package contents
        Total_Weight: 1, // Fixed weight in KG
        Service_Type: 'DTD', // Door To Door
        Service: 'SD', // Lookup value for service
        Service_Category: 'DELIVERY', // Lookup value for category
        Payment_Type: paymentType, // Optional
        COD_Value: codValue, // Cash on delivery amount
        Special_Notes:
          data.specialNotes || 'Handle with care', // Optional notes
        Customer_Name: customerName, // Receiver's name
        Mobile_No: mobileNo, // Receiver's phone
        Building_No: undefined, // Not available in address model
        Street: street, // Street name
        Floor_No: undefined, // Not available in address model
        Apartment_No: undefined, // Not available in address model
        City: city, // Optional city lookup
        Neighborhood: neighborhood || city, // Prefer user's area, fallback to city
        District: district, // Province/subzone
        Address_Category: addressCategory, // Default is 'home'
        Country: country, // Country name
        CustVal: undefined, // Optional extra information
        Currency: order.currency || 'EGP', // Default currency
        GeoLocation: geoLocation, // Optional formatted as "lat,lng"
        Pieces: piecesArray,
        PickupDueDate: pickupDueDate, // 👈 Ensuring future date
        ServiceDate: addHoursToDate(
          currentDateTime,
          24,
        ).toISOString(),
        WarehouseName: 'Decoopa', // Warehouse name for order pickup
        ValueOfGoods: Number(order.totalPrice) || 0, // Value of the goods
        AllowToOpenPackage: true, // Can the package be opened during delivery
        Mobile_No2: undefined, // Not needed for now
      };
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

      /**
       * Create Order Execution
       */
      let orderResponse;
      try {
        orderResponse = await createOrder(orderData);
        console.log('Order Response:', orderResponse);

        // Check if orderResponse exists and has the expected structure
        if (!orderResponse) {
          throw new Error(
            'No response received from Mylerz order creation',
          );
        }

        console.log(
          'Order Response Structure:',
          JSON.stringify(orderResponse, null, 2),
        );

        // Check if Value exists
        if (!orderResponse.Value) {
          throw new Error(
            'Mylerz response missing Value property',
          );
        }

        // Check if Packages exists and is an array
        if (
          !orderResponse.Value.Packages ||
          !Array.isArray(orderResponse.Value.Packages)
        ) {
          throw new Error(
            'Mylerz response missing Packages array',
          );
        }

        // Check if there's at least one package
        if (orderResponse.Value.Packages.length === 0) {
          throw new Error(
            'No packages found in Mylerz response',
          );
        }

        console.log(
          'First Package:',
          orderResponse.Value.Packages[0],
        );

        // Check if BarCode exists in the first package
        const firstPackage =
          orderResponse.Value.Packages[0];
        if (
          !firstPackage.BarCode &&
          !firstPackage.Barcode &&
          !firstPackage.barcode
        ) {
          console.error(
            'Available package properties:',
            Object.keys(firstPackage),
          );
          throw new Error(
            'Mylerz package missing BarCode property',
          );
        }
      } catch (error) {
        console.error(
          'Error creating Mylerz order:',
          error.message,
        );

        // Log the full error details for debugging
        if (error.response) {
          console.error(
            'Mylerz API Response Status:',
            error.response.status,
          );
          console.error(
            'Mylerz API Response Data:',
            error.response.data,
          );
        }

        // Instead of throwing, let's try to continue with a fallback
        console.log(
          'Attempting to continue with fallback tracking...',
        );

        // Generate a fallback tracking number based on order ID
        const fallbackTrackingNumber = `DECOOPA-${
          data.id
        }-${Date.now()}`;
        console.log(
          'Using fallback tracking number:',
          fallbackTrackingNumber,
        );

        // Set the tracking number to the fallback
        const trackingNumber = fallbackTrackingNumber;
        const trackingLink = `https://mylerz.net/track/${trackingNumber}`;

        // Save shipment information with fallback tracking
        const shipment_infomation = {
          orderId: data.id,
          shipping_company: shipping_company || 'Mylerz',
          tracking_link: trackingLink,
          tracking_number: trackingNumber,
          status: 'shippedMylerz',
          note: 'Created with fallback tracking due to Mylerz API error',
        };

        const batch = await FirebaseHelper.createBatch();

        const record = await new FirestoreRepository(
          'shipment',
        ).createDocument(shipment_infomation, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });

        console.log(
          'Fallback shipment record created:',
          record,
        );

        await new OrderEditor(this).update(
          {
            id: data.id,
            orderStatus: 'shipped',
            shippingId: record.id,
          },
          batch,
        );

        await FirebaseHelper.commitBatch(batch);

        return {
          trackingNumber,
          trackingLink,
          packageDetails: {
            note: 'Fallback tracking created due to Mylerz API error',
          },
          fallback: true,
        };
      }

      const firstPackage = orderResponse.Value.Packages[0];
      const barCode =
        firstPackage.BarCode ||
        firstPackage.Barcode ||
        firstPackage.barcode;
      const trackingNumber = barCode;

      ///////////////////////////////////////////////////////////////////////////////////////////////// https://integration.mylerz.net
      // Get package details from Mylerz API
      let packageDetails = null;
      try {
        const token = await getAuthToken();
        console.log(
          'Getting package details for tracking number:',
          trackingNumber,
        );

        const response = await axios.get(
          `https://integration.mylerz.net/api/packages/GetPackageTrackingDetailsByBarCode?barCode=${trackingNumber}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log(
          'Package details response:',
          response.data,
        );

        // Check if response has data
        if (!response.data) {
          throw new Error(
            'No tracking data returned from Mylerz',
          );
        }

        packageDetails = response.data;
      } catch (error) {
        console.error(
          'Error getting package details:',
          error.message,
        );
        if (error.response) {
          console.error(
            'Response status:',
            error.response.status,
          );
          console.error(
            'Response data:',
            error.response.data,
          );
        }
        // Don't throw here, just log the error and continue
        console.log(
          'Continuing without package details...',
        );
        packageDetails = {
          note: 'Package details unavailable due to API error',
        };
      }

      // Generate tracking URL with AWB number
      // This URL format may need adjustment based on Mylerz's actual tracking URL pattern
      const trackingLink = `https://mylerz.net/track/${trackingNumber}`;

      // save in collection
      const shipment_infomation = {
        orderId: data.id,
        shipping_company: shipping_company || 'Mylerz',
        tracking_link: trackingLink,
        tracking_number: trackingNumber,
        status: 'shippedMylerz',
      };

      const batch = await FirebaseHelper.createBatch();

      const record = await new FirestoreRepository(
        'shipment',
      ).createDocument(shipment_infomation, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      console.log('record', record);

      await new OrderEditor(this).update(
        {
          id: data.id,
          orderStatus: 'shipped',
          shippingId: record.id,
        },
        batch,
      );

      await FirebaseHelper.commitBatch(batch);

      return {
        trackingNumber,
        trackingLink,
        packageDetails: packageDetails,
      };

      // Extract tracking number from orderResponse if available
      let tracking_number = null;
      let tracking_link = null;

      // if (
      //   orderResponse &&
      //   Array.isArray(orderResponse) &&
      //   orderResponse.length > 0
      // ) {
      //   // Check if Mylerz returned a tracking number/AWB
      //   const firstPackage = orderResponse[0];
      //   if (firstPackage && firstPackage.AWB) {
      //     tracking_number = firstPackage.AWB;
      //     tracking_link = `https://www.mylerz.net/tracking?awb=${tracking_number}`;
      //     console.log(
      //       'Got tracking number from Mylerz response:',
      //       tracking_number,
      //     );
      //   }
      // }

      // If we didn't get tracking from response, try to get it from Mylerz API
      // if (!tracking_number) {
      //   try {
      //     // Wait a moment to allow Mylerz to process the order
      //     await new Promise((resolve) =>
      //       setTimeout(resolve, 5000),
      //     ); // Increased wait time to 5 seconds

      //     // Use the utility function to get tracking info by order ID
      //     // Using the local method is more reliable as it has fallback to DB check
      //     try {
      //       const trackingInfo =
      //         await this.getTrackingNumberMylerz(order.id);
      //       console.log(
      //         'Mylerz Tracking Information:',
      //         JSON.stringify(trackingInfo, null, 2),
      //       );

      //       if (
      //         trackingInfo.trackingNumbers &&
      //         trackingInfo.trackingNumbers.length > 0
      //       ) {
      //         tracking_number =
      //           trackingInfo.trackingNumbers[0]
      //             .trackingNumber;
      //         tracking_link = `https://www.mylerz.net/tracking?awb=${tracking_number}`;
      //         console.log(
      //           'Got tracking number from class method:',
      //           tracking_number,
      //         );
      //       } else if (trackingInfo.trackingNumber) {
      //         tracking_number = trackingInfo.trackingNumber;
      //         tracking_link = `https://www.mylerz.net/tracking?awb=${tracking_number}`;
      //         console.log(
      //           'Got tracking number from local DB:',
      //           tracking_number,
      //         );
      //       }
      //     } catch (methodError) {
      //       console.error(
      //         'Error using class method:',
      //         methodError.message,
      //       );

      //       // Fallback to direct utility function call
      //       console.log(
      //         'Trying fallback to utility function...',
      //       );
      //       const getTrackingNumber = require('../../utils/mylerz/getTrackingNumber');
      //       const trackingInfo = await getTrackingNumber(
      //         order.id,
      //       );

      //       if (
      //         trackingInfo &&
      //         trackingInfo.trackingNumbers &&
      //         trackingInfo.trackingNumbers.length > 0
      //       ) {
      //         tracking_number =
      //           trackingInfo.trackingNumbers[0]
      //             .trackingNumber;
      //         tracking_link = `https://www.mylerz.net/tracking?awb=${tracking_number}`;
      //         console.log(
      //           'Got tracking number from utility function:',
      //           tracking_number,
      //         );
      //       }
      //     }
      //   } catch (error) {
      //     console.error(
      //       'Error fetching tracking number from Mylerz API:',
      //       error.message,
      //     );
      //     if (error.response) {
      //       console.error(
      //         'Response data:',
      //         error.response.data,
      //       );
      //       console.error(
      //         'Response status:',
      //         error.response.status,
      //       );
      //     }
      //   }
      // }

      // const batch = await FirebaseHelper.createBatch();

      // const shipment_infomation = {
      //   orderId: data.id,
      //   shipping_company: shipping_company || 'Mylerz',
      //   tracking_link: tracking_link,
      //   tracking_number: tracking_number,
      //   status: 'shippedMylerz',
      // };

      // console.log(
      //   'Saving shipment information with tracking number:',
      //   tracking_number,
      // );

      // const record = await new FirestoreRepository(
      //   'shipment',
      // ).createDocument(shipment_infomation, {
      //   batch,
      //   currentUser: this.currentUser,
      //   language: this.language,
      // });

      // await new OrderEditor(this).update(
      //   {
      //     id: data.id,
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

      // await FirebaseHelper.commitBatch(batch);

      // // Get tracking number after shipping the order - only if we haven't already gotten it
      // if (!tracking_number) {
      //   try {
      //     // Wait a moment to allow Mylerz to process the order
      //     await new Promise((resolve) =>
      //       setTimeout(resolve, 3000),
      //     );

      //     // Get the tracking number
      //     const trackingInfo =
      //       await this.getTrackingNumberMylerz(data.id);
      //     console.log(
      //       'Mylerz Tracking Information:',
      //       JSON.stringify(trackingInfo, null, 2),
      //     );

      //     if (
      //       trackingInfo.trackingNumbers &&
      //       trackingInfo.trackingNumbers.length > 0
      //     ) {
      //       // If we got tracking numbers from Mylerz API
      //       console.log(
      //         'Tracking Numbers:',
      //         trackingInfo.trackingNumbers
      //           .map((t) => t.trackingNumber)
      //           .join(', '),
      //       );
      //     } else if (trackingInfo.trackingNumber) {
      //       // If we got tracking number from local DB
      //       console.log(
      //         'Tracking Number (from local DB):',
      //         trackingInfo.trackingNumber,
      //       );
      //     }
      //   } catch (error) {
      //     console.error(
      //       'Error getting tracking number after shipping:',
      //       error.message,
      //     );
      //     // Don't throw error here, as the order was already shipped successfully
      //   }
      // } else {
      //   console.log(
      //     'Already have tracking number:',
      //     tracking_number,
      //   );
      // }

      // return orderData;
    } catch (error) {
      throw error;
    }
  }

  async getPackageStatusMylerz(trackingNumber) {
    try {
      if (!trackingNumber) {
        throw new Error(
          'Tracking number (AWB) is required',
        );
      }

      const token = await getAuthToken();

      // First try with GET method (as seen in existing implementations)
      try {
        const response = await axios.get(
          `https://integration.mylerz.net/api/packages/GetPackageStatus?AWB=${trackingNumber}`,
          {
            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data) {
          console.log(
            'Package status retrieved successfully with GET method',
          );
          return {
            trackingNumber,
            status: response.data,
            source: 'mylerz_api_get',
          };
        }
      } catch (getError) {
        console.error(
          'Error using GET method for package status:',
          getError.message,
        );
        // If GET fails, we'll try POST below
      }

      // If GET method failed, try with POST method (more consistent with other Mylerz endpoints)
      const response = await axios.post(
        `https://integration.mylerz.net/api/packages/GetPackageStatus?AWB=${trackingNumber}`,
        {}, // Empty body with query param in URL
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data) {
        throw new Error(
          'No package status data returned from Mylerz',
        );
      }

      console.log(
        'Package status retrieved successfully with POST method',
      );
      return {
        trackingNumber,
        status: response.data,
        source: 'mylerz_api_post',
      };
    } catch (error) {
      console.error(
        'Error fetching package status:',
        error.message,
      );
      if (error.response) {
        console.error(
          'Response data:',
          error.response.data,
        );
        console.error(
          'Response status:',
          error.response.status,
        );
        console.error(
          'Response headers:',
          error.response.headers,
        );
      }
      throw error;
    }
  }

  // orderShippedMaylerz
};
