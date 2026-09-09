const AccountViewer = require('../../../services/tomago-account/accountViewer');

const schema = `
  findTomagoAccount: Account
`;

const resolver = {
  findTomagoAccount: async (root, args, context) => {
    return new AccountViewer(context).findDefaultAccount();
  }
};

exports.schema = schema;
exports.resolver = resolver;
