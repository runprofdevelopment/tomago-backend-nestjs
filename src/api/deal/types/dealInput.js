const schema = `
  input DealInput {
    name: String!
    startDate: Date!
    endDate: Date!
    discountType: AmountTypeEnum!
    discountAmount: Float!
    currency: String!
    ribbonName: String!
    ribbonColor: String!
    ribbonBackground: String!

    status: DealStatusEnum
    items: [ DealItemInput! ]
  }

  input DealUpdateInput {
    name: String
    startDate: Date
    endDate: Date
    discountType: AmountTypeEnum
    discountAmount: Float
    currency: String
    ribbonName: String
    ribbonColor: String
    ribbonBackground: String

    status: DealStatusEnum
    items: [ DealItemInput! ]
  }

  input DealItemInput {
    productId: String!
    variantId: String!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;