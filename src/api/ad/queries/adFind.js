const AdViewer = require('../../../services/ad/adViewer');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  adFind(id: String!): Ad
`;

const resolver = {
  adFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.adRead);
    return new AdViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;