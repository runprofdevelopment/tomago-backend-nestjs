const WalletViewer = require('../../../services/wallet/walletViewer');

const schema = `
walletList(filter: [ WalletFilterInput! ], orderBy: String, pagination: PaginationInput): WalletPage!
`;

const resolver = {
  walletList: async (root, args, context) => {
    return await new WalletViewer(context).listWallets(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;
