const AdViewer = require('../../../services/ad/adViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  adList(
    filter: [ FilterInput! ], 
    sort: [SortInput!], pagination: PaginationInput
  ): AdPage!
`;

const resolver = {
  adList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.adRead);
    return new AdViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;