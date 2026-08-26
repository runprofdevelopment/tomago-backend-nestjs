const WithdrawalService = require('../../../services/wallet-withdrawal/withdrawalStatus')

const schema = `
rejectWithdrawalRequest(data: WithdrawalRejectInput!): WithdrawalRequest!
`;

const resolver = {
  rejectWithdrawalRequest: async (root, args, context) => {
    return await new WithdrawalService(context).rejectWithdrawal(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;
