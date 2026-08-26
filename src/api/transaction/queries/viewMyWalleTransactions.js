const TransactionViewer = require('../../../services/transaction/transcationViewer');

const schema = `
viewMyWalletTransactions: [ Transaction! ]
`;

const resolver = {
  viewMyWalletTransactions: async (root, args, context) => {
    return await new TransactionViewer(context).viewMyWalletTransactions();
  },
};

exports.schema = schema;
exports.resolver = resolver;
