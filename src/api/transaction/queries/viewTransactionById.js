const TransactionViewer = require('../../../services/transaction/transcationViewer');

const schema = `
viewTransactionById(id: String!): Transaction!
`;

const resolver = {
  viewTransactionById: async (root, args, context) => {
    return await new TransactionViewer(context).viewTransactionById(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
