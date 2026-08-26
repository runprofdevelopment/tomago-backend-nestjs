const SliderService = require('../../../services/slider/sliderService');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  sliderActiveList: SliderPage!
`;

const resolver = {
  sliderActiveList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.sliderRead);
    return new SliderService(context).listActiveSliders();
  },
};

exports.schema = schema;
exports.resolver = resolver;