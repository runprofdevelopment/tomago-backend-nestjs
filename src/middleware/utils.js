const config = require('../../config')();
const ErrorHandler = require('../errors/errorHandler');

module.exports = class Utils {
  /**
   * @param {String} appId 
   * @returns {String} Requested From
   */
  static verifyAppId(appId) {
    // assert(appId, `appId is required`);
    if (!appId) throw new Error(`appId is required`);

    const APP_IDS = config.appIds;
    const appType = APP_IDS[appId];

    if (!appType) {
      throw new ErrorHandler({
        errorCode: 'invalid-appId',
        message: 'Invalid appId, Please enter a valid appId'
      })
    };

    return appType;
  }

  static verifyAppType(appType) {
    const APP_TYPES = config.appTypes;

    if (appType && !APP_TYPES.includes(appType)) {
      throw new ErrorHandler({
        errorCode: 'invalid-appId',
        message: 'Invalid appId, Please enter a valid appId'
      });
    }

    return appType;
  }

  static verifyPlatform(platform) {
    const platforms = ['mobile', 'web'];

    if (platform && !platforms.includes(platform)) {
      throw new ErrorHandler({
        errorCode: 'invalid-platform',
        message: 'platform is required, Please enter a valid platform'
      })
    }
  }

  /**
   * Check if the endpoint is public, so skip the authentication 
   * check Determine if the endpoint is public in order 
   * to bypass the authentication check.
   * @param {String[]} operationNames 
   * @returns {Boolean}
   */
  static checkEndpointIsPublic(operationNames) {
    const PublicAPIs = require('../api/public-apis');
    let numOfPublicAPIs = 0;

    for (const operationName of operationNames) {
      if (
        PublicAPIs.includes(operationName) ||
        operationName == '__typename'
      ) numOfPublicAPIs++;
    }

    return numOfPublicAPIs === operationNames.length;

    // /**
    //  * Check if the endpoint is public, so skip the authentication 
    //  * check Determine if the endpoint is public in order to bypass the authentication check.
    //  */
    // const operationName = req.operationName;
    // if (operationName && PublicAPIs.includes(operationName) && !idToken) {
    //   console.log('Operation Name:', operationName);
    //   return next();
    // }
  }
};