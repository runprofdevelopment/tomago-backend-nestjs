const TransactionViewer = require('../../../services/transaction/transcationViewer');

const schema = `
  listDecoopaAccountTransactions(
    filter: [ FilterInput! ], 
    sort: [SortInput!], pagination: PaginationInput
  ): TransactionPage!
`;

const resolver = {
  listDecoopaAccountTransactions: async (root, args, context) => {
    return await new TransactionViewer(context).listDecoopaAccountTransactions(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;