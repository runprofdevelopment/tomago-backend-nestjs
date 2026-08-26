const AdContainerEditor = require('../../../services/ad-container/adContainerEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  bannerContainerSave(data: BannerAdInput!): BannerAd
`;

const resolver = {
  bannerContainerSave: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.settingsEdit);
    const id = 'banner_ad';
    return new AdContainerEditor(context).save(id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;