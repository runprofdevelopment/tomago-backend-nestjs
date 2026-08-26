const DealItemsEditor = require('../../../services/deals/dealItemsEditor');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  removeItemsFromDeal(id: String!, items: [DealItemInput!]!): Boolean
`;

const resolver = {
  removeItemsFromDeal: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.dealCreate);
    await new DealItemsEditor(context).removeItemsFromDeal(args.id, args.items);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;