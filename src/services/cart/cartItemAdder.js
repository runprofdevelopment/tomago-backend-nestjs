const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ErrorHandler = require('../../errors/errorHandler');
const InventoryViewer = require('../inventory/inventoryViewer');
const CartBuilder = require('./cartBuilder');
const CartUtils = require('./cartUtils');
const Cart = require('../../database/models/cart');

module.exports = class CartItemAdder {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Cart();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(data, Batch) {
    try {
      data = await this._preSave(data);

      const batch = Batch || await FirebaseHelper.createBatch();
      await this.repository.updateDocument(data.id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      if (!Batch) await FirebaseHelper.commitBatch(batch);

      // return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  async _preSave(newItem) {
    const cartId = this?.currentUser?.id;
    const variantId = newItem?.variantId;
    const quantity = newItem?.quantity;

    if (!variantId) throw new Error('variantId are required');
    if (quantity <= 0) throw new Error('Quantity must be more than 0');

    let cart = await this.repository.findDocumentById(cartId);
    if (!cart) cart = await CartBuilder.initCart(this.context);

    // if (!cart) {
    //   await this._checkAvailability(variantId, quantity);
    //   return await CartBuilder.initCart(this.context, {
    //     items: [newItem],
    //     totalQty: quantity,
    //   });
    // }

    let totalItemQty = quantity;

    let cartItemIndex = cart.items.findIndex((item) => item.variantId === variantId);
    if (cartItemIndex !== -1) {
      cart.items[cartItemIndex].quantity += quantity;
      totalItemQty = cart.items[cartItemIndex].quantity;
    } else {
      const cart_length = cart.items.push({ variantId, quantity });
      cartItemIndex = cart_length - 1;
    }

    const variantItem = await this._checkAvailability(variantId, totalItemQty);

    cart.items[cartItemIndex]['productId'] = variantItem.product_id || null;

    return {
      id: cart.id,
      items: cart.items,
      totalQty: CartUtils.calculateTotalQty(cart.items),
    }
  }

  async _checkAvailability(variantId, quantity) {
    const variantItem = await new InventoryViewer(this.context).findVariantById(variantId);
    if (!variantItem) throw new Error(`Cannot find variant information (VariantID: "${variantId}" may be invalid)`);

    const inventory_quantity = variantItem['inventory_quantity'] || 0;
    const max_order_qty = variantItem['max_order_qty'] || 0;

    // Prevent the user from ordering quantity more than the max order quantity 
    if (max_order_qty > 0 && quantity > max_order_qty) {
      throw new ErrorHandler({ 
        errorCode: 'MAX_QTY_EXCEEDED', 
        message: `The maximum order quantity has been exceeded.` 
      });
    }

    // Prevent the user from ordering quantity more than the inventory quantity
    if (quantity > inventory_quantity) {
      throw new ErrorHandler({ 
        errorCode: 'OUT_OF_STOCK', 
        message: `Cannot add more than ${inventory_quantity} items to cart. Please adjust the quantity.` 
      });
    }

    return variantItem;
  }
}