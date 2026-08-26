const ProductEditor = require('../../../services/product/productEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  productVariantUpdate(variant_id: String!, data: ProductVariantInput!): JSON
`;

const resolver = {
  productVariantUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.productEdit);
    return new ProductEditor(context).update(
      args.variant_id,
      args.data
    );
  },
};

exports.schema = schema;
exports.resolver = resolver;