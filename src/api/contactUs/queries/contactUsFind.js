const ContactUsViewer = require('../../../services/contactUs/contactUsViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  contactUsFind(id: String!): ContactUs
`;

const resolver = {
  contactUsFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.contactUsRead);
    return new ContactUsViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
