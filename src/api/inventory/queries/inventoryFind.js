const InventoryViewer = require('../../../services/inventory/inventoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  inventoryFind(variant_id: String!): InventoryItem
`;

const resolver = {
  inventoryFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.inventoryRead);
    return new InventoryViewer(context).findVariantById(args.variant_id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
