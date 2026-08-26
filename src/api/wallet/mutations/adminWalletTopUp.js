const WalletTopUp = require('../../../services/wallet/walletTopUp')

const schema = `
adminWalletTopUp(data: WalletTopUpInput!): Wallet!
`;

const resolver = {
  adminWalletTopUp: async (root, args, context) => {
    return await new WalletTopUp(context).adminWalletTopUp(args.data);
  }
};

exports.schema = schema;
exports.resolver = resolver;
