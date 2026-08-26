const DealDestroyer = require('../../../services/deals/dealDestroyer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  dealDestroy(id: String!): Boolean
`;

const resolver = {
  dealDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.dealDestroy);
    await new DealDestroyer(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;