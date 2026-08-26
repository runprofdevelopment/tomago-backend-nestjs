const TermsAndConditionsService = require('../../../services/static-pages/termsAndConditionsService');

const schema = `
  findTermsAndConditions: StaticPage!
`;

const resolver = {
  findTermsAndConditions: async (root, args, context) => {
    return new TermsAndConditionsService(context).findOrCreateDefault();
  },
};

exports.schema = schema;
exports.resolver = resolver;
