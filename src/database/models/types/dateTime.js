const lodash = require('lodash');
const assert = require('assert');

module.exports = class DateTime {
  static get TYPE() {
    return 'dateTime';
  }

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

    const FIELD_NAME = fieldName ? `\"${fieldName}\"` : ''
    assert(lodash.isDate(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type Date; Date cannot represent a non date value: ${data}`);
  }
};
