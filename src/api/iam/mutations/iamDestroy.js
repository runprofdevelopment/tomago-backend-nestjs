const IamDestroyer = require('../../../services/iam/iamDestroyer');
const PermissionChecker = require('../../../services/iam/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  iamDestroy(id: String!): Boolean
`;

const resolver = {
  iamDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.cityDestroy);
    await new IamDestroyer(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;