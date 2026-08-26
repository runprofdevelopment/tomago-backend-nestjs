const AccountCreditService = require('../../../services/decoopa-account/accountCreditService');
const AccountViewer = require('../../../services/decoopa-account/accountViewer');

const schema = `
  accountAddFunds(amount: Float!): Account!
`;

const resolver = {
  accountAddFunds: async (root, args, context) => {
    await new AccountCreditService(context).addFunds(args.amount);
    return new AccountViewer(context).findDefaultAccount();
    
    // return true;e;
  },
};

exports.schema = schema;
exports.resolver = resolver;