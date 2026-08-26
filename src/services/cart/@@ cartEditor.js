const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ErrorHandler = require('../../errors/errorHandler');
const InventoryViewer = require('../inventory/inventoryViewer')
const CartBuilder = require('./cartBuilder');
const Cart = require('../../database/models/cart');

module.exports = class CartEditor {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Cart();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async addItemToCart(data, Batch) {
    try {
      let alreadyInCart = false
      let cart = await this.repository.findDocumentById(this.currentUser.id)
      if (cart === null) {
        return await new CartBuilder(this).create(data);
      }
      const addItem = data['items'][0]
      if (addItem.quantity <= 0) {
        throw new Error('Quantity must be more than 0')
      }
      let updatedItems = { items: [] }
      let quantity_errors = ''
      const InvViewer = new InventoryViewer(this)

      for (let item of cart['items']) {
        if (item.productId === addItem.productId && item.variantId === addItem.variantId) {
          item.quantity += addItem.quantity
          alreadyInCart = true
        }
        if (item.quantity > 0) {
          let available = await InvViewer.available(item.variantId)
          if (available >= item.quantity) {
            updatedItems['items'].push(item)
          } else {
            quantity_errors = `Product with Id: ${item.productId} & VariantId: ${item.variantId} stock: ${available} \n`
          }
        }
      }
      if (!alreadyInCart) {
        let available = await InvViewer.available(addItem.variantId)
        if (available >= addItem.quantity) updatedItems['items'].push(addItem)
        else quantity_errors = `Product with Id: ${addItem.productId} & VariantId: ${addItem.variantId} stock: ${available} \n`
      }
      if (quantity_errors !== '') {
        // 'stockIsNotEnough'
        throw new ErrorHandler({ errorCode: 'OUT_OF_STOCK', message: quantity_errors });
      }
      updatedItems['totalQty'] = this.updateTotalQty(updatedItems)
      const batch = Batch || await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(cart.id, updatedItems, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      if (!Batch) {
        await FirebaseHelper.commitBatch(batch);
      }
      return await this.repository.findDocumentById(this.currentUser.id);
    } catch (error) {
      throw error;
    }
  }

  async emptyCart(Batch) {
    try {
      if (Batch) {
        await this.repository.updateDocument(this.currentUser.id, { items: [], totalQty: 0 }, {
          batch: Batch,
          currentUser: this.currentUser,
          language: this.language,
        });
        return true
      }
      await admin.firestore().collection('cart').doc(this.currentUser.id).update({
        items: [],
        totalQty: 0
      })
      return true
    }
    catch (error) {
      throw error;
    }
  }

  static async emptyShoppingCart(userId, Batch) {
    try {
      const emptyCart = new Cart().cast({ id: userId, userID: userId });
      // delete emptyCart.id;
      // delete emptyCart.userId;
      // await admin.firestore().collection('cart').doc(userId).update(emptyCart);

      const batch = Batch || await FirebaseHelper.createBatch();
      const docRef = admin.firestore().doc(`cart/${userId}`);
      batch.update(docRef, { ...emptyCart, updatedAt: new Date() });
      if (!Batch) await FirebaseHelper.commitBatch(batch);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async cartRemoveItem(data) {
    try {
      const cart = await this.repository.findDocumentById(this.currentUser.id)
      if (cart === null) {
        return new Error('Cart not found');
      }
      let updatedItems = cart['items'].filter((item) => {
        if (!(item.productId === data['item'][0].productId && item.variantId === data['item'][0].variantId)) {
          return item
        }
      });
      updatedItems = { items: updatedItems }
      updatedItems['totalQty'] = this.updateTotalQty(updatedItems)
      if (updatedItems['totalQty'] === 0) {
        return await this.emptyCart()
      }
      else {
        const batch = await FirebaseHelper.createBatch();
        const record = await this.repository.updateDocument(cart.id, updatedItems, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
        await FirebaseHelper.commitBatch(batch);
        return true
      }
    } catch (error) {
      throw error;
    }
  }

  async editCartQuantities(data) {
    try {
      const cart = await this.repository.findDocumentById(this.currentUser.id)
      if (cart === null) {
        return new Error('Cart not found')
      }
      const InvViewer = new InventoryViewer(this)
      const updateItem = data['items'][0]
      if (updateItem.quantity <= 0) {
        throw new Error('quantity must be greater than 0')
      }
      const available = await InvViewer.available(updateItem.variantId)
      if (updateItem.quantity > available) {
        const error_message = `Product with Id: ${updateItem.productId} & VariantId: ${updateItem.variantId} stock: ${available}`;
        throw new ErrorHandler({ errorCode: 'OUT_OF_STOCK', message: error_message });
        // throw new Error(error_message);
      }
      cart.items.forEach(item => {
        if (item.productId === updateItem.productId && item.variantId === updateItem.variantId) {
          item.quantity = data['items'][0].quantity
        }
      });
      cart['totalQty'] = this.updateTotalQty(cart)
      if (cart['totalQty'] === 0) {
        return await this.emptyCart()
      }
      else {
        const batch = await FirebaseHelper.createBatch();
        const record = await this.repository.updateDocument(cart.id, cart, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
        await FirebaseHelper.commitBatch(batch);
        return await this.repository.findDocumentById(record.id);
      }

    }
    catch (error) {
      throw error;
    }
  }

  async moveToWishlist(data) {
    try {
      const batch = await FirebaseHelper.createBatch();

      const cart = await this.repository.findDocumentById(this.currentUser.id)
      const variantId = [data['item'][0]['variantId']]
      const fields = [{
        fieldName: 'wishlist',
        fieldValues: variantId
      }]
      let updatedItems = cart['items'].filter((item) => {
        if (!(item.productId === data['item'][0].productId && item.variantId === data['item'][0].variantId)) {
          return item
        }
      });
      updatedItems = { items: updatedItems }
      updatedItems['totalQty'] = this.updateTotalQty(updatedItems)
      if (updatedItems['totalQty'] === 0) {
        return await this.emptyCart()
      }
      else {
        const record = await this.repository.updateDocument(cart.id, updatedItems, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
      }
      await FirebaseHelper.appendItemsToArrayField('user', this.currentUser.id, fields, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      return true
    }
    catch (error) {
      throw error;
    }
  }

  updateTotalQty(cart) {
    let totalQty = 0
    cart['items'].forEach(item => {
      totalQty += item.quantity
    })
    return totalQty
  }
}