const lodash = require('lodash');
const assert = require('assert');
const uuid = require('uuid');
// const uuid = require('uuid/v4');

module.exports = class Avatars {
  static get TYPE() {
    return 'avatars';
  }

  cast(data) {
    return data
      ? data.map((item) => ({
          name: item.name || null,
          publicUrl: item.publicUrl || null,
        }))
      : [];
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

    data.forEach((item) => {
      if (item.name) {
        assert(lodash.isString(item.name), `Variable ${fieldName}.name got invalid value ${item.name}; Expected type String; String cannot represent a non string value: ${item.name}`);
        assert(item.name.length < 21845);
      }

      if (item.publicUrl) {
        assert(lodash.isString(item.publicUrl), `Variable ${fieldName}.publicUrl got invalid value ${item.publicUrl}; Expected type String; String cannot represent a non string value: ${item.publicUrl}`);
        assert(item.publicUrl.length < 21845);
      }
    });
  }  
};
