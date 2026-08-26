const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const VoucherEditor = require('../voucher/voucherEditor');
const { decryptData } = require('../encryptionService');

const calculatePrice = async (cart) => {
  try {
    let sub_total = 0
    let variants, variant, price;

    for (let item of cart.items) {
      variants = FirebaseHelper.mapCollection(
        await admin.firestore().collection('product-variants').get()
      );
      variant = variants.filter((variant) => variant.id === item.variantId)
      
      // Use sale_price if it's not zero, otherwise use price
      const itemPrice = (variant[0]['sale_price'] && variant[0]['sale_price'] > 0) 
        ? variant[0]['sale_price'] 
        : variant[0]['price'];
      
      sub_total += (itemPrice * item.quantity)
      price = itemPrice
    }
    let total_price = sub_total
    return { price, sub_total, total_price }
  }
  catch (error) {
    throw error;
  }
}

const calculateCheckout = async (cart) => {
  try {
    let { sub_total, total_price } = await calculatePrice(cart);
    const delivery_fees = 20;
    const taxes = 14;

    if (cart['voucherId'] !== null) {
      const key = process.env.WALLET_BALANCE_KEY;
      const voucher = await new FirestoreRepository('voucher').findDocumentById(cart['voucherId']);
      const available = await new VoucherEditor(this).checkUsageAvailability(voucher, cart['userID'], 'SALE');
      if (!available) {
        const CartVoucher = require('./cartVoucher');
        await new CartVoucher(this).setVoucherIdNull()
        throw new Error('Cannot use voucher');
      }

      const sale = parseFloat(await decryptData(voucher['voucher_amount'], key));
      total_price = total_price * ((100 + taxes) / 100);
      if (voucher['voucher_amount_type'] === 'fixed') {
        total_price = total_price - sale;
      } else {
        total_price = ((100 - sale) / 100) * total_price;
      }
    }
    total_price = total_price + delivery_fees;

    return { 
      sub_total,
      total_price,
      delivery_fees,
      taxes,
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  calculateCheckout,
  calculatePrice,
}
