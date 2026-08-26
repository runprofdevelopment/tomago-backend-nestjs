const lodash = require('lodash');
const assert = require('assert');
// const HelperFunctions = require('../../utils/helperFunctions')
module.exports = class Url {
  static get TYPE() {
    return 'url';
  }

  /**
   * Cast field data
   * @param {String} data 
   * @returns 
   */
  cast(data) {
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * Validate the field data
   * @param {String} fieldName 
   * @param {String} data 
   * @returns 
   */
  validate(fieldName, data) {
    if (!data) {
      return;
    }

    const isValidURL = (url) => {
      const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

      return !!pattern.test(url)
    }

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isString(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type String; String cannot represent a non string value: ${data}`);
    assert(isValidURL(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected URL value not: ${data}`)
  }
};
