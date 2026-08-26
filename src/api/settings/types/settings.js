const schema = `
  type Settings {
    id: String
    vat: Float
    cashOnDeliveryFees: Float
    freeShippingAmount: Float
    shippingCost: Float
    pickupAddress: Address
    returnAddress: Address


    createdAt: DateTime
    createdBy: String
    updatedAt: DateTime
    updatedBy: String
  }

  type PriceRange {
    min: Float
    max: Float
  }
`;

const resolver = {};
exports.schema = schema;
exports.resolver = resolver;
