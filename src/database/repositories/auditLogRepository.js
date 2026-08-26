const admin = require('firebase-admin');
const FirebaseHelper = require('../utils/firebaseHelper');
const FirebaseQuery = require('../utils/firebaseQuery');

module.exports = class AuditLogRepository {
  static get CREATE() {
    return 'create';
  }
  static get UPDATE() {
    return 'update';
  }
  static get DELETE() {
    return 'delete';
  }

  static async log({ entityName, entityId, action, values }, options) {
    const currentUser = options && options.currentUser;

    const log = {
      id: FirebaseHelper.newId(),
      entityName,
      entityId,
      action,
      values,
      timestamp: new Date(),
      createdById: (currentUser && currentUser.id) || null,
      createdByEmail: (currentUser && currentUser.email) || null,
    };

    await FirebaseHelper.executeOrAddToBatch(
      'set',
      admin.firestore().doc(`auditLogs/${log.id}`),
      log,
      options,
    );

    return log;
  }

  static async findAndCountAll({
    filter,
    limit = 0,
    offset = 0,
    orderBy = null,
  }) {
    const query = FirebaseQuery.forList({
      limit,
      offset,
      orderBy: orderBy || 'createdAt_DESC',
    });

    if (filter) {
      if (filter.timestampRange) {
        query.appendRange(
          'timestamp',
          filter.timestampRange,
        );
      }

      if (filter.action) {
        query.appendEqual('action', filter.action);
      }

      if (filter.entityId) {
        query.appendEqual('entityId', filter.entityId);
      }

      if (filter.createdByEmail) {
        query.appendIlike(
          'createdByEmail',
          filter.createdByEmail,
        );
      }

      if (filter.entityNames && filter.entityNames.length) {
        query.appendIn('entityName', filter.entityNames);
      }
    }

    const collection = await admin
      .firestore()
      .collection(`auditLogs`)
      .get();

    const all = FirebaseHelper.mapCollection(collection);
    const rows = query.rows(all);
    const count = query.count(all);

    return { rows, count };
  }
};
