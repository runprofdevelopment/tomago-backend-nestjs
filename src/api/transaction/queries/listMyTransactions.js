const TransactionViewer = require('../../../services/transaction/transcationViewer');

const schema = `
listMyTransactions(filter: [ FilterInput! ], sort: [SortInput!], pagination: PaginationInput): TransactionPage!
`;

const resolver = {
  listMyTransactions: async (root, args, context) => {
    return await new TransactionViewer(context).listMyTransactions(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;
