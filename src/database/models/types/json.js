const lodash = require('lodash');
const assert = require('assert');

module.exports = class Json {
  constructor(keys = [], defaultVal = null) {
    this.keys = keys;
    this.defaultValue = defaultVal || null;
  }

  static get TYPE() {
    return 'json';
  }
 
  /**
   * Validate the field data
   * @param {String} fieldName 
   * @param {JSON} data 
   * @returns 
   */
   validate(fieldName, data) {
    if (!data) {
      return;
    }

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isObject(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type JSON; JSON cannot represent a non json value: ${data}`);
  }

  /**
   * 
   * @param {JSON} data 
   * @returns {JSON?} Json data after cast
   */
  cast(data) {
    const JSON = {}
    
    if (!data) {
      if (this.keys.length) {
        this.keys.forEach(key => {
          JSON[key] = (this.defaultValue && this.defaultValue[key] != undefined)? this.defaultValue[key] : null;
        });
        return JSON;
      }
      return null;
    }

    if (this.keys.length) {
      this.keys.forEach(key => {
        JSON[key] = lodash.isNumber(data[key]) ? data[key] : data[key] || null;
      });
      return JSON;
    }

    return data;
  }
};

