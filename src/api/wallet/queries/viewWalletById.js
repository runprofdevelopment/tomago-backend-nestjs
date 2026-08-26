const WalletViewer = require('../../../services/wallet/walletViewer');

const schema = `
  viewWalletById(id: String!): Wallet
`;

const resolver = {
  viewWalletById: async (root, args, context) => {
    // console.log(args.data)
    return await new WalletViewer(context).viewWalletById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
