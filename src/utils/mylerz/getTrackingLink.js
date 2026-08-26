const axios = require('axios');
const getAuthToken = require('./mylerzAuth');

/**
 * Gets the tracking link and details for a Mylerz shipment
 * @param {string} trackingNumber - The AWB/tracking number of the shipment
 * @returns {Promise<Object>} An object containing the tracking link and package details
 */
const getTrackingLink = async (trackingNumber) => {
  try {
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }

    const token = await getAuthToken();

    // Get package details from Mylerz API
    const response = await axios.get(
      `https://mylerzintegrationtest.mylerz.com/api/packages/GetPackageTrackingDetailsByBarCode?barCode=${trackingNumber}`,
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
};

module.exports = getTrackingLink;
