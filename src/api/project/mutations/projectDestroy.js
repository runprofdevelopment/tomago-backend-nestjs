const ProjectRemover = require('../../../services/project/projectRemover');

const schema = `
  projectDestroy(id: String!): Boolean
`;

const resolver = {
  projectDestroy: async (root, args, context) => {
    await new ProjectRemover(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
