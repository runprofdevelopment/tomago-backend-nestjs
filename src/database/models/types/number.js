const lodash = require('lodash');
const assert = require('assert');

module.exports = class Number {
  constructor(min, max, defaultVal) {
    this.min = min;
    this.max = max;
    this.defaultValue = defaultVal;
  }

  static get TYPE() {
    return 'number';
  }

  cast(data) {
    if (!data && data != 0) {
      return lodash.isNumber(this.defaultValue) ? this.defaultValue : null;
    }

    return lodash.isNumber(data) ? data : null;
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
    assert(lodash.isNumber(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type Number; Number cannot represent a non number value: ${data}`);

    if (this.min || this.min === 0) {
      // assert(data >= this.min, `The field ${FIELD_NAME} must be greater than or equal to ${this.min}`);
      assert(data >= this.min, `Invalid number for ${FIELD_NAME}; It must be greater than or equal to ${this.min}`);
    }

    if (this.max || this.max === 0) {
      // assert(data <= this.max, `The field ${FIELD_NAME} must be less than or equal to ${this.max}`);
      assert(data <= this.max, `Invalid number for ${FIELD_NAME}; It must be less than or equal to ${this.max}`);
    }
  }
};