const FAQsService = require('../../../services/static-pages/FAQsService');

const schema = `
  findFAQs: StaticPage!
`;

const resolver = {
  findFAQs: async (root, args, context) => {
    return new FAQsService(context).findOrCreateDefault();
  },
};

exports.schema = schema;
exports.resolver = resolver;
