const SliderService = require('../../../services/slider/sliderService');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  sliderCreate(data: SliderInput!): JSON
`;

const resolver = {
  sliderCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.sliderCreate);
    return new SliderService(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
