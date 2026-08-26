const AccountViewer = require('../../../services/decoopa-account/accountViewer');

const schema = `
  findDecoopaAccount: Account
`;

const resolver = {
  findDecoopaAccount: async (root, args, context) => {
    return new AccountViewer(context).findDefaultAccount();
  }
};

exports.schema = schema;
exports.resolver = resolver;
