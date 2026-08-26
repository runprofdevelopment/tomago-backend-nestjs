const AdEditor = require('../../../services/ad/adEditor');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  adUpdate(id: String!, data: AdInput!): Ad
`;

const resolver = {
  adUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.adEdit);
    return new AdEditor(context).execute(
      args.id,
      args.data
    );
  },
};

exports.schema = schema;
exports.resolver = resolver;