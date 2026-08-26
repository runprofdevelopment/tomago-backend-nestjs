const lodash = require('lodash');
const assert = require('assert');
const uuid = require('uuid').v4;
// const { v4: uuid } = require('uuid/v4');

module.exports = class File {
  static get TYPE() {
    return 'file';
  }

  cast(data) {
    return data
      ? {
          id: data.id || uuid(),
          name: data.name || null,
          sizeInBytes: data.sizeInBytes || null,
          privateUrl: data.privateUrl || null,
          publicUrl: data.publicUrl || null,
        }
      : null;
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
  
    // data.forEach((item) => {
      if (data.name) {
        assert(lodash.isString(data.name), `Variable ${fieldName}.name got invalid value ${data.name}; Expected type String; String cannot represent a non string value: ${data.name}`);
        assert(data.name.length < 21845);
      }

      if (data.sizeInBytes) {
        assert(lodash.isNumber(data.sizeInBytes), `Variable ${fieldName}.sizeInBytes got invalid value ${data.sizeInBytes}; Expected type Number; Number cannot represent a non number value: ${data.sizeInBytes}`);
      }

      if (data.privateUrl) {
        assert(lodash.isString(data.privateUrl), `Variable ${fieldName}.privateUrl got invalid value ${data.privateUrl}; Expected type String; String cannot represent a non string value: ${data.privateUrl}`);
        assert(data.privateUrl.length < 21845);
      }

      if (data.publicUrl) {
        assert(lodash.isString(data.publicUrl), `Variable ${fieldName}.publicUrl got invalid value ${data.publicUrl}; Expected type String; String cannot represent a non string value: ${data.publicUrl}`);
        assert(data.publicUrl.length < 21845);
      }
    // });
  }
};
