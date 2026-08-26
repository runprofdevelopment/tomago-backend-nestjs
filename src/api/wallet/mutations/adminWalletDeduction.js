const WalletDeduction = require('../../../services/wallet/walletDeduction')

const schema = `
adminWalletDeduction(data: DeductWalletInput!): Wallet!
`;

const resolver = {
  adminWalletDeduction: async (root, args, context) => {
    return await new WalletDeduction(context).adminWalletDeduction(args.data);
  }
};

exports.schema = schema;
exports.resolver = resolver;
