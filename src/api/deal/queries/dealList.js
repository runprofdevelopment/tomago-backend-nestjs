const DealViewer = require('../../../services/deals/dealViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  dealList(
    filter: [ FilterInput! ], 
    sort: [SortInput!], pagination: PaginationInput
  ): DealPage!
`;

const resolver = {
  dealList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.dealRead);
    return new DealViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;