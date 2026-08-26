const schema = `
  type Order {
    id: String
    userID: String
    userInfo: User
    addressId: String
    billingInfo: BillingInformation
    items: [ Item! ]
    orderStatus: OrderStatusEnum
    financialStatus: FinancialStatusEnum
    paymentMethod: PaymentMethodEnum
    useWallet: Boolean
    transactionId: String
    shippingId: String
    cancelReason: String
    ipAddress: String
    totalQuantity: Int
    isCanceled: Boolean
    isReturned: Boolean
    paymentInfo: JSON
    currency: String
    partialAmountPaid: Float
    vatPercentage: Float
    vatAmount: Float
    totalDiscount: Float
    shippingCost: Float
    cashOnDeliveryFees: Float
    subTotalPrice: Float
    totalPrice: Float

    shipment: Shipment
    timeline: [ Timeline ]

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type BillingInformation {
    address: String
    area: String
    city: String
    province: String
    country: String

    firstName: String
    lastName: String
    phoneNumber: String
    zip: Int
  }

  type Item {
    product: Product
    variant: Variant
    quantity: Int
    price: Float
    status: String
    isReturned: Boolean

  }

  type PlaceOrder {
    order: Order
    paymentInfo: JSON
  }

  type Pricing {
    currency: String
    vatPercentage: Float
    vatAmount: Float
    totalDiscount: Float
    shippingCost: Float
    cashOnDeliveryFees: Float
    subTotalPrice: Float
    totalPrice: Float
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
