const EncryptionService = require('../encryptionService')

module.exports = {
  async encryptAllBalances(wallet) {
    const key = process.env.WALLET_BALANCE_KEY
    // Graceful fallback if no key is configured
    if (!key) {
      wallet['recharged_balance'] = Number(wallet['recharged_balance'] || 0)
      wallet['voucher_balance'] = Number(wallet['voucher_balance'] || 0)
      wallet['balance'] = Number(wallet['balance'] || 0)
      return
    }
    wallet['recharged_balance'] = await EncryptionService.encryptData(wallet['recharged_balance'], key)
    wallet['voucher_balance'] = await EncryptionService.encryptData(wallet['voucher_balance'], key)
    wallet['balance'] = await EncryptionService.encryptData(wallet['balance'], key)
  },

  async decryptAllBalances(wallet) {
    const key = process.env.WALLET_BALANCE_KEY
    // Graceful fallback if no key is configured
    if (!key) {
      wallet['balance'] = Number(wallet['balance'] || 0)
      wallet['recharged_balance'] = Number(wallet['recharged_balance'] || 0)
      wallet['voucher_balance'] = Number(wallet['voucher_balance'] || 0)
      return
    }
    wallet['balance'] = parseFloat(await EncryptionService.decryptData(wallet['balance'], key))
    wallet['recharged_balance'] = parseFloat(await EncryptionService.decryptData(wallet['recharged_balance'], key))
    wallet['voucher_balance'] = parseFloat(await EncryptionService.decryptData(wallet['voucher_balance'], key))
  }
}
