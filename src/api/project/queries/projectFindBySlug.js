const ProjectViewer = require('../../../services/project/projectViewer');

const schema = `
  projectFindBySlug(slug: String!): Project
`;

const resolver = {
  projectFindBySlug: async (root, args, context) => {
    return new ProjectViewer(context).findBySlug(args.slug);
  }
};

exports.schema = schema;
exports.resolver = resolver;
