const IamCreator = require('../../../services/iam/iamCreator');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  iamCreate(data: IamCreateInput!): Boolean
`;

const resolver = {
  iamCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.iamCreate);

    const creator = new IamCreator(context);
    await creator.execute(args.data);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
