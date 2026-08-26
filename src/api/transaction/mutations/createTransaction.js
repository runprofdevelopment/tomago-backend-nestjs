const TransactionCreator = require('../../../services/transaction/transcationCreator');

const schema = `
createTransaction(data: TransactionInput!): Transaction!
`;

const resolver = {
  createTransaction: async (root, args, context) => {
    return await new TransactionCreator(context).createTransaction(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
