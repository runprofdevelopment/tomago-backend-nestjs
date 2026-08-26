const WithdrawalService = require('../../../services/wallet-withdrawal/withdrawalService')

const schema = `
viewMyWithdrawalRequests: [ WithdrawalRequest ]
`;

const resolver = {
  viewMyWithdrawalRequests: async (root, args, context) => {
    return await new WithdrawalService(context).viewMyWithdrawalRequests();
  }
};

exports.schema = schema;
exports.resolver = resolver;
