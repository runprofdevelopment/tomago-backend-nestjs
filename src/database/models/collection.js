const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Collection extends AbstractEntityModel {
  constructor() {
    super('collection', 'collection', {
      name: new types.Localization(),
      subtitle: new types.Localization(),
      slug: new types.String(),
      image: new types.Avatar(),
      display_order: new types.Number(),
      is_featured: new types.Boolean(false),
      isActive: new types.Boolean(true),
    });
  }
};
