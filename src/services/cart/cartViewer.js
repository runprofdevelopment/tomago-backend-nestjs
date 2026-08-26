const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const CartBuilder = require('./cartBuilder');
const Cart = require('../../database/models/cart');
const { calculatePrice, calculateCheckout } = require('./priceCalculator');
const { calculateOrderPricing } = require('../order/priceCalculator');

module.exports = class CartViewer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Cart();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
    this.quantity_errors = '';
  }

  async findMyCart() {
    try {
      let cart = await this.repository.findDocumentById(this.currentUser.id);
      if (!cart) cart = await CartBuilder.initCart(this.context);
      // if (!cart) throw new Error("Cart doesn't exist")

      let viewCart = {
        ...cart,
        id: cart.id,
        userID: cart.userID,
        items: [],
        // Always recompute totalQty from items to avoid stale values
        totalQty: require('./cartUtils').calculateTotalQty(cart.items || []),
        quantity_errors: this.quantity_errors
      }

      viewCart['items'] = await Promise.all(
        cart['items'].map((item) => this._findItemDetails(item))
      )

      if (this.quantity_errors !== '') {
        const batch = await FirebaseHelper.createBatch();

        viewCart['quantity_errors'] = this.quantity_errors
        let totalQty = 0;
        viewCart['items'].forEach(item => {
          totalQty += item.quantity
        })
        viewCart['totalQty'] = totalQty

        const newData = {
          items: viewCart['items'].map(item => {
            return {
              productId: item.product.id,
              variantId: item.variant.id,
              quantity: item.quantity,
            }
          }),
          totalQty
        }
        await this.repository.updateDocument(cart.id, newData, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
        await FirebaseHelper.commitBatch(batch);
        cart = await this.repository.findDocumentById(this.currentUser.id)
      }
      // Ensure totalQty is consistent after item detail mapping
      viewCart['totalQty'] = require('./cartUtils').calculateTotalQty((viewCart['items'] || []).map(i => ({ quantity: i.quantity })));

      // const { sub_total } = await calculatePrice(cart);
      const pricing = await calculatePrice(cart);
      viewCart['sub_total'] = pricing.sub_total
      viewCart['total_price'] = pricing.total_price

      return viewCart;
    } catch (error) {
      throw error;
    }
  }

  async viewCartCheckout(isCashOnDelivery) {
    try {
      let cart = await this.repository.findDocumentById(this.currentUser.id);
      if (cart === null) {
        throw new Error("Cart doesn't exist");
      }
      let viewCart = {
        ...cart,
        id: cart.id,
        userID: cart.userID,
        items: [],
        totalQty: cart.totalQty,
        quantity_errors: this.quantity_errors
      }

      viewCart['items'] = await Promise.all(
        cart['items'].map((item) => this._findItemDetails(item))
      )

      if (this.quantity_errors !== '') {
        const batch = await FirebaseHelper.createBatch();

        viewCart['quantity_errors'] = this.quantity_errors
        let totalQty = 0;
        viewCart['items'].forEach(item => {
          totalQty += item.quantity
        })
        viewCart['totalQty'] = totalQty

        const newData = {
          items: viewCart['items'].map(item => {
            return {
              productId: item.product.id,
              variantId: item.variant.id,
              quantity: item.quantity
            }
          }),
          totalQty
        }
        await this.repository.updateDocument(cart.id, newData, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
        await FirebaseHelper.commitBatch(batch);
        cart = await this.repository.findDocumentById(this.currentUser.id)
      }
      // const { sub_total, total_price, delivery_fees, taxes } = await calculateCheckout(cart)
      // viewCart['sub_total'] = sub_total
      // viewCart['total_price'] = total_price
      // viewCart['taxes'] = taxes
      // viewCart['delivery_fees'] = delivery_fees

      const pricing = await calculateOrderPricing({
        cartId: this.currentUser.id, 
        cart: cart,
        paymentMethod: isCashOnDelivery ? 'cod' : undefined,
      });

      return {
        ...viewCart,
        ...pricing,
      };
    } catch (error) {
      throw error;
    }
  }

  async _findItemDetails(item) {
    const current_item = await this.getProductInfo(item, item.quantity);

    if (current_item?.variant?.inventory_quantity < current_item.quantity) {
      this.quantity_errors = this.quantity_errors + `Product with Id: ${current_item.product.id} & VariantId: ${current_item.variant.id} stock: ${current_item.variant.inventory_quantity} \n`
      current_item['quantity'] = current_item.variant.inventory_quantity
    }
    return current_item;
  }

  async getProductInfo(record, quantity) {
    try {
      console.log('🔄 CartViewer.getProductInfo: Fetching product info for:', {
        variantId: record.variantId,
        productId: record.productId,
        quantity
      });

      const variantDoc = await admin.firestore().collection('product-variants').doc(record.variantId).get();
      if (!variantDoc.exists) {
        console.error('❌ CartViewer.getProductInfo: Variant not found:', record.variantId);
        throw new Error(`Product variant with ID '${record.variantId}' not found. This item may have been removed from the catalog.`);
      }

      const variant = FirebaseHelper.mapDocument(variantDoc);
      console.log('✅ CartViewer.getProductInfo: Variant found:', {
        variantId: variant.id,
        productId: variant.product_id
      });
      
      const productId = record.productId || variant?.product_id || '';
      if (!productId) {
        console.error('❌ CartViewer.getProductInfo: Product ID not found for variant:', record.variantId);
        throw new Error(`Product ID not found for variant '${record.variantId}'. Data integrity issue.`);
      }

      const productDoc = await admin.firestore().collection('product').doc(productId).get();
      if (!productDoc.exists) {
        console.error('❌ CartViewer.getProductInfo: Product not found:', productId);
        throw new Error(`Product with ID '${productId}' not found. This item may have been removed from the catalog.`);
      }

      const product = FirebaseHelper.mapDocument(productDoc);
      console.log('✅ CartViewer.getProductInfo: Product found:', {
        productId: product.id,
        title: product.title?.en || 'No title'
      });

      const current_product = {
        product,
        variant,
        quantity
      }
      return current_product;
    } catch (e) {
      console.error('❌ CartViewer.getProductInfo: Error occurred:', {
        error: e.message,
        record,
        stack: e.stack
      });
      
      // Re-throw with more specific error message
      if (e.message.includes('not found') || e.message.includes('integrity')) {
        throw e; // Use the specific error message we created
      }
      
      throw new Error(`Cannot find product information for variant '${record.variantId}': ${e.message}`);
    }
  }

  async fetchCartItemCount() {
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.id) {
      console.log('CartViewer.fetchCartItemCount: No authenticated user, returning 0');
      return 0;
    }

    console.log('CartViewer.fetchCartItemCount: Fetching cart count for user:', this.currentUser.id);
    const cart = await this.repository.findDocumentById(this.currentUser.id);
    const items = (cart && Array.isArray(cart.items)) ? cart.items : [];
    const count = require('./cartUtils').calculateTotalQty(items);
    console.log('CartViewer.fetchCartItemCount: Calculated count:', count);
    return count;
  }
}