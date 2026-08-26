/**
 * Mylerz shipping integration disabled for Tomago.
 * Use orderShippedDecoopa / orderReturnDecoopa for manual shipping.
 */
module.exports = async function getAuthToken() {
  throw new Error(
    'Mylerz shipping is disabled. Use orderShippedDecoopa / orderReturnDecoopa instead.',
  );
};
