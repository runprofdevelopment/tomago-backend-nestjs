const WalletCreator = require('../../../services/wallet/walletCreator');
const WalletTopUp = require('../../../services/wallet/walletTopUp')

const schema = `
addBalanceVoucher(data: WalletInput!): Wallet!
`;

const resolver = {
  addBalanceVoucher: async (root, args, context) => {

    const addBalance = await new WalletTopUp(context).addBalanceVoucher(args.data);
    return addBalance
  },
};

exports.schema = schema;
exports.resolver = resolver;
