const DealViewer = require('../../../services/deals/dealViewer');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  dealFind(id: String!): Deal
`;

const resolver = {
  dealFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.dealRead);
    return new DealViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;