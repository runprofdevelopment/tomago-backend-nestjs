const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Category extends AbstractEntityModel {
  constructor() {
    super('category', 'category', {
      parent_id: new types.Number(0, null),
      level: new types.Number(1, null),
      position: new types.Number(1, null),
      collection_id: new types.RelationToOne(),

      // nameEn: new types.String(),
      // nameAr: new types.String(),
      name: new types.Localization(),
      image: new types.Avatar(),
      isActive: new types.Boolean(true),
      isRemoved: new types.Boolean(false),
      
      // order: new types.Number(),
      // product_count: : new types.Number(),
      // children: new types.RelationToMany(),
    });
  }
};