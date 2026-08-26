const IamViewer = require('../../../services/iam/iamViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;
const graphqlSelectRequestedAttributes = require('../../../api/shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  adminList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): UserPage!
`;

const resolver = {
  adminList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.userRead);
    return new IamViewer(context).listAdminsWithPagination({
      ...args,
      requestedAttributes: graphqlSelectRequestedAttributes(info, 'rows'),
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;