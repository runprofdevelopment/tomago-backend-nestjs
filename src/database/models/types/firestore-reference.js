const lodash = require('lodash');
const assert = require('assert');
const admin = require('firebase-admin');

module.exports = class Reference {
  static get TYPE() {
    return 'reference';
  }

  cast(data) {
    return data 
      ? admin.firestore().doc(data)
      : null;
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

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isString(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type String; String cannot represent a non string value: ${data}`);

  }  
};
