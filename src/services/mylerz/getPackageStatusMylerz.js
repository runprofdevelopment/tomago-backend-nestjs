const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const getAuthToken = require('./mylerzAuth');
const axios = require('axios');

/**
 * Service class for getting package status information from Mylerz
 */
module.exports = class PackageStatusMylerz {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
  }

  /**
   * Get package status from Mylerz by tracking number (AWB)
   * @param {string} trackingNumber - Mylerz tracking number/AWB
   * @returns {Promise<Object>} Status information for the package
   */
  async getPackageStatus(trackingNumber) {
    try {
      if (!trackingNumber) {
        throw new Error(
          'Tracking number (AWB) is required',
        );
      }

      const token = await getAuthToken();

      // First try with GET method
      try {
        const response = await axios.get(
          `https://mylerzintegration.mylerz.com/api/packages/GetPackageStatus?AWB=${trackingNumber}`,
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
            method: 'GET',
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
        `https://mylerzintegration.mylerz.com/api/packages/GetPackageStatus?AWB=${trackingNumber}`,
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
        method: 'POST',
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

  /**
   * Get package status by order ID
   * This first gets the tracking number for the order and then fetches the status
   * @param {string} orderId - Your internal order ID
   * @returns {Promise<Object>} Status information for the package
   */
  async getPackageStatusByOrderId(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // First get the tracking number for this order from your database
      const shipments = await admin
        .firestore()
        .collection('shipment')
        .where('orderId', '==', orderId)
        .where('status', '==', 'shippedMylerz')
        .get();

      const shipmentData =
        FirebaseHelper.mapCollection(shipments);

      if (!shipmentData || shipmentData.length === 0) {
        throw new Error(
          'No shipment record found for this order ID',
        );
      }

      const trackingNumber =
        shipmentData[0].tracking_number;

      if (!trackingNumber) {
        throw new Error(
          'No tracking number found for this order',
        );
      }

      // Use the tracking number to get the package status
      const statusData = await this.getPackageStatus(
        trackingNumber,
      );

      return {
        orderId,
        ...statusData,
      };
    } catch (error) {
      console.error(
        'Error fetching package status by order ID:',
        error.message,
      );
      throw error;
    }
  }

  /**
   * Save package status to your database for future reference
   * @param {string} trackingNumber - Mylerz tracking number/AWB
   * @param {Object} statusData - Status data from Mylerz
   * @returns {Promise<Object>} The saved record
   */
  async savePackageStatus(trackingNumber, statusData) {
    try {
      if (!trackingNumber || !statusData) {
        throw new Error(
          'Tracking number and status data are required',
        );
      }

      const batch = await FirebaseHelper.createBatch();

      // Create a record in your database
      const statusRecord = {
        trackingNumber,
        statusData,
        fetchedAt: new Date().toISOString(),
        source: 'mylerz_api',
      };

      const record = await new FirestoreRepository(
        'package-status',
      ).createDocument(statusRecord, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      await FirebaseHelper.commitBatch(batch);

      return record;
    } catch (error) {
      console.error(
        'Error saving package status:',
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get detailed package tracking history
   * @param {string} trackingNumber - Mylerz tracking number/AWB
   * @returns {Promise<Object>} Detailed tracking history
   */
  async getDetailedTrackingHistory(trackingNumber) {
    try {
      if (!trackingNumber) {
        throw new Error(
          'Tracking number (AWB) is required',
        );
      }

      const token = await getAuthToken();

      // Use the GetPackageTrackingDetailsByBarCode endpoint to get detailed tracking
      const response = await axios.post(
        `https://mylerzintegration.mylerz.com/api/packages/GetPackageTrackingDetailsByBarCode?barCode=${trackingNumber}`,
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
          'No tracking history returned from Mylerz',
        );
      }

      return {
        trackingNumber,
        history: response.data,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        'Error fetching tracking history:',
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
      }
      throw error;
    }
  }
};
