const schema = `
  type ReturnRequest {
    id: String
    type: ReturnRequestTypeEnum
    status: ReturnRequestEnum
    returnReason: String
    rejectReason: String
    comments: String
    photos: [String]
    userID: String
    orderID: String
    user: User
    items: [ ItemV3! ]!
    
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type ItemV3 {
    product: Product
    variant: Variant
    quantity: Int
    price: Float
    productId: String
    variantId: String
  }

  enum ReturnRequestTypeEnum {
    partialRefund
    fullRefund
  }

  enum ReturnRequestEnum {
    pending
    accepted
    rejected
    confirmed
    returnReceivedAndUnderReview
    refunded
    refundRejected
    partialyRefunded
    returnedDeleveryOnTheWay
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
