const schema = `
  input OrderUpdateInput {
    id: String!
    orderStatus: OrderStatusEnum
  }
`;


const resolver = {};

exports.schema = schema;
exports.resolver = resolver;