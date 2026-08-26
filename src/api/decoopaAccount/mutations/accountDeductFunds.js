const AccountDebitService = require('../../../services/decoopa-account/accountDebitService');
const AccountViewer = require('../../../services/decoopa-account/accountViewer');

const schema = `
  accountDeductFunds(amount: Float!, note: String): Account!
`;

const resolver = {
  accountDeductFunds: async (root, args, context) => {
    await new AccountDebitService(context).deductFunds(args.amount, args.note);
    return new AccountViewer(context).findDefaultAccount();
    
    // return true;
  }
};

exports.schema = schema;
exports.resolver = resolver;
