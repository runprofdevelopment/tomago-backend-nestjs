const ProjectViewer = require('../../../services/project/projectViewer');

const schema = `
  projectFind(id: String!): Project
`;

const resolver = {
  projectFind: async (root, args, context) => {
    return new ProjectViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
