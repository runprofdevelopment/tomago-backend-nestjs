const TermsAndConditionsService = require('../../../services/static-pages/termsAndConditionsService');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  saveTermsAndConditions(data: StaticPageInput!): StaticPage
`;

const resolver = {
  saveTermsAndConditions: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.settingsEdit);
    return new TermsAndConditionsService(context).save(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
