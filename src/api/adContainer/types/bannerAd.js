const schema = `
  type BannerAd {
    id: String
    isActive: Boolean
    content: String
    textColor: String
    backgroundColor: String
    btnText: String
    targetView: TargetPageEnum
    targetId: String

    createdAt: DateTime
    createdBy: String
    updatedAt: DateTime
    updatedBy: String
  }

  input BannerAdInput {
    isActive: Boolean
    content: String!
    textColor: String!
    backgroundColor: String!
    btnText: String!
    targetView: TargetPageEnum
    targetId: String
  }
`;

const resolver = {};
exports.schema = schema;
exports.resolver = resolver;