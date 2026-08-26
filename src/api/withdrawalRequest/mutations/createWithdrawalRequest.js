const WithdrawalService = require('../../../services/wallet-withdrawal/withdrawalService')

const schema = `
createWithdrawalRequest(data: WithdrawalRequestInput!): WithdrawalRequest!
`;

const resolver = {
  createWithdrawalRequest: async (root, args, context) => {
    return await new WithdrawalService(context).createWithdrawalRequest(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;