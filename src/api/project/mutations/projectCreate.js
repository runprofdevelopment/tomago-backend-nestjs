const ProjectCreator = require('../../../services/project/projectCreator');

const schema = `
  projectCreate(data: ProjectInput!): JSON
`;

const resolver = {
  projectCreate: async (root, args, context) => {
    return new ProjectCreator(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
