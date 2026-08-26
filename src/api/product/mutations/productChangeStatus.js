const ProductStatusChanger = require('../../../services/product/productStatusChanger');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  productChangeStatus(variant_id: String!, status: ProductStatusEnum!): Boolean
`;

const resolver = {
  productChangeStatus: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.productEdit);

    await new ProductStatusChanger(context).changeStatus(args.variant_id, args.status);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;