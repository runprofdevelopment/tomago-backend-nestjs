const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const {
  calculateOrderPricing,
} = require('./priceCalculator');
const WalletDeduction = require('../wallet/walletDeduction');
const OrderViewer = require('./orderViewer');
const OrderTransactionService = require('../transaction/orderTransatctionService');
const VoucherEditor = require('../voucher/voucherEditor');
const WalletViewer = require('../wallet/walletViewer');
const CartClearer = require('../cart/cartClearer');
const CartViewer = require('../cart/cartViewer');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const AddressViewer = require('../customer-address/addressViewer');
const Order = require('../../database/models/order');
const {
  client,
  project,
  queue,
  location,
  serviceAccountEmail,
  baseUrl,
} = require('./google-cloud-tasks');
const InventoryService = require('../inventory/inventoryService');
const admin = require('firebase-admin');

module.exports = class OrderCreator {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Order();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  async execute(data) {
    try {
      console.log('🔄 OrderCreator.execute: Starting order creation with data:', {
        addressId: data.addressId,
        paymentMethod: data.paymentMethod,
        useWallet: data.useWallet,
        userId: this.currentUser?.id
      });

      data = await this._validate(data);
      console.log('✅ OrderCreator.execute: Validation passed');

      const paymentMethod = data.paymentMethod || null;
      const useWallet = data.useWallet || false;
      const billingInfo = data.billingInfo || null;
      data['userID'] = this.currentUser.id;
      data['userInfo'] = { ...this.currentUser };

      // Online gateway (Kashier) removed — only COD and wallet are supported
      const isPaymentGatewayMethod = [
        'credit',
        'installment',
        'bank_installment',
        'e_wallet',
      ].includes(paymentMethod);

      if (isPaymentGatewayMethod) {
        throw new Error(
          'Online payment gateway is disabled. Please use COD or wallet.',
        );
      }

      console.log('🔄 OrderCreator.execute: Fetching cart for user:', this.currentUser.id);
      const cart = await FirebaseHelper.findDocument(
        'cart',
        this.currentUser.id,
      );
      if (!cart)
        throw new Error("Cart is empty or doesn't exist!");
      if (cart.items.length === 0)
        throw new Error('Cart is empty!');

      console.log('✅ OrderCreator.execute: Cart found with', cart.items.length, 'items');
      
      // Validate cart items before processing
      console.log('🔄 OrderCreator.execute: Validating cart items...');
      await this._validateCartItems(cart);
      console.log('✅ OrderCreator.execute: Cart items validation passed');
      
      console.log('🔄 OrderCreator.execute: Processing cart items...');

      const CartViewerClass = new CartViewer(this.ctx);
      const items = await Promise.all(
        cart.items.map(async (item, index) => {
          try {
            console.log(`🔄 OrderCreator.execute: Processing item ${index + 1}/${cart.items.length}:`, {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            });
            const itemDetails = await CartViewerClass._findItemDetails(item);
            console.log(`✅ OrderCreator.execute: Item ${index + 1} processed successfully`);
            return itemDetails;
          } catch (error) {
            console.error(`❌ OrderCreator.execute: Error processing item ${index + 1}:`, {
              item,
              error: error.message,
              stack: error.stack
            });
            throw new Error(`Failed to process cart item ${index + 1}: ${error.message}`);
          }
        }),
      );

      console.log('✅ OrderCreator.execute: All cart items processed successfully');

      data['items'] = items.map((item) => {
        return {
          productId: item.product.id,
          variantId: item.variant.id,
          title: item.variant.title['en'],
          quantity: item.quantity,
          price:
            (item.variant.sale_price && item.variant.sale_price > 0) 
              ? item.variant.sale_price 
              : (item.variant.current_price || item.variant.price),
          status: isPaymentGatewayMethod ? 'pendingPayment' : 'pendingAcceptance', // Set initial item status
        };
      });

      // Calculate the totalQuantity
      const totalQuantity = data['items'].reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      // Validate stock availability before creating the order
      console.log('🔄 OrderCreator.execute: Validating stock availability...');
      const stockValidator = new InventoryService(this.ctx);
      await stockValidator.validateStockAvailability(data['items']);
      console.log('✅ OrderCreator.execute: Stock validation passed');

      const pricing = await calculateOrderPricing({
        cartId: this.currentUser.id,
        cart: cart,
        paymentMethod: paymentMethod,
      });

      let statusInOrder;

      if (!isPaymentGatewayMethod) {
        statusInOrder = 'pendingAcceptance';
      } else {
        statusInOrder = 'waitingPaymentConfirmation';
      }

      const ORDER = {
        ...data,
        ...pricing,
        orderStatus: statusInOrder,
        id: `${FirebaseHelper.newIdNumber()}`,
        totalQuantity, // Add the totalQuantity field to the order
      };

      const batch = await FirebaseHelper.createBatch();

      const response = await this.executePayment(
        {
          order: ORDER,
          paymentMethod,
          useWallet,
        },
        batch,
      );

      data = this.model.cast(response.order);
      data.paymentInfo = response.paymentInfo;
      const orderCreated =
        await this.repository.createDocument(data, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });

      if (cart?.voucherId) {
        await new VoucherEditor(
          this.ctx,
        ).updateVoucherAfterUsed(
          cart.voucherId,
          this.currentUser.id,
          batch,
        );
      }

      // Only clear cart for non-payment gateway methods (COD, wallet)
      // For payment gateway methods (credit, installment, e_wallet), cart will be cleared after payment confirmation
      if (!isPaymentGatewayMethod) {
        console.log('✅ Clearing cart for non-payment gateway method:', paymentMethod);
        const userId = this.currentUser.id;
        await CartClearer.clearUserCart(userId, batch);
      } else {
        console.log('⏳ Keeping cart for payment gateway method:', paymentMethod, '- will be cleared after payment confirmation');
      }

      // Decrement inventory right before committing the order
      const inventoryService = new InventoryService(this.ctx);
      await inventoryService.decrementOnOrderPlacement(data, batch);

      await FirebaseHelper.commitBatch(batch);

      await TimelineEventCreator.execute(
        {
          orderId: orderCreated.id,
          event_type: 'orderCreated',
          event_description:
            'Order was placed by the user.',
        },
        this.ctx,
      );

      return {
        order: await new OrderViewer(this.ctx).findById(
          orderCreated.id,
        ),
        paymentInfo: response.paymentInfo,
      };
    } catch (error) {
      console.error('❌ OrderCreator.execute: Order creation failed:', {
        error: error.message,
        stack: error.stack,
        userId: this.currentUser?.id,
        orderData: {
          addressId: data?.addressId,
          paymentMethod: data?.paymentMethod,
          useWallet: data?.useWallet
        }
      });

      // If an error occurs, attempt to roll back inventory changes
      if (data && data.items) {
        try {
          console.log('🔄 OrderCreator.execute: Rolling back inventory changes...');
          const inventoryService = new InventoryService(this.ctx);
          const rollbackBatch = await FirebaseHelper.createBatch();
          await inventoryService.incrementOnOrderCancellation(data, rollbackBatch);
          await FirebaseHelper.commitBatch(rollbackBatch);
          console.log('✅ OrderCreator.execute: Inventory rollback completed');
        } catch (rollbackError) {
          console.error('❌ OrderCreator.execute: Inventory rollback failed:', rollbackError);
        }
      }
      
      // Enhance error message for better debugging
      const enhancedError = new Error(`Order creation failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.userId = this.currentUser?.id;
      enhancedError.orderData = data;
      
      throw enhancedError;
    }
  }

  async _validate(data) {
    if (!data.addressId)
      throw new Error('addressId is required');
    if (!data.paymentMethod)
      throw new Error('paymentMethod is required');

    const customerId = this.currentUser.id;
    const address = await new AddressViewer(
      this.ctx,
    ).findById(customerId, data.addressId);
    if (!address)
      throw new Error(
        'The address was not found or has been removed. Invalid address ID.',
      );

    console.log('🔍 Order validation - Address data:', {
      phoneNumber: address.phoneNumber,
      phoneVerified: address.phoneVerified
    });
    console.log('🔍 Order validation - User data:', {
      phoneNumber: this.currentUser.phoneNumber,
      phoneVerified: this.currentUser.phoneVerified
    });

    let verifiedPhoneNumber;
    if (address.phoneNumber && address.phoneVerified) {
      verifiedPhoneNumber = address.phoneNumber;
      console.log('✅ Using address phone number:', verifiedPhoneNumber);
    } else if (
      this.currentUser.phoneNumber &&
      this.currentUser.phoneVerified
    ) {
      verifiedPhoneNumber = this.currentUser.phoneNumber;
      console.log('✅ Using user phone number:', verifiedPhoneNumber);
    }

    console.log('🔍 Final verifiedPhoneNumber:', verifiedPhoneNumber);

    if (!verifiedPhoneNumber) {
      throw new Error(
        'The phone number is not verified. Please verify your phone number before placing an order.',
      );
    }

    data['billingInfo'] = {
      addressId: address.id,
      firstName: address.first_name,
      lastName: address.last_name,
      phoneNumber: verifiedPhoneNumber,
      phoneVerified: true,
      address: address.address,
      city: address.city,
      province: address.province,
      country: address.country,
      area: address.area,
      zip: address.zip,
    };

    return data;
  }

  async _validateCartItems(cart) {
    console.log('🔄 OrderCreator._validateCartItems: Starting cart items validation');
    
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or has no items');
    }

    const invalidItems = [];
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      console.log(`🔄 OrderCreator._validateCartItems: Validating item ${i + 1}:`, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      });

      // Check required fields
      if (!item.variantId) {
        invalidItems.push(`Item ${i + 1}: Missing variant ID`);
        continue;
      }

      if (!item.quantity || item.quantity <= 0) {
        invalidItems.push(`Item ${i + 1}: Invalid quantity (${item.quantity})`);
        continue;
      }

      // Check if variant exists
      try {
        const variantDoc = await admin.firestore()
          .collection('product-variants')
          .doc(item.variantId)
          .get();
          
        if (!variantDoc.exists) {
          invalidItems.push(`Item ${i + 1}: Product variant '${item.variantId}' not found`);
          continue;
        }

        const variant = variantDoc.data();
        const productId = item.productId || variant?.product_id;
        
        if (productId) {
          const productDoc = await admin.firestore()
            .collection('product')
            .doc(productId)
            .get();
            
          if (!productDoc.exists) {
            invalidItems.push(`Item ${i + 1}: Product '${productId}' not found`);
            continue;
          }
        } else {
          invalidItems.push(`Item ${i + 1}: No product ID found for variant '${item.variantId}'`);
          continue;
        }

        console.log(`✅ OrderCreator._validateCartItems: Item ${i + 1} is valid`);
      } catch (error) {
        console.error(`❌ OrderCreator._validateCartItems: Error validating item ${i + 1}:`, error);
        invalidItems.push(`Item ${i + 1}: Validation error - ${error.message}`);
      }
    }

    if (invalidItems.length > 0) {
      const errorMessage = `Cart contains invalid items:\n${invalidItems.join('\n')}`;
      console.error('❌ OrderCreator._validateCartItems: Validation failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ OrderCreator._validateCartItems: All items are valid');
  }

  async executePayment(
    { order, paymentMethod, useWallet },
    batch,
  ) {
    let response = null;

    if (useWallet) {
      return await this.payByUseWallet(order, batch);
    }

    switch (paymentMethod) {
      case 'cod':
        response = await this.orderCashOnDelivery(order);
        break;
      case 'wallet':
        response = await this.orderFullWalletPayment(
          order,
          batch,
        );
        break;
      case 'credit':
      case 'installment':
      case 'e_wallet':
        response = await this.orderCreditPayment(
          order,
          null,
          batch,
        );
        break;
      default:
        throw new Error(
          'Please select valid payment method',
        );
    }

    return response;
  }

  async orderCashOnDelivery(order) {
    try {
      order['financialStatus'] = 'unpaid';

      return {
        order,
        paymentInfo: {
          paymentMethod: 'cod',
          financialStatus: 'unpaid',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async orderFullWalletPayment(order, batch) {
    try {
      const payment = await new WalletDeduction(
        this,
      ).payFullWithWallet(order, batch);

      if (payment === true) {
        const transactionId =
          await new OrderTransactionService(
            this,
          ).createOrderTransaction(order, batch);
        order['financialStatus'] = 'paid';
        order['transactionId'] = transactionId;
        order['paymentMethod'] = 'wallet';
      }

      return {
        order,
        paymentInfo: {
          paymentMethod: 'wallet',
          financialStatus: 'paid',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async orderCreditPayment(_order, _amount, _batch) {
    throw new Error(
      'Online payment gateway is disabled. Please use COD or wallet.',
    );
  }

  // async orderPartialPayment(order, batch) {
  //   try {
  //     // const batch = await FirebaseHelper.createBatch();
  //     const payment = await new WalletDeduction(this).partialWalletPayment(order, batch);
  //     if (payment === true) {
  //       // implement visa payment
  //       // if visa payment is successful, proceed
  //       order['financialStatus'] = 'partialPaid';
  //       order['paymentMethod'] = 'cod';
  //     }

  //     return {
  //       order,
  //       paymentInfo: {
  //         paymentMethod: 'partial',
  //         financialStatus: 'partialPaid',
  //       }
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async payByUseWallet(order, Batch) {
    try {
      const wallet = await new WalletViewer(
        this.ctx,
      ).viewWalletById(this.currentUser.id);

      const partialAmountPaid =
        wallet['balance'] < order['totalPrice']
          ? wallet['balance']
          : 0;

      const remainingAmount =
        order['totalPrice'] - partialAmountPaid;

      order['partialAmountPaid'] = partialAmountPaid;

      if (partialAmountPaid === 0) {
        return await this.orderFullWalletPayment(
          order,
          Batch,
        );
      }

      const payment = await new WalletDeduction(
        this.ctx,
      ).partialWalletPayment(order, Batch);

      if (payment === true) {
        const transactionId =
          await new OrderTransactionService(
            this,
          ).createPartialOrderTransaction(
            {
              ...order,
              paymentMethod: 'wallet',
              partialAmountPaid: partialAmountPaid,
            },
            Batch,
          );

        order['transactionIds'] =
          order.transactionIds || [];
        order.transactionIds.push(transactionId);
        order['financialStatus'] = 'partialPaid';
      }

      if (
        order.paymentMethod === 'credit' ||
        order.paymentMethod === 'installment' ||
        order.paymentMethod === 'e_wallet'
      ) {
        return await this.orderCreditPayment(
          order,
          remainingAmount,
          Batch,
        );
      } else if (order.paymentMethod === 'cod') {
        return {
          order,
          paymentInfo: {
            paymentMethod: 'cod',
            financialStatus: 'partialPaid',
          },
        };
      }
    } catch (error) {
      // If an error occurs, attempt to roll back inventory changes
      if (order && order.items) {
        const rollbackBatch = await FirebaseHelper.createBatch();
        await this.incrementInventory(order, rollbackBatch);
        await FirebaseHelper.commitBatch(rollbackBatch);
      }
      throw error;
    }
  }

  async createTask(payload, scheduleTime) {
    try {
      // const URL = `http://localhost:8080/api/cancelOrderPendingPayment`;
      const URL = `${baseUrl}/api/cancelOrderPendingPayment`;

      const parent = client.queuePath(
        project,
        location,
        queue,
      );

      const task = {
        httpRequest: {
          httpMethod: 'POST',
          url: URL,
          body: Buffer.from(
            JSON.stringify(payload),
          ).toString('base64'),
          headers: {
            'Content-Type': 'application/json',
          },
          oidcToken: {
            serviceAccountEmail,
          },
        },
        scheduleTime: {
          // seconds: scheduleTime / 1000,
          seconds: scheduleTime.getTime() / 1000,
        },
      };

      const request = {
        parent,
        task,
      };

      const [response] = await client.createTask(request);
      console.log(`✅ ➡️ Task created: ${response.name}`);
    } catch (error) {
      console.log(error);
    }
  }

  async incrementInventory(order, batch) {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return;
    }

    for (const item of order.items) {
      const productRef = FirebaseHelper.getFirestoreDocumentRef('inventory', item.variantId);
      batch.set(productRef, {
        inventory_quantity: admin.firestore.FieldValue.increment(item.quantity),
      }, { merge: true });
    }
  }
};
