const AboutUsService = require('../../../services/static-pages/aboutUsService');

const schema = `
  findAboutUs: StaticPage!
`;

const resolver = {
  findAboutUs: async (root, args, context) => {
    return new AboutUsService(context).findOrCreateDefault();
  },
};

exports.schema = schema;
exports.resolver = resolver;
