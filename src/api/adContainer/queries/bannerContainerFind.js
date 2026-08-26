const AdContainerView = require('../../../services/ad-container/adContainerView');

const schema = `
  bannerContainerFind: BannerAd!
`;

const resolver = {
  bannerContainerFind: async (root, args, context) => {
    const id = 'banner_ad';
    return new AdContainerView(context).findOrCreateDefault(id);
  },
};

exports.schema = schema;
exports.resolver = resolver;