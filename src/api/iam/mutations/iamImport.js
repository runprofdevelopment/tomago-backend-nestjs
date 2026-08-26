const IamImporter = require('../../../services/iam/iamImporter');
const PermissionChecker = require('../../../services/iam/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  iamImport(data: IamImportInput!, importHash: String!): Boolean
`;

const resolver = {
  iamImport: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.iamImport);

    await new IamImporter(context).import(args.data, args.importHash);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
