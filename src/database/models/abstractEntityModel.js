const lodash = require('lodash');
const types = require('./types');

module.exports = class AbstractEntityModel {
  constructor(modelName, collectionName, fields) {
    this.modelName = modelName;
    this.collectionName = collectionName;
    this.fields = {
      ...fields,
      deletedAt: new types.DateTime(),
      deletedBy: new types.String(),
    };
  }
  
  cast(data) {
    const result = {};

    Object.keys(this.fields).forEach((key) => {
      let fieldValue = data ? data[key] : null;
      
      // Special handling for Localization fields: if both en and ar are empty strings, cast to null
      if (this.fields[key].TYPE === 'localization' && lodash.isObject(fieldValue) &&
          lodash.isEmpty(fieldValue.en) && lodash.isEmpty(fieldValue.ar)) {
        fieldValue = null;
      }
      
      result[key] = this.fields[key].cast(fieldValue);
    });

    return result;
  }

  validate(data) {
    if (!data) {
      return;
    }

    return Object.keys(this.fields).forEach((key) =>
      this.fields[key].validate(key, data[key]),
    );
  }
};
