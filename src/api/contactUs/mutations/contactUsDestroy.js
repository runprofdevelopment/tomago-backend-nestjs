const ContactUsRemover = require('../../../services/contactUs/contactUsRemover');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  contactUsDestroy(id: String!): Boolean
`;

const resolver = {
  contactUsDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.contactUsDestroy);
    await new ContactUsRemover(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;