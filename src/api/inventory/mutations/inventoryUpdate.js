const InventoryEditor = require('../../../services/inventory/inventoryEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  inventoryUpdate(variant_id: String!, data: InventoryInput!): Boolean
`;

const resolver = {
  inventoryUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.productEdit);
    await new InventoryEditor(context).updateQuantityOrPrice(args.variant_id, args.data);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;