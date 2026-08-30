const PrivacyPolicyService = require('../../../services/static-pages/privacyPolicyService');

const schema = `
  savePrivacyPolicy(data: StaticPageInput!): StaticPage
`;

const resolver = {
  savePrivacyPolicy: async (root, args, context) => {
    return new PrivacyPolicyService(context).save(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
