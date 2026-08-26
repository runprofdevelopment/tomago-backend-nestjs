const AdContainerView = require('../../../services/ad-container/adContainerView');

const schema = `
  videoContainerFind: VideoAd!
`;

const resolver = {
  videoContainerFind: async (root, args, context) => {
    const id = 'video_ad';
    return new AdContainerView(context).findOrCreateDefault(id);
  },
};

exports.schema = schema;
exports.resolver = resolver;