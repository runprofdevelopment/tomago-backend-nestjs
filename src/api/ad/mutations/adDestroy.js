const AdDestroyer = require('../../../services/ad/adDestroyer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  adDestroy(id: String!): Boolean
`;

const resolver = {
  adDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.adDestroy);
    await new AdDestroyer(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;