const lodash = require('lodash');
const assert = require('assert');
const Number = require('./number');

module.exports = class NumberArray {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  static get TYPE() {
    return 'numberArray';
  }

  cast(data) {
    if (!data) {
      return [];
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
    assert(lodash.isArray(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type Array; Array cannot represent a non array value: ${data}`);
    data.forEach((item, index) => new Number(this.min, this.max = max).validate(`${fieldName}[${index}]`, item));
  }
};
