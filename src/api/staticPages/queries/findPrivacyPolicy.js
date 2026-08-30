const PrivacyPolicyService = require('../../../services/static-pages/privacyPolicyService');

const schema = `
  findPrivacyPolicy: StaticPage!
`;

const resolver = {
  findPrivacyPolicy: async (root, args, context) => {
    return new PrivacyPolicyService(context).findOrCreateDefault();
  },
};

exports.schema = schema;
exports.resolver = resolver;
