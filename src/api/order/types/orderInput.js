// billingInfo: BillingInformationInput!
const schema = `
  input OrderInput {
    addressId: String!
    paymentMethod: PaymentMethodEnum!
    useWallet: Boolean
    amountPartial: Float
  }


  input BillingInformationInput {
    firstName: String!
    lastName: String!
    phoneNumber: String!
    address: String!
    city: String!
    province: String
    country: String
    area: String
    zip: Int
  }

  input ItemsInformationInput {
    productID: String!
    variantID: String!
    quantity: Int
    price: Float
  }
`;


const resolver = {};

exports.schema = schema;
exports.resolver = resolver;