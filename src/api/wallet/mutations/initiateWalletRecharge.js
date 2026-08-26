const WalletTopUp = require('../../../services/wallet/walletTopUp')

const schema = `
  initiateWalletRecharge(walletId: String!, amount: Float!, currency: CurrencyEnum!): JSON
`;

const resolver = {
  initiateWalletRecharge: async (root, args, context) => {

    const response = await new WalletTopUp(context).initiateWalletRecharge(
      args.walletId,
      args.amount, 
      args.currency
    );
    return response;
  },
};

exports.schema = schema;
exports.resolver = resolver;