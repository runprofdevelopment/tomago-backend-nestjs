const axios = require('axios');
const getAuthToken = require('./mylerzAuth');

/**
 * Gets the package status from Mylerz for a specific tracking number
 * @param {string} trackingNumber - The AWB/tracking number of the shipment
 * @returns {Promise<Object>} The package status information
 */
const getPackageStatus = async (trackingNumber) => {
  try {
    if (!trackingNumber) {
      throw new Error('Tracking number (AWB) is required');
    }

    const token = await getAuthToken();

    // First try with GET method
    try {
      const response = await axios.get(
        `https://mylerzintegrationtest.mylerz.com/api/packages/GetPackageStatus?AWB=${trackingNumber}`,
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
      `https://mylerzintegrationtest.mylerz.com/api/packages/GetPackageStatus?AWB=${trackingNumber}`,
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

module.exports = getPackageStatus;
