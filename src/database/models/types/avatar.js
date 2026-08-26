const lodash = require('lodash');
const assert = require('assert');
const uuid = require('uuid');
// const { v4: uuid } = require('uuid/v4');

module.exports = class Avatar {

  static get TYPE() {
    return 'avatar';
  }

  cast(data) {
    return {
      name: data ? data.name : null,
      publicUrl: data ? data.publicUrl : null,
    }
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
    assert(lodash.isObject(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type JSON; JSON cannot represent a non json value: ${data}`);
  
    if (data.name) {
      assert(lodash.isString(data.name), `Variable ${fieldName}.name got invalid value ${data.name}; Expected type String; String cannot represent a non string value: ${data.name}`);
      assert(data.name.length < 21845);
    }

    if (data.publicUrl) {
      assert(lodash.isString(data.publicUrl), `Variable ${fieldName}.publicUrl got invalid value ${data.publicUrl}; Expected type String; String cannot represent a non string value: ${data.publicUrl}`);
      assert(data.publicUrl.length < 21845);
    }
  }
};
