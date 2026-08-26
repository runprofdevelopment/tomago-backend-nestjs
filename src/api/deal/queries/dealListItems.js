const DealItemsViewer = require('../../../services/deals/dealItemsViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  dealListItems(dealId: String!, pagination: PaginationInput): DealItemsPage!
`;

const resolver = {
  dealListItems: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.dealRead);
    return new DealItemsViewer(context).listItemsByDealId(args.dealId, args.pagination);
  },
};

exports.schema = schema;
exports.resolver = resolver;