const lodash = require('lodash');
const assert = require('assert');

module.exports = class Enumerator {
  constructor(values, defaultVal = null) {
    this.values = values || [];
    this.defaultValue = defaultVal || null;
  }

  static get TYPE() {
    return 'enumerator';
  }

  /**
   * 
   * @param {String} data 
   * @returns {String}
   */
  cast(data) {
    if (!data) {
      return this.defaultValue || null;
    }

    return this.values.includes(data) ? data : null;
  }
  
  /**
   * Validate the field data
   * @param {String} fieldName Field name
   * @param {String} data Value of field
   * @returns 
   */
   validate(fieldName, data) {
    if (!data) {
      return;
    }

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isString(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type String; String cannot represent a non string value: ${data}`);
    assert(this.values.includes(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected value is one of this ${this.values}`);
  }  
};
