const lodash = require('lodash');
const assert = require('assert');
const moment = require('moment');

module.exports = class Date {
  static get TYPE() {
    return 'date';
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
    assert(lodash.isString(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type String; String cannot represent a non string value: ${data}`);
    assert(moment(data, 'YYYY-MM-DD').isValid(), `Invalid date for ${FIELD_NAME}`);
  }
};