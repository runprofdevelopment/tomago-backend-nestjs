const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Collection extends AbstractEntityModel {
  constructor() {
    super('collection', 'collection', {
      name: new types.Localization(),
      image: new types.Avatar(),
      isActive: new types.Boolean(true),
    });
  }
};
