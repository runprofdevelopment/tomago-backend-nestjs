const InventoryViewer = require('../../../services/inventory/inventoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;
const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  inventoryList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): InventoryPage!
`;

const resolver = {
  inventoryList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.inventoryRead);
    return new InventoryViewer(context).listWithPagination({
      ...args,
      requestedAttributes: graphqlSelectRequestedAttributes(info, 'rows'),
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;