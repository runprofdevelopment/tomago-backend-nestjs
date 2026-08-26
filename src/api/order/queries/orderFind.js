const orderViewer = require('../../../services/order/orderViewer');

const schema = `
  orderFind(id: String!): Order
`;

const resolver = {
  orderFind: async (root, args, context) => {
    return new orderViewer(context).findById(args.id);
  }
};

exports.schema = schema
exports.resolver = resolver