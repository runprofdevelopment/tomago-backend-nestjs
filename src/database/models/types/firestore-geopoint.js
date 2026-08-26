const lodash = require('lodash');
const assert = require('assert');
const admin = require('firebase-admin');

module.exports = class GeoPoint {

  static get TYPE() {
    return 'geopoint';
  }

  cast(data) {
    return data 
      ? new admin.firestore.GeoPoint(data.latitude, data.longitude)
      : null
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

    if (data.latitude) {
      assert(lodash.isNumber(data.latitude), `The ${fieldName}.latitude field must be a number`);
      assert(data.latitude >= -90 && data.latitude <= 90, `${fieldName}.latitude must be within a range of [-90 to 90]`);
    }

    if (data.longitude) {
      assert(lodash.isNumber(data.longitude), `The ${fieldName}.longitude field must be a number`);
      assert(data.longitude >= -180 && data.longitude <= 180, `${fieldName}.longitude must be within a range of [-180 to 180]`);
    }
  }
};
