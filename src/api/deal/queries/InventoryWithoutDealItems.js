const DealViewer = require('../../../services/deals/dealViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions =
  require('../../../security/permissions').values;

const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  inventoryWithoutDealItems(id: String! , pagination: PaginationInput): ProductPage
`;

const resolver = {
  inventoryWithoutDealItems: async (
    root,
    args,
    context,
    info,
  ) => {
    // new PermissionChecker(context).validateHas(permissions.dealRead);
    return new DealViewer(
      context,
    ).AlgoliaProductsWithoutDeal(args.id, args.pagination);
  },
};

exports.schema = schema;
exports.resolver = resolver;
