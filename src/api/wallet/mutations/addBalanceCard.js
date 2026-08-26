const WalletCreator = require('../../../services/wallet/walletCreator');
const WalletTopUp = require('../../../services/wallet/walletTopUp')

const schema = `
addBalanceCard(data: WalletInput!): Boolean
`;

const resolver = {
  addBalanceCard: async (root, args, context) => {

    await new WalletTopUp(context).addBalanceCard(args.data);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
