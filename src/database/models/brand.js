const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Brand extends AbstractEntityModel {
  constructor() {
    super('brand', 'brand', {
      name: new types.Localization(),
      imageUrl: new types.String(),
      isActive: new types.Boolean(true),
      // nameEn: new types.String(),
      // nameAr: new types.String(),
      // isRemoved: new types.Boolean(false),
    });
  }
};