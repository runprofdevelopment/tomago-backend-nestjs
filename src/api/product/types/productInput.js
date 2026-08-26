const schema = `
  input ProductInput {
    brand_id: String!
    category_id: Int!
    main_title: LocalizationInput!
    description: LocalizationInput!
    features: [ JSON! ]

    status: ProductStatusEnum
    variants_options: [ VariantsOptionsInput! ]

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
    
    seo_keywords: [ String! ]
    
    variants: [ VariantInput! ]
  }

  input VariantsOptionsInput {
    id: String!
    name: LocalizationInput
    values: [ LocalizationInput! ]!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;