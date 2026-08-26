// brand_id: String!
// category_id: Int!
const schema = `
  input ProductVariantInput {
    title: LocalizationInput
    description: LocalizationInput
    features: [ JSON! ]
    status: ProductStatusEnum

    warranty: Int
    offer_note: LocalizationInput
    warranty_returns_eligible: Boolean
    warranty_returns_note: LocalizationInput

    country_of_origin: LocalizationInput
    model_name: LocalizationInput
    material: LocalizationInput
    model_number: LocalizationInput
    what_in_box: LocalizationInput
    product_length: Float
    product_weight: Float
    product_height: Float
    product_width_Depth: Float
    product_length_unit: DimensionUnitEnum
    product_weight_unit: WeightUnitEnum
    product_height_unit: DimensionUnitEnum
    product_width_unit: DimensionUnitEnum
    
    shipping_price: Float
    shipping_length: Float
    shipping_weight: Float
    shipping_height: Float
    shipping_width_Depth: Float
    shipping_length_unit: DimensionUnitEnum
    shipping_weight_unit: WeightUnitEnum
    shipping_height_unit: DimensionUnitEnum
    shipping_width_unit: DimensionUnitEnum
    
    sku: String
    barcodes: [ String! ]
    variant_images: [ AvatarInput! ]
    cost: Float
    price: Float
    currency: CurrencyCodeEnum
    sale_price: Float
    sale_start_date: String
    sale_end_date: String
    inventory_quantity: Int
    max_order_qty: Int

    seo_keywords: [ String! ]
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
