/**
 * Mylerz shipping integration disabled for Tomago.
 */
module.exports = async function getAuthToken() {
  throw new Error(
    'Mylerz shipping is disabled. Use orderShippedDecoopa / orderReturnDecoopa instead.',
  );
};
