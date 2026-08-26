const ProductUtils = require('../../../services/product/productUtils');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  verifyBarcodeUsage(barcode: String!): JSON
`;

const resolver = {
  verifyBarcodeUsage: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.optionRead);
    const isUsed = await ProductUtils.verifyBarcodeUsage(args.barcode);

    return {
      status: isUsed, 
      messgge: isUsed ? `This barcode has already been used.` : `This barcode has not been used yet.`
    }
  }
};

exports.schema = schema;
exports.resolver = resolver;