const FirebaseHelper = require('../../database/utils/firebaseHelper');
const WalletTopUp = require('./walletTopUp');


exports.handleWalletPaymentWebhook = async (payload) => {
  try {
    const merchantOrderId = payload.merchantOrderId || '';

    const walletId = merchantOrderId.split('-')[0];
    const amountPaid = parseFloat(payload.amount);

    console.log({ walletId, amountPaid });
    
    const currentUser = await FirebaseHelper.findDocument('user', walletId);
    const context = { currentUser, language: 'en' };

    await new WalletTopUp(context).addBalanceCard({
      id: walletId,
      recharged_balance: amountPaid,
    });
  } catch (error) {
    throw error;
  }
}