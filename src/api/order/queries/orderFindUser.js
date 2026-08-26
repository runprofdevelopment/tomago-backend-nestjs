const orderViewer = require('../../../services/order/orderViewer');

const schema = `
  orderFindUser(userID: String!): [ Order ]!
`;

const resolver = {
  orderFindUser: async (root, args, context) => {
    return new orderViewer(context).findByUserId(args.userID);
  }
};

exports.schema = schema
exports.resolver = resolver