const lodash = require('lodash');
const assert = require('assert');
const String = require('./string');

module.exports = class StringArray {
  /**
   * @param {Number} maxLength The maximum length of the array
   */
  constructor(maxLength = 0) {
    this.maxLength = lodash.isInteger(maxLength) ? maxLength : 0;
  }

  static get TYPE() {
    return 'stringArray';
  }

  cast(data) {
    if (!data || !lodash.isArray(data)) return [];

    if (this.maxLength > 0 && data.length > this.maxLength) {
      data = data.slice(0, this.maxLength)
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

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isArray(data), `Variable ${FIELD_NAME} got invalid value ${data}, Expected type Array; Array cannot represent a non array value: ${data}`);
    if (this.maxLength > 0) {
      assert(data.length <= this.maxLength, `Invalid array length for ${FIELD_NAME} field, It must be less than or equal to ${this.maxLength}`);
    }
    data.forEach((item, index) => new String().validate(`${fieldName}[${index}]`, item));
  }
};
