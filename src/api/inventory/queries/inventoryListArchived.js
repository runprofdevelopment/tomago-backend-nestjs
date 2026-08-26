const InventoryViewer = require('../../../services/inventory/inventoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  inventoryListArchivedItems(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): InventoryPage!
`;

const resolver = {
  inventoryListArchivedItems: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.inventoryRead);
    
    return new InventoryViewer(context).listArchivedProducts(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;