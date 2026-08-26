const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

const DIMENSION_UNIT = ['mm', 'cm', 'm', 'in', 'ft'];
const WEIGHT_UNIT = ['g', 'lb', 'kg', 'ft'];

module.exports = class Product extends AbstractEntityModel {
  constructor() {
    super('product', 'product', {
      id: new types.String(),
      productNo: new types.Number(),

      main_title: new types.Localization(),
      description: new types.Localization(),  // Long Description / Highlights
      features: new types.JsonArray(['en', 'ar']),

      variants_options: new types.JsonArray(['id', 'name', 'values'], null, {
        id: 'default',
        name: { en: 'Title', ar: 'العنوان' },
        values: [{ en: 'Default Title', ar: 'العنوان الافتراضي' }],
      }),

    //#region [ Offer Info / Warranty & Return ]
      warranty: new types.Number(),  // ==> Number of months
      offer_note: new types.Localization(),  // ==> For Shipping / Delivery Offer  
      warranty_returns_eligible: new types.Boolean(),
      warranty_returns_note: new types.Localization(), 
    //#endregion 

    //#region [ Specifications / Product Details ]
      country_of_origin: new types.Localization(),
      model_name: new types.Localization(),
      material: new types.Localization(),
      model_number: new types.Localization(),
      what_in_box: new types.Localization(),
      product_length: new types.Number(),
      product_weight: new types.Number(),
      product_height: new types.Number(),
      product_width_Depth: new types.Number(),

      product_length_unit: new types.Enumerator(DIMENSION_UNIT),
      product_weight_unit: new types.Enumerator(WEIGHT_UNIT),
      product_height_unit: new types.Enumerator(DIMENSION_UNIT),
      product_width_unit: new types.Enumerator(DIMENSION_UNIT),
    //#endregion

    //#region [ Relationship ]
      brand_id: new types.RelationToOne(),
      category_id: new types.RelationToOne(),
      category_ids: new types.StringArray(),
      categories: new types.JsonArray(['en', 'ar']),
      brand: new types.Localization(),
    //#endregion

    //#region [ Shipping Info & Packages Dimensions ]    
      shipping_price: new types.Number(),  
      shipping_length: new types.Number(),
      shipping_weight: new types.Number(),
      shipping_height: new types.Number(),
      shipping_width_Depth: new types.Number(),

      shipping_length_unit: new types.Enumerator(DIMENSION_UNIT),
      shipping_weight_unit: new types.Enumerator(WEIGHT_UNIT),
      shipping_height_unit: new types.Enumerator(DIMENSION_UNIT),
      shipping_width_unit: new types.Enumerator(DIMENSION_UNIT),
    //#endregion

    //#region [ Reviews & Rating Details ]
      reviews_count: new types.Number(null, null, 0),
      rating: new types.Number(0, 5, 0),
      rating_details: new types.Json(['1', '2', '3', '4', '5'], {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }),
    //#endregion
    });
  }
};

// title: new types.Localization(),
// body_html: new types.Localization(),         // HTML 
// specifications: new types.Localization(),    // HTML 
// informations: new types.Localization(),      // HTML 
// variants:                                    // Ex: Size, Color, Material, Style
// media: new types.MediaGalleryArray(),        // media gallery entries => Accepts Images, Videos and 3D Models
// discount: new types.Number(),
// details: new types.Localization(),
// weight: new types.Number(0, null, 0),
// isRemoved: new types.Boolean(false),
// taxable: new types.Boolean(false),
// inventoryId: new types.RelationToOne(),
// category: new types.Localization(),
// vendor_name: new types.String(),