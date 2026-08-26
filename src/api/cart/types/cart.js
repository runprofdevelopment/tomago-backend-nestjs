const schema = `
  type Cart {
    id: String!
    userID: String!
    items: [ ItemV2! ]!
    sub_total: Float
    total_price: Float
    totalQty: Int
    quantity_errors: String
    voucherId: String

    """ This field is deprecated and will be removed in the next version. """
    delivery_fees: Float @deprecated(reason: "Not supported anymore.")
    """ This field is deprecated and will be removed in the next version. """
    taxes: Float @deprecated(reason: "Not supported anymore.")

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type CheckoutDetails {
    id: String!
    userID: String!
    items: [ ItemV2! ]!
    totalQty: Int
    quantity_errors: String
    voucherId: String

    currency: String
    vatPercentage: Float
    cashOnDeliveryFees: Float
    totalDiscount: Float
    shippingCost: Float
    vatAmount: Float
    subTotalPrice: Float
    totalPrice: Float

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
  
  type ItemV2 {
    product: Product
    variant: Variant
    quantity: Int
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
