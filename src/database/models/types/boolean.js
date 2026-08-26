const lodash = require('lodash');
const assert = require('assert');

module.exports = class Boolean {
  /**
   * Create a Boolean field with the default value
   * @param {Boolean} defaultVal Default Value
   */
  constructor(defaultVal) {
    this.defaultValue = defaultVal;
  }

  static get TYPE() {
    return 'boolean';
  }

  cast(data) {
    if (data == null || data == undefined) {
      return this.defaultValue || false;
    }

    return !!data;
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
    assert(lodash.isBoolean(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type Boolean; Boolean cannot represent a non boolean value: ${data}`);
  }
};
