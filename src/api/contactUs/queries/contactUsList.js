const ContactUsViewer = require('../../../services/contactUs/contactUsViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  contactUsList(filter: [ FilterInput! ], sort: [SortInput!], pagination: PaginationInput): ContactUsPage!
`;

const resolver = {
  contactUsList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.contactUsRead);
    return new ContactUsViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
