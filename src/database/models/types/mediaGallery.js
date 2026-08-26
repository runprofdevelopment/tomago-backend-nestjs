const lodash = require('lodash');
const assert = require('assert');

module.exports = class MediaGallery {
  constructor() {
    this.mediaTypeEnum = ['image', 'video', 'Model', 'file']
  }

  static get TYPE() {
    return 'mediaGallery';
  }

  cast(data) {
    return {
      name: (data && data.name) || null,
      publicUrl: (data && data.publicUrl) || null,
      privateUrl: (data && data.privateUrl) || null,
      mediaType: data ? this.mediaTypeEnum.includes(data.mediaType) : null,
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

    if (data.privateUrl) {
      assert(lodash.isString(data.privateUrl), `Variable ${fieldName}.privateUrl got invalid value ${data.privateUrl}; Expected type String; String cannot represent a non string value: ${data.privateUrl}`);
      assert(data.privateUrl.length < 21845);
    }

    if (data.publicUrl) {
      assert(lodash.isString(data.publicUrl), `Variable ${fieldName}.publicUrl got invalid value ${data.publicUrl}; Expected type String; String cannot represent a non string value: ${data.publicUrl}`);
      assert(data.publicUrl.length < 21845);
    }

    if (data.mediaType) {
      assert(lodash.isString(data.mediaType), `Variable ${fieldName}.mediaType got invalid value ${data.mediaType}; Expected type String; String cannot represent a non string value: ${data.mediaType}`);
      assert(this.mediaTypeEnum.includes(data.mediaTyp), `Variable ${fieldName}.mediaTyp got invalid value ${data.mediaTyp}; Expected value is one of this ${this.mediaTypeEnum}`);
    }
  }
};
