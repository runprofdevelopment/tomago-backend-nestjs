const ProjectViewer = require('../../../services/project/projectViewer');

const schema = `
  projectActiveList: ProjectPage!
`;

const resolver = {
  projectActiveList: async (root, args, context) => {
    const result = await new ProjectViewer(context).listActiveItems();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
