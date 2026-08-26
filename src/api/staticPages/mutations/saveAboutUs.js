const AboutUsService = require('../../../services/static-pages/aboutUsService');

const schema = `
  saveAboutUs(data: StaticPageInput!): StaticPage
`;

const resolver = {
  saveAboutUs: async (root, args, context) => {
    return new AboutUsService(context).save(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
