const WithdrawalService = require('../../../services/wallet-withdrawal/withdrawalService')

const schema = `
withdrawalRequestsList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): WithdrawalPage!
`;

const resolver = {
  withdrawalRequestsList: async (root, args, context) => {
    return await new WithdrawalService(context).listWithdrawalRequests(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;
