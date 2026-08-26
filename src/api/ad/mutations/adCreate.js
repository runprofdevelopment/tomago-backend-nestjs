const AdCreator = require('../../../services/ad/adCreator');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  adCreate(data: AdInput!): Ad
`;

const resolver = {
  adCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.adCreate);
    return new AdCreator(context).execute(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
