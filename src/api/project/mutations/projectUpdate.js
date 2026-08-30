const ProjectEditor = require('../../../services/project/projectEditor');

const schema = `
  projectUpdate(id: String!, data: ProjectInput!): JSON
`;

const resolver = {
  projectUpdate: async (root, args, context) => {
    return new ProjectEditor(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
