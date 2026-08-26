const WalletCreator = require('../../../services/wallet/walletCreator');

const schema = `
createEmptyWallet(id: String!): Wallet!
`;

const resolver = {
  createEmptyWallet: async (root, args, context) => {
    return await new WalletCreator(context).createEmptyWallet(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
