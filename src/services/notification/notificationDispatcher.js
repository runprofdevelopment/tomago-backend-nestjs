const admin = require('firebase-admin');
const { logger } = require('firebase-functions');
const NotificationSender = require('./notificationSender');
const NotificationTemplates = require('./notificationTemplates');

const SYSTEM_CONTEXT = {
  currentUser: { id: 'system', accountType: 'system' },
  language: 'en',
};

module.exports = class NotificationDispatcher {
  /**
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async isOrderUpdatesEnabled(userId) {
    if (!userId) return false;
    try {
      const snap = await admin
        .firestore()
        .collection('customerSettings')
        .doc(userId)
        .get();
      if (!snap.exists) return true; // default matches CustomerSettingsService
      const settings = snap.data() || {};
      return settings.orderUpdatesEnabled !== false;
    } catch (error) {
      logger.warn('Failed to read customerSettings; defaulting to enabled', {
        userId,
        error: error.message,
      });
      return true;
    }
  }

  /**
   * @param {string[]} recipientIds
   * @param {object|null} notification
   */
  static async send(recipientIds, notification) {
    if (!notification) return;
    const ids = (recipientIds || []).filter(Boolean);
    if (!ids.length) {
      logger.warn('NotificationDispatcher: no recipients', {
        payload: notification.payload,
      });
      return;
    }

    try {
      const sender = new NotificationSender(SYSTEM_CONTEXT);
      await sender.sendNotificationToRecipients(ids, notification);
      logger.info('NotificationDispatcher: sent', {
        recipients: ids,
        payload: notification.payload,
      });
    } catch (error) {
      // Soft-fail: avoid Cloud Function retries that would duplicate in-app notifications
      logger.error('NotificationDispatcher: send failed', {
        recipients: ids,
        payload: notification.payload,
        error: error.message,
      });
    }
  }

  static async dispatchOrderStatusChange({
    orderId,
    beforeStatus,
    afterStatus,
    userId,
  }) {
    if (!afterStatus || beforeStatus === afterStatus) return;

    const enabled = await this.isOrderUpdatesEnabled(userId);
    if (!enabled) {
      logger.info('Order updates disabled; skipping notification', {
        orderId,
        userId,
      });
      return;
    }

    const notification = NotificationTemplates.forOrderStatus({
      orderId,
      beforeStatus,
      afterStatus,
    });
    await this.send([userId], notification);
  }

  static async dispatchReturnStatusChange({
    returnId,
    beforeStatus,
    afterStatus,
    userId,
  }) {
    if (!afterStatus || beforeStatus === afterStatus) return;
    // Notify on accept / reject / confirm (and legacy "returned")
    if (!['accepted', 'rejected', 'confirmed', 'returned'].includes(afterStatus)) {
      return;
    }

    const enabled = await this.isOrderUpdatesEnabled(userId);
    if (!enabled) {
      logger.info('Order updates disabled; skipping return notification', {
        returnId,
        userId,
      });
      return;
    }

    const notification = NotificationTemplates.forReturnStatus({
      returnId,
      afterStatus,
    });
    await this.send([userId], notification);
  }

  static async dispatchWithdrawalStatusChange({
    withdrawalId,
    beforeStatus,
    afterStatus,
    userId,
  }) {
    if (!afterStatus || beforeStatus === afterStatus) return;
    if (!['accepted', 'approved', 'rejected', 'confirmed'].includes(afterStatus)) {
      return;
    }

    const notification = NotificationTemplates.forWithdrawalStatus({
      withdrawalId,
      afterStatus,
    });
    await this.send([userId], notification);
  }

  static async dispatchWalletCredit({ walletId, userId }) {
    const recipientId = userId || walletId;
    const notification = NotificationTemplates.forWalletCredit({
      walletId: walletId || recipientId,
    });
    await this.send([recipientId], notification);
  }

  static async dispatchCustomRequestStatusChange({
    requestId,
    beforeStatus,
    afterStatus,
    customerId,
  }) {
    if (!afterStatus || beforeStatus === afterStatus) return;
    if (!['replied', 'closed'].includes(afterStatus)) return;

    const notification = NotificationTemplates.forCustomRequestStatus({
      requestId,
      afterStatus,
    });
    await this.send([customerId], notification);
  }
};
