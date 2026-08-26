const WithdrawalService = require('../../../services/wallet-withdrawal/withdrawalStatus')

const schema = `
  confirmWithdrawalRequest(data: WithdrawalConfirmInput!): WithdrawalRequest!
`;

const resolver = {
  confirmWithdrawalRequest: async (root, args, context) => {
    return await new WithdrawalService(context).confirmWithdrawal(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;