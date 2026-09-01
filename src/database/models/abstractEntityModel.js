const lodash = require('lodash');
const types = require('./types');

module.exports = class AbstractEntityModel {
  static get SORTABLE_FIELD_TYPES() {
    return new Set([
      'string',
      'number',
      'boolean',
      'date',
      'dateTime',
      'enumerator',
      'url',
    ]);
  }

  constructor(modelName, collectionName, fields) {
    this.modelName = modelName;
    this.collectionName = collectionName;
    this.fields = {
      ...fields,
      deletedAt: new types.DateTime(),
      deletedBy: new types.String(),
    };
  }

  /**
   * Returns field names that can be used with Firestore orderBy for this model.
   * @returns {string[]}
   */
  getSortableFields() {
    const sortable = Object.keys(this.fields).filter((key) => {
      const fieldType = this.fields[key];
      const typeName =
        fieldType &&
        fieldType.constructor &&
        fieldType.constructor.TYPE;
      return AbstractEntityModel.SORTABLE_FIELD_TYPES.has(typeName);
    });

    return [...new Set([...sortable, 'id', 'createdAt', 'updatedAt'])].sort();
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
