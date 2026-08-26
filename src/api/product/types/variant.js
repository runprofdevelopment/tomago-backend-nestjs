const schema = `
  type Variant {
    id: String
    product_id: String
    DID: String

    title: Localization
    description: Localization
    features: [ JSON! ]
    sku: String
    barcodes: [ String! ]
    variant_images: [ Avatar! ]
    main_image: String
    position: Int
    options_values: [ JSON! ]

    cost: Float 
    price: Float
    sale_price: Float
    sale_start_date: String
    sale_end_date: String
    currency: CurrencyCodeEnum
    current_price: Float 
    onSale: Boolean
    ribbon_name: String
    ribbon_color: String
    ribbon_background: String

    warranty: Int
    country_of_origin: Localization
    model_name: Localization
    material: Localization
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
    inventory_quantity: Int
    max_order_qty: Int
    
    seo_keywords: [ String! ]

    rating: Float
    rating_details: JSON
    reviews_count: Int

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;