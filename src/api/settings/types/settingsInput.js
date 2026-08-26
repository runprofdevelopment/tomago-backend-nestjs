const schema = `
  input SettingsInput {
    vat: Float
    cashOnDeliveryFees: Float
    freeShippingAmount: Float
    shippingCost: Float
    pickupAddress: AddressInput
    returnAddress: AddressInput
  }

  input PriceRangeInput {
    min: Float!
    max: Float!
  }
`;
  
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
