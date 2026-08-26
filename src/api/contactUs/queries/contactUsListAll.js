const ContactUsViewer = require('../../../services/contactUs/contactUsViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  contactUsListAll: ContactUsPage!
`;

const resolver = {
  contactUsListAll: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.contactUsRead);
    const result = await new ContactUsViewer(context).listAll();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
