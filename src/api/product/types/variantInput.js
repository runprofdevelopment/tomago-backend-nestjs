const schema = `
  input VariantInput {
    sku: String!
    barcodes: [ String! ]!
    variant_images: [ AvatarInput! ]
    options_values: [ JSON! ]

    cost: Float
    price: Float!
    currency: CurrencyCodeEnum!
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