const axios = require('axios');
const getAuthToken = require('./mylerzAuth');

/**
 * Gets the tracking number from Mylerz for a specific order
 * @param {string} orderId - The order ID or reference number in your system
 * @returns {Promise<Object>} The tracking number and related package information
 */
const getTrackingNumber = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const token = await getAuthToken();

    // Try POST method with form-urlencoded content type based on other successful Mylerz API calls
    const response = await axios.post(
      `https://mylerzintegrationtest.mylerz.com/api/packages/GetByReferenceNumber?referenceNumber=${orderId}`,
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
      throw new Error(
        'No packages found for this order ID',
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
    };
  } catch (error) {
    console.error(
      'Error fetching tracking number:',
      error.message,
    );
    if (error.response) {
      console.error('Response data:', error.response.data);
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
};

module.exports = getTrackingNumber;
