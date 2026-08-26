const WithdrawalService = require('../../../services/wallet-withdrawal/withdrawalStatus')

const schema = `
acceptWithdrawalRequest(data: StatusChangeInput!): WithdrawalRequest!
`;

const resolver = {
  acceptWithdrawalRequest: async (root, args, context) => {
    return await new WithdrawalService(context).acceptWithdrawal(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;
