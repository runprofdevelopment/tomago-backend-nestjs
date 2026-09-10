const { logger } = require('firebase-functions');
const NotificationDispatcher = require('../../src/services/notification/notificationDispatcher');

function getBeforeAfter(event) {
  const beforeSnap = event.data && event.data.before;
  const afterSnap = event.data && event.data.after;
  const before =
    beforeSnap && typeof beforeSnap.data === 'function'
      ? beforeSnap.data()
      : null;
  const after =
    afterSnap && typeof afterSnap.data === 'function' ? afterSnap.data() : null;
  return { before, after };
}

/**
 * order/{orderId} — notify customer on orderStatus transitions
 */
async function handleOrderNotification(event) {
  const { before, after } = getBeforeAfter(event);
  if (!after) return; // deleted

  const beforeStatus = before ? before.orderStatus : null;
  const afterStatus = after.orderStatus;
  if (beforeStatus === afterStatus) return;

  const orderId = event.params.orderId;
  const userId = after.userID || (after.userInfo && after.userInfo.id);

  logger.info('orderNotifications', { orderId, beforeStatus, afterStatus, userId });

  await NotificationDispatcher.dispatchOrderStatusChange({
    orderId,
    beforeStatus,
    afterStatus,
    userId,
  });
}

/**
 * returnRequest/{returnId} — notify on accept / reject / confirm
 */
async function handleReturnNotification(event) {
  const { before, after } = getBeforeAfter(event);
  if (!after) return;

  const beforeStatus = before ? before.status : null;
  const afterStatus = after.status;
  if (beforeStatus === afterStatus) return;

  const returnId = event.params.returnId;
  const userId = after.userID;

  logger.info('returnNotifications', {
    returnId,
    beforeStatus,
    afterStatus,
    userId,
  });

  await NotificationDispatcher.dispatchReturnStatusChange({
    returnId,
    beforeStatus,
    afterStatus,
    userId,
  });
}

/**
 * withdrawalRequest/{withdrawalId} — notify on status changes
 */
async function handleWithdrawalNotification(event) {
  const { before, after } = getBeforeAfter(event);
  if (!after) return;

  const beforeStatus = before ? before.status : null;
  const afterStatus = after.status;
  if (beforeStatus === afterStatus) return;

  const withdrawalId = event.params.withdrawalId;
  const userId = after.userID;

  logger.info('withdrawalNotifications', {
    withdrawalId,
    beforeStatus,
    afterStatus,
    userId,
  });

  await NotificationDispatcher.dispatchWithdrawalStatusChange({
    withdrawalId,
    beforeStatus,
    afterStatus,
    userId,
  });
}

/**
 * wallet/{walletId} — notify when searchable balance increases (top-up / credit)
 * Skips create (empty wallet) and decreases (deductions).
 */
async function handleWalletCreditNotification(event) {
  const { before, after } = getBeforeAfter(event);
  if (!after || !before) return; // skip create & delete

  const beforeSearch = Number(before.search || 0);
  const afterSearch = Number(after.search || 0);
  if (!(afterSearch > beforeSearch)) return;

  const walletId = event.params.walletId;
  // Wallet docs are keyed by user id
  const userId = after.userID || walletId;

  logger.info('walletCreditNotifications', {
    walletId,
    beforeSearch,
    afterSearch,
    userId,
  });

  await NotificationDispatcher.dispatchWalletCredit({ walletId, userId });
}

/**
 * customRequest/{requestId} — notify on replied / closed
 */
async function handleCustomRequestNotification(event) {
  const { before, after } = getBeforeAfter(event);
  if (!after) return;

  const beforeStatus = before ? before.status : null;
  const afterStatus = after.status;
  if (beforeStatus === afterStatus) return;

  const requestId = event.params.requestId;
  const customerId = after.customer_id;

  logger.info('customRequestNotifications', {
    requestId,
    beforeStatus,
    afterStatus,
    customerId,
  });

  await NotificationDispatcher.dispatchCustomRequestStatusChange({
    requestId,
    beforeStatus,
    afterStatus,
    customerId,
  });
}

module.exports = {
  handleOrderNotification,
  handleReturnNotification,
  handleWithdrawalNotification,
  handleWalletCreditNotification,
  handleCustomRequestNotification,
};
