const DealEditor = require('../../../services/deals/dealEditor');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  dealUpdate(id: String!, data: DealUpdateInput!): JSON
`;

const resolver = {
  dealUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.dealEdit);
    return new DealEditor(context).execute(
      args.id,
      args.data
    );
  },
};

exports.schema = schema;
exports.resolver = resolver;