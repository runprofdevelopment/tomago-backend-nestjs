const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Variants extends AbstractEntityModel {
  constructor() {
    super('product-variants', 'product-variants', {
      id: new types.String(),
      product_id: new types.RelationToOne(),
      DID: new types.String(),

      //#region [ Basic ]
      title: new types.Localization(),
      description: new types.Localization(),  // Variant-specific description
      features: new types.JsonArray(['en', 'ar']),  // Variant-specific features
      sku: new types.String(),
      barcodes: new types.StringArray(),
      main_image: new types.String(),
      variant_images: new types.Avatars(),
      options_values: new types.JsonArray(['en', 'ar']),
      status: new types.Enumerator(
        ['active', 'inactive', 'archived', 'draft'],
        'draft',
      ),
      //#endregion

      //#region [ Pricing ]
      cost: new types.Number(0, null, 0), // Cost Per Item
      price: new types.Number(0, null, 0),
      currency: new types.Enumerator(
        ['USD', 'EGP', 'SAR', 'AED'],
        'EGP',
      ),
      sale_price: new types.Number(0, null, 0),
      sale_start_date: new types.String(),
      sale_end_date: new types.String(),
      current_price: new types.Number(0, null, 0),
      onSale: new types.Boolean(false),
      ribbon_name: new types.String(),
      ribbon_color: new types.String(),
      ribbon_background: new types.String(),
      //#endregion

      //#region [ Specifications / Product Details ]
      warranty: new types.Number(),  // Variant-specific warranty
      country_of_origin: new types.Localization(),  // Variant-specific country of origin
      model_name: new types.Localization(),  // Variant-specific model name
      material: new types.Localization(),  // Variant-specific material
      model_number: new types.Localization(),  // Variant-specific model number
      what_in_box: new types.Localization(),  // Variant-specific what's in box
      product_length: new types.Number(),  // Variant-specific dimensions
      product_weight: new types.Number(),
      product_height: new types.Number(),
      product_width_Depth: new types.Number(),
      product_length_unit: new types.Enumerator(['mm', 'cm', 'm', 'in', 'ft']),
      product_weight_unit: new types.Enumerator(['g', 'lb', 'kg', 'ft']),
      product_height_unit: new types.Enumerator(['mm', 'cm', 'm', 'in', 'ft']),
      product_width_unit: new types.Enumerator(['mm', 'cm', 'm', 'in', 'ft']),
      inventory_quantity: new types.Number(),
      max_order_qty: new types.Number(),
      product_limit: new types.Number(),
      //#endregion
    });
  }
};


// "option1": "First",
// "option2": null,
// "option3": null,
// "taxable": true,
// "barcode": null,
// "inventory_policy": "deny",
// "fulfillment_service": "manual",
// "inventory_management": null,
// "inventory_item_id": 1070325028,
// "old_inventory_quantity": 0,