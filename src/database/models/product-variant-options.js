const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class VariantOptions extends AbstractEntityModel {
  constructor() {
    super('variants_options', 'variants_options', {
      id: new types.String(),
      name: new types.Localization(),
      // product_id: new types.RelationToOne(),
      // name: new types.String(),
      // values: new types.StringArray(),
      // position: new types.Number(),
    });
  }
};