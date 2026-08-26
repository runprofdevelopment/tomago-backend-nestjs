const DealCreator = require('../../../services/deals/dealCreator');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  dealCreate(data: DealInput!): Deal
`;

const resolver = {
  dealCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.dealCreate);
    return new DealCreator(context).execute(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
