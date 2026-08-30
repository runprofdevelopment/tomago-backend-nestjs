const schema = `
  input ReturnRequestInput {
    id: String
    status: ReturnRequestEnum
    returnReason: String!
    rejectReason: String
    comments: String
    photos: [String]
    userID: String
    items: [ CartItemInput! ]!
    orderID: String
    type: ReturnRequestTypeEnum
  }

  input FullyRefundRequestInput {
    orderID: String
    returnReason: String!
    comments: String
    photos: [String]
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;