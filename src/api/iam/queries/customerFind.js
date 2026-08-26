const IamViewer = require('../../../services/iam/iamViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;
const graphqlSelectRequestedAttributes = require('../../../api/shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  customerFind(id: String!): User!
`;

const resolver = {
  customerFind: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.userRead);
    return new IamViewer(context).findById(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;