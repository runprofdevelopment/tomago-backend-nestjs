const ProjectViewer = require('../../../services/project/projectViewer');

const schema = `
  projectFeaturedList: ProjectPage!
`;

const resolver = {
  projectFeaturedList: async (root, args, context) => {
    const result = await new ProjectViewer(context).listFeaturedItems();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
