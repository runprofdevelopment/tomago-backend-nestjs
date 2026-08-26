const admin = require('firebase-admin');

module.exports = class AppCheckService {

  /**
   * Creates a new {@link AppCheckToken} that can be sent back to a client.
   * 
   * @param {string} appId The app ID to use as the JWT app_id.
   * @param {number} ttlMillis The length of time, in milliseconds, for which the App Check token will
   * be valid. This value must be between 30 minutes and 7 days, inclusive.
   * @returns {Promise<{token: String, expiresAt: Number}>}
   */
  static async createAppCheckToken(appId, ttlMillis) {
    try {
      const options = ttlMillis ? { ttlMillis } : null;
      const appCheckToken = options
        ? await admin.appCheck().createToken(appId, options)
        : await admin.appCheck().createToken(appId);

      return {
        token: appCheckToken.token,
        expiresAt: appCheckToken.ttlMillis,
      };
    } catch (error) {
      console.error('Unable to create App Check token.');
      console.error(error);
    }
  }

  /**
   * Verifies a Firebase App Check token (JWT). If the token is valid, 
   * the promise is fulfilled with the token's decoded claims; otherwise, 
   * the promise is rejected.
   * 
   * @param {String} appCheckToken The App Check token to verify.
   * @param {Boolean} consume 
   * @returns A promise fulfilled with the token's decoded claims 
   * if the App Check token is valid; otherwise, a rejected promise.
   */
  static async verifyToken(appCheckToken, consume) {
    const options = consume == true ? { consume } : null;

    const appCheckClaims = options
      ? await admin.appCheck().verifyToken(appCheckToken, options)
      : await admin.appCheck().verifyToken(appCheckToken);

    return appCheckClaims;
  }
}