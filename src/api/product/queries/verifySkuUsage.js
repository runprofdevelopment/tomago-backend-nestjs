const ProductUtils = require('../../../services/product/productUtils');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  verifySkuUsage(sku: String!): JSON
`;

const resolver = {
  verifySkuUsage: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.optionRead);
    const isUsed = await ProductUtils.verifySkuUsage(args.sku);

    return {
      status: isUsed, 
      messgge: isUsed ? `This SKU has already been used.` : `This SKU has not been used yet.`
    }
  }
};

exports.schema = schema;
exports.resolver = resolver;