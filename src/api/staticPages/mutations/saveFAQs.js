const FAQsService = require('../../../services/static-pages/FAQsService');

const schema = `
  saveFAQs(data: StaticPageInput!): StaticPage
`;

const resolver = {
  saveFAQs: async (root, args, context) => {
    return new FAQsService(context).save(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
