const SliderService = require('../../../services/slider/sliderService');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  sliderDestroy(id: String!): Boolean
`;

const resolver = {
  sliderDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.sliderDestroy);
    await new SliderService(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
