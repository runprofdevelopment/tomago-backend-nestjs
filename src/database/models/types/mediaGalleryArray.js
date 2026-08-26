const lodash = require('lodash');
const assert = require('assert');

module.exports = class MediaGalleryArray {
  constructor() {
    this.mediaTypeEnum = ['image', 'video', 'Model', 'file']
  }

  static get TYPE() {
    return 'mediaGalleryArray';
  }

  cast(data) {
    return data
      ? data.map((item) => ({
          name: item.name,
          privateUrl: item.privateUrl || null,
          publicUrl: item.publicUrl,
          mediaType: item ? this.mediaTypeEnum.includes(item.mediaType) : null,
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

    data.forEach((item, index) => {
      if (item.name) {
        assert(lodash.isString(item.name), `Variable ${fieldName}[${index}].name got invalid value ${item.name}; Expected type String; String cannot represent a non string value: ${item.name}`);
        assert(item.name.length < 21845);
      }

      if (item.privateUrl) {
        assert(lodash.isString(item.privateUrl), `Variable ${fieldName}[${index}].privateUrl got invalid value ${item.privateUrl}; Expected type String; String cannot represent a non string value: ${item.privateUrl}`);
        assert(item.privateUrl.length < 21845);
      }

      if (item.publicUrl) {
        assert(lodash.isString(item.publicUrl), `Variable ${fieldName}[${index}].publicUrl got invalid value ${item.publicUrl}; Expected type String; String cannot represent a non string value: ${item.publicUrl}`);
        assert(item.publicUrl.length < 21845);
      }

      if (item.mediaType) {
        assert(lodash.isString(item.mediaType), `Variable ${fieldName}[${index}].mediaType got invalid value ${item.mediaType}; Expected type String; String cannot represent a non string value: ${item.mediaType}`);
        assert(this.mediaTypeEnum.includes(item.mediaTyp), `Variable ${fieldName}[${index}].mediaTyp got invalid value ${item.mediaTyp}; Expected value is one of this ${this.mediaTypeEnum}`);
      }
    });
  }
};
