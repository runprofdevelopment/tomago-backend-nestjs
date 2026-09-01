const ProjectViewer = require('../../../services/project/projectViewer');

const schema = `
  projectList(filter: [ FilterInput! ], sort: [SortInput!], pagination: PaginationInput): ProjectPage!
`;

const resolver = {
  projectList: async (root, args, context) => {
    return new ProjectViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
