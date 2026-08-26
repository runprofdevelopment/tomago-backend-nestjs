const AdViewer = require('../../../services/ad/adViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  adListAll: JSON
`;

const resolver = {
  adListAll: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.adRead);
    return new AdViewer(context).listAll(args.status);
  },
};

exports.schema = schema;
exports.resolver = resolver;