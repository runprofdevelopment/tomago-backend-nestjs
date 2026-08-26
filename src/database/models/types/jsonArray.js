const lodash = require('lodash');
const assert = require('assert');
const Json = require('./json');

module.exports = class JsonArray {
  /**
   * @param {String[]} keys 
   * @param {Number} maxLength The maximum length of the array
   */
  constructor(keys = [], maxLength = 0, defaultVal = null) {
    this.keys = lodash.isArray(keys) ? keys : [];
    this.maxLength = lodash.isInteger(maxLength) ? maxLength : 0;
    this.defaultValue = defaultVal || null;
    // this.defaultValue = lodash.isArray(defaultVal.length) && defaultVal.length 
    //   ? defaultVal
    //   : [];
  }

  static get TYPE() {
    return 'jsonArray';
  }
 
  /**
   * Validate the field data
   * @param {String} fieldName 
   * @param {JSON[]} data 
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
    data.forEach((item, index) => new Json(this.keys).validate(`${fieldName}[${index}]`, item));
  }

  /**
   * @param {JSON[]} data 
   * @returns {JSON[]}
   */
  cast(data) {
    if (!data || !lodash.isArray(data)) {
      // data = [];
      return this.defaultValue && this.keys.length
        ? [ new Json(this.keys, this.defaultValue).cast(null) ]
        : [];
    }

    if (this.maxLength > 0 && data.length > this.maxLength) {
      data = data.slice(0, this.maxLength);
    }
    
    if (lodash.isArray(data) && this.keys.length) {
      const values = [];
      data.forEach((item, index) => {
        const value = new Json(this.keys, this.defaultValue).cast(item);
        if (value) values.push(value);
      });

      return values;
    }

    return data;
  }
};
