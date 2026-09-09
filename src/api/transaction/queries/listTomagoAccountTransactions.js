const TransactionViewer = require('../../../services/transaction/transcationViewer');

const schema = `
  listTomagoAccountTransactions(
    filter: [ FilterInput! ], 
    sort: [SortInput!], pagination: PaginationInput
  ): TransactionPage!
`;

const resolver = {
  listTomagoAccountTransactions: async (root, args, context) => {
    return await new TransactionViewer(context).listTomagoAccountTransactions(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;
