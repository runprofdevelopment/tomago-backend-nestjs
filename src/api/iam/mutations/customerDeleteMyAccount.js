const IamDestroyer = require('../../../services/iam/iamDestroyer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  customerDeleteMyAccount: Boolean
`;

const resolver = {
  customerDeleteMyAccount: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.customerDestroyMyAccount);
    await new IamDestroyer(context).deleteMyAccount();
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;