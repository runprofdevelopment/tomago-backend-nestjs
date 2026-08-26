const schema = `
  type AlgoliaProduct {
    objectID: String
    productNo: Int
    product_id: String
    variant_id: String
    sku: String
    barcodes: [ String! ]

    title: Localization
    main_title: Localization
    description: Localization          
    features: [ JSON! ]
    status: ProductStatusEnum
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
    brandEn: String
    brandAr: String
    brand: Localization
    category_id: String
    category_ids: [ String! ]
    categories: [ Localization! ]
    categoriesEn: String
    categoriesAr: String
    variants: [ Variant! ]
    
# ======================================================================

    id: String
    DID: String
    main_image: String
    variant_images: [ Avatar! ]
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
    
    inventory_quantity: Int
    max_order_qty: Int

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