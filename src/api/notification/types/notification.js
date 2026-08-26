const schema = `
  type Notification {
    id: String
    title: Localization
    body: Localization
    imageUrl: String
    isRead: Boolean
    isNew: Boolean
    payload: NotificationPayload

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type NotificationPayload {
    key: PayloadTypeEnum
    value: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
