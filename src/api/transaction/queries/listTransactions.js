const TransactionViewer = require('../../../services/transaction/transcationViewer');

const schema = `
transactionList(filter: [ FilterInput! ], sort: [SortInput!], pagination: PaginationInput): TransactionPage!
`;

const resolver = {
  transactionList: async (root, args, context) => {
    return await new TransactionViewer(context).listTransactions(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;
