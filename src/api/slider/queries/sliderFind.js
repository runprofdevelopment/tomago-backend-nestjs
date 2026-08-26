const SliderService = require('../../../services/slider/sliderService');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  sliderFind(id: String!): Slider
`;

const resolver = {
  sliderFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.sliderRead);
    return new SliderService(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
