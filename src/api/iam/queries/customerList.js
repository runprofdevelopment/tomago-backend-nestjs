const IamViewer = require('../../../services/iam/iamViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;
const graphqlSelectRequestedAttributes = require('../../../api/shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  customerList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): UserPage!
`;

const resolver = {
  customerList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.userRead);
    return new IamViewer(context).listCustomerWithPagination({
      ...args,
      requestedAttributes: graphqlSelectRequestedAttributes(info, 'rows'),
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;