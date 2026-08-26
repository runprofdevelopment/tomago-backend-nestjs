const WalletViewer = require('../../../services/wallet/walletViewer');

const schema = `
  viewWallet: Wallet
`;

const resolver = {
  viewWallet: async (root, args, context) => {
    return await new WalletViewer(context).viewWallet();
  }
};

exports.schema = schema;
exports.resolver = resolver;
