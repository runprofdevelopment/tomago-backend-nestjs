const SliderService = require('../../../services/slider/sliderService');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  sliderList: SliderPage!
`;

const resolver = {
  sliderList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.sliderRead);
    return new SliderService(context).list();
  },
};

exports.schema = schema;
exports.resolver = resolver;