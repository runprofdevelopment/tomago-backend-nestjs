const schema = `
  type Product {
    """ The unique ID of the user. """
    id: String
    productNo: Int
    main_title: Localization
    description: Localization          
    features: [ Localization! ]
    variants_options: VariantsOptions

    warranty: Int
    offer_note: Localization
    warranty_returns_eligible: Boolean
    warranty_returns_note: Localization
    
    country_of_origin: Localization
    material: Localization
    model_name: Localization
    model_number: Localization
    what_in_box: Localization
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

    brand_id: String
    category_id: String
    category_ids: [ String! ]
    categories: [ Localization! ]
    brand: Localization

    reviews_count: Int
    rating: Float
    rating_details: JSON

    seo_keywords: [ String! ]

    variants: [ Variant! ]

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type VariantsOptions {
    id: String
    name: Localization
    values: [ Localization! ]
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;