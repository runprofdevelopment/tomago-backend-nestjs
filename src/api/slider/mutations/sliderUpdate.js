const SliderService = require('../../../services/slider/sliderService');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  sliderUpdate(id: String!, data: SliderInput!): JSON
`;

const resolver = {
  sliderUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.sliderEdit);
    return new SliderService(context).update(
      args.id,
      args.data
    );
  },
};

exports.schema = schema;
exports.resolver = resolver;
