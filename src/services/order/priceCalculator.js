const FirebaseHelper = require('../../database/utils/firebaseHelper');
const VoucherEditor = require('../voucher/voucherEditor');
const { decryptData } = require('../encryptionService');
const Product =
  new (require('../../database/models/product'))();
const Variant =
  new (require('../../database/models/product-variant'))();

const calculateOrderPricing = async ({
  cart,
  cartId,
  paymentMethod,
}) => {
  try {
    if (!cartId) throw new Error('cartId is required');
    const shoppingCart =
      cart ||
      (await FirebaseHelper.findDocument('cart', cartId));

    if (!shoppingCart) return;
    const user = await FirebaseHelper.findDocument(
      'user',
      shoppingCart.userID,
      
    );
    const settings = await FirebaseHelper.findDocument('settings', 'default');
    const vatPercentage = settings?.vat > 1 ? settings?.vat / 100 : settings?.vat ||0;
    const cashOnDeliveryFees = paymentMethod === 'cod' ? (settings?.cashOnDeliveryFees || 0) : 0;
    console.log(
      'setting free',
      settings?.freeShippingAmount,
    );

    let sub_total = 0,
      shippingCost = 0;
    for (const item of shoppingCart.items) {
      const product = await FirebaseHelper.findDocument(Product.collectionName, item.productId);
      const variant = await FirebaseHelper.findDocument(Variant.collectionName, item.variantId);
      
      // Get the price which is already VAT-inclusive
      // Use sale_price if it's not zero, otherwise use current_price or price
      const price = (variant?.sale_price && variant.sale_price > 0) 
        ? variant.sale_price 
        : (variant?.current_price || variant?.price || 0);
      const quantity = item?.quantity || 0;
      
      // Add to subtotal (price is already VAT-inclusive)
      sub_total += price * quantity;

      if (settings?.freeShippingAmount) {
        if (sub_total >= settings?.freeShippingAmount) {
          shippingCost = 0;
        } else {
          shippingCost = settings?.shippingCost || 0;
        }
      }
    }

    // Calculate VAT as exactly 14% of the subtotal
    const vat_amount = sub_total * 0.14;

    let discount = 0;
    if (shoppingCart.voucherId) {
      const price = sub_total;
      discount = await calculateDiscount(
        shoppingCart.voucherId,
        price,
        user,
      );
    }

    const total_price = sub_total + shippingCost + cashOnDeliveryFees - discount;

    return {
      currency: 'EGP',
      vatPercentage: 0.14, // Always return 14% for display
      cashOnDeliveryFees,
      totalDiscount: discount || 0,
      shippingCost: shippingCost || 0,
      vatAmount: vat_amount || 0,
      subTotalPrice: sub_total || 0,
      totalPrice: total_price,
    };
  } catch (error) {
    throw error;
  }
};

const calculateDiscount = async (
  voucherId,
  price,
  currentUser,
) => {
  try {
    if (!voucherId) return 0;

    const voucher = await FirebaseHelper.findDocument(
      'voucher',
      voucherId,
    );
    if (!voucher) return 0;

    let discount = 0;
    const key = process.env.WALLET_BALANCE_KEY;
    const available = await new VoucherEditor({
      currentUser,
    }).checkUsageAvailability(
      voucher,
      currentUser.id,
      'SALE',
    );

    if (!available) {
      const CartVoucher = require('../cart/cartVoucher');
      await new CartVoucher({
        currentUser,
      }).setVoucherIdNull();
      throw new Error('Cannot use voucher');
    }

    const sale = parseFloat(
      await decryptData(voucher['voucher_amount'], key),
    );

    // price = price * ((100 + taxes) / 100);
    if (voucher['voucher_amount_type'] === 'fixed') {
      price = price - sale;
    } else {
      price = ((100 - sale) / 100) * price;
    }

    if (voucher.voucher_amount_type === 'percent') {
      discount = price * (sale / 100);
    } else if (voucher.voucher_amount_type === 'fixed') {
      discount = sale;
    }

    console.log("firstName", discount);
    return discount;
  } catch (error) {
    throw error;
  }
};

// const calculateCheckout = async (cart) => {
//   try {
//     let { sub_total, total_price } = await calculatePrice(cart);
//     const delivery_fees = 20
//     const taxes = 14

//     if (cart['voucherId'] !== null) {
//       const key = process.env.WALLET_BALANCE_KEY
//       const voucher = await new FirestoreRepository('voucher').findDocumentById(cart['voucherId']);
//       const available = await new VoucherEditor(this).checkUsageAvailability(voucher, cart['userID'], 'SALE')
//       if (!available) {
//         const CartVoucher = require('./cartVoucher');
//         await new CartVoucher(this).setVoucherIdNull()
//         throw new Error('Cannot use voucher');
//       }

//       const sale = parseFloat(await decryptData(voucher['voucher_amount'], key))
//       total_price = total_price * ((100 + taxes) / 100);
//       if (voucher['voucher_amount_type'] === 'fixed') {
//         total_price = total_price - sale;
//       }
//       else {
//         total_price = ((100 - sale) / 100) * total_price
//       }
//     }
//     total_price = total_price + delivery_fees;

//     return { sub_total, total_price, delivery_fees, taxes }
//   }
//   catch (e) {
//     throw e
//   }
// }

module.exports = {
  calculateOrderPricing,
  // calculateCheckout,
};
