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

const RETURN_REQUEST_TYPE_BY_STORED_VALUE = {
  partialrefund: 'partialRefund',
  fullrefund: 'fullRefund',
};

function toReturnRequestType(value) {
  if (value == null || value === '') {
    return null;
  }

  const stored = String(value).trim().toLowerCase();
  return RETURN_REQUEST_TYPE_BY_STORED_VALUE[stored] || value;
}

const resolver = {
  ReturnRequest: {
    type: (record) => toReturnRequestType(record && record.type),
  },
};

exports.schema = schema;
exports.resolver = resolver;
