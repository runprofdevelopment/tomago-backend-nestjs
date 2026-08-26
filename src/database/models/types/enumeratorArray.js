const lodash = require('lodash');
const assert = require('assert');
const Enumerator = require('./enumerator');

module.exports = class EnumeratorArray {
  /**
   * @param {String[]} values
   * @param {Number} maxLength The maximum length of the array
   */
  constructor(values, maxLength = 0) {
    this.values = values || [];
    this.maxLength = lodash.isInteger(maxLength) ? maxLength : 0;
  }

  static get TYPE() {
    return 'enumeratorArray';
  }
  
  /**
   * 
   * @param {String[]} data 
   * @returns {String[]}
   */
  cast(data) {
    if (!data || !lodash.isArray(data)) return [];

    if (this.maxLength > 0 && data.length > this.maxLength) {
      data = data.slice(0, this.maxLength)
    }
    
    if (lodash.isArray(data) && data.length) {
      const values = []
      data.forEach(item => {
        // const value = new Enumerator(this.values).cast(item)
        const value = this.values.includes(item) ? item : null
        if (value) values.push(value)
      });

      return values
    }

    return data;
  }

  /**
   * Validate the field data
   * @param {String} fieldName Field name
   * @param {String[]} data Values of field
   * @returns 
   */
   validate(fieldName, data) {
    if (!data) {
      return;
    }

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isArray(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type Array; Array cannot represent a non array value: ${data}`);
    if (this.maxLength > 0) {
      assert(data.length <= this.maxLength, `Invalid array length for ${FIELD_NAME} field, It must be less than or equal to ${this.maxLength}`);
    }
    data.forEach((item, index) => new Enumerator(this.values).validate(`${fieldName}[${index}]`, item));
    // assert(this.values.includes(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected value is one of this ${this.values}`);
  }
};
