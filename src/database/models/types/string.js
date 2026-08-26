const lodash = require('lodash');
const assert = require('assert');

module.exports = class String {
  constructor(min, max, defaultVal) {
    this.min = min;
    this.max = max;
    this.defaultValue = defaultVal;
  }

  static get TYPE() {
    return 'string';
  }

  /**
   * Cast field data
   * @param {String} data 
   * @returns 
   */
  cast(data) {
    if (!data) {
      return (this.defaultValue != null || this.defaultValue != undefined)
        ? this.defaultValue.trim()
        : null;
    }

    return data.toString() 
    // || JSON.stringify;
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

    if (this.min || this.min === 0) {
      assert(data.length >= this.min), `Invalid string length for ${FIELD_NAME}; It must be greater than or equal to ${this.min}`;
    }

    if (this.max || this.max === 0) {
      assert(data.length <= this.max, `Invalid string length for ${FIELD_NAME}; It must be less than or equal to ${this.max}`);
    }
  }
};
