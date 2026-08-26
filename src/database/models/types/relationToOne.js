const lodash = require('lodash');
const assert = require('assert');

module.exports = class RelationToOne {
  static get TYPE() {
    return 'relationToOne';
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

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isString(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type String; String cannot represent a non string value: ${data}`);
  }
};
