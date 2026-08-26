const schema = `
  type VideoAd {
    id: String
    isActive: Boolean
    video: File
    boosterImageUrl: String
    targetView: TargetPageEnum
    targetId: String

    createdAt: DateTime
    createdBy: String
    updatedAt: DateTime
    updatedBy: String
  }

  input VideoAdInput {
    isActive: Boolean
    video: FileInput!
    boosterImageUrl: String!
    targetView: TargetPageEnum
    targetId: String
  }
`;

const resolver = {};
exports.schema = schema;
exports.resolver = resolver;