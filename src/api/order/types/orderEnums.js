const schema = `
  enum OrderStatusEnum {
    pendingAcceptance
    pendingDelivery
    shipped
    received
    notreceived
    cancelled
    failedDelivery
    waitingPaymentConfirmation
  }

  enum FinancialStatusEnum {
    pending
    refunded
    partialRefund
    pendingRefund
    paid
    unpaid
    partialPaid
  }

  enum PaymentMethodEnum {
    cod
    wallet
    credit
    installment
    installmentWithBank
    installmentsWithCompany
    e_wallet
    visa
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;