const schema = `   
  type Inventory {
    id: String
    onHand_quantity: Int
    available_quantity: Int
    unavailable_quantity: Int
    committed_quantity: Int
    
    productId: String
    productName: Localization
    sku: String
    product: Product

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  } 
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
