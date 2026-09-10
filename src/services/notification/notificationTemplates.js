/**
 * Localized notification templates for domain event triggers.
 * Each template returns { title, body, payload } ready for NotificationSender.
 */

const ORDER_STATUS_TEMPLATES = {
  pendingAcceptance_created: {
    title: { en: 'Order placed', ar: 'تم إنشاء الطلب' },
    body: {
      en: 'Your order #{orderId} has been placed successfully.',
      ar: 'تم إنشاء طلبك رقم #{orderId} بنجاح.',
    },
  },
  pendingAcceptance_paid: {
    title: { en: 'Payment confirmed', ar: 'تم تأكيد الدفع' },
    body: {
      en: 'Payment for order #{orderId} was confirmed. We are preparing your order.',
      ar: 'تم تأكيد دفع طلبك رقم #{orderId}. جاري تجهيز طلبك.',
    },
  },
  pendingAcceptance: {
    title: { en: 'Order received', ar: 'تم استلام الطلب' },
    body: {
      en: 'Your order #{orderId} is being reviewed.',
      ar: 'طلبك رقم #{orderId} قيد المراجعة.',
    },
  },
  confirmed: {
    title: { en: 'Order confirmed', ar: 'تم تأكيد الطلب' },
    body: {
      en: 'Your order #{orderId} has been confirmed.',
      ar: 'تم تأكيد طلبك رقم #{orderId}.',
    },
  },
  inProduction: {
    title: { en: 'Order in production', ar: 'الطلب قيد التصنيع' },
    body: {
      en: 'Your order #{orderId} is now in production.',
      ar: 'طلبك رقم #{orderId} قيد التصنيع الآن.',
    },
  },
  qualityCheck: {
    title: { en: 'Quality check', ar: 'فحص الجودة' },
    body: {
      en: 'Your order #{orderId} is undergoing quality check.',
      ar: 'طلبك رقم #{orderId} قيد فحص الجودة.',
    },
  },
  pendingDelivery: {
    title: { en: 'Ready for delivery', ar: 'جاهز للشحن' },
    body: {
      en: 'Your order #{orderId} is packed and ready to ship.',
      ar: 'طلبك رقم #{orderId} تم تجهيزه وجاهز للشحن.',
    },
  },
  shipped: {
    title: { en: 'Order shipped', ar: 'تم شحن الطلب' },
    body: {
      en: 'Your order #{orderId} is on its way.',
      ar: 'طلبك رقم #{orderId} في الطريق إليك.',
    },
  },
  received: {
    title: { en: 'Order delivered', ar: 'تم تسليم الطلب' },
    body: {
      en: 'Your order #{orderId} has been delivered. Enjoy!',
      ar: 'تم تسليم طلبك رقم #{orderId}. نتمنى أن يعجبك!',
    },
  },
  cancelled: {
    title: { en: 'Order cancelled', ar: 'تم إلغاء الطلب' },
    body: {
      en: 'Your order #{orderId} has been cancelled.',
      ar: 'تم إلغاء طلبك رقم #{orderId}.',
    },
  },
  failedDelivery: {
    title: { en: 'Delivery failed', ar: 'فشل التسليم' },
    body: {
      en: 'Delivery of order #{orderId} failed. Please contact support.',
      ar: 'فشل تسليم طلبك رقم #{orderId}. يرجى التواصل مع الدعم.',
    },
  },
  notreceived: {
    title: { en: 'Order not received', ar: 'لم يتم استلام الطلب' },
    body: {
      en: 'Order #{orderId} was marked as not received. Please contact support.',
      ar: 'تم تسجيل طلبك رقم #{orderId} كغير مستلم. يرجى التواصل مع الدعم.',
    },
  },
};

const RETURN_STATUS_TEMPLATES = {
  accepted: {
    title: { en: 'Return accepted', ar: 'تم قبول طلب الإرجاع' },
    body: {
      en: 'Your return request has been accepted.',
      ar: 'تم قبول طلب الإرجاع الخاص بك.',
    },
  },
  rejected: {
    title: { en: 'Return rejected', ar: 'تم رفض طلب الإرجاع' },
    body: {
      en: 'Your return request has been rejected.',
      ar: 'تم رفض طلب الإرجاع الخاص بك.',
    },
  },
  confirmed: {
    title: { en: 'Return completed', ar: 'اكتمل الإرجاع' },
    body: {
      en: 'Your return has been completed and refunded.',
      ar: 'تم إكمال الإرجاع واسترداد المبلغ.',
    },
  },
  returned: {
    title: { en: 'Return completed', ar: 'اكتمل الإرجاع' },
    body: {
      en: 'Your return has been completed and refunded.',
      ar: 'تم إكمال الإرجاع واسترداد المبلغ.',
    },
  },
};

const WITHDRAWAL_STATUS_TEMPLATES = {
  accepted: {
    title: { en: 'Withdrawal accepted', ar: 'تم قبول طلب السحب' },
    body: {
      en: 'Your withdrawal request has been accepted.',
      ar: 'تم قبول طلب السحب الخاص بك.',
    },
  },
  rejected: {
    title: { en: 'Withdrawal rejected', ar: 'تم رفض طلب السحب' },
    body: {
      en: 'Your withdrawal request has been rejected.',
      ar: 'تم رفض طلب السحب الخاص بك.',
    },
  },
  confirmed: {
    title: { en: 'Withdrawal completed', ar: 'اكتمل السحب' },
    body: {
      en: 'Your withdrawal has been completed successfully.',
      ar: 'تم إكمال عملية السحب بنجاح.',
    },
  },
  approved: {
    title: { en: 'Withdrawal approved', ar: 'تمت الموافقة على السحب' },
    body: {
      en: 'Your withdrawal request has been approved.',
      ar: 'تمت الموافقة على طلب السحب الخاص بك.',
    },
  },
};

const WALLET_CREDIT_TEMPLATE = {
  title: { en: 'Wallet credited', ar: 'تم إضافة رصيد للمحفظة' },
  body: {
    en: 'Your wallet balance has been updated.',
    ar: 'تم تحديث رصيد محفظتك.',
  },
};

const CUSTOM_REQUEST_STATUS_TEMPLATES = {
  replied: {
    title: { en: 'Reply to your request', ar: 'رد على طلبك الخاص' },
    body: {
      en: 'You have a new reply on your custom request.',
      ar: 'لديك رد جديد على طلبك الخاص.',
    },
  },
  closed: {
    title: { en: 'Custom request closed', ar: 'تم إغلاق الطلب الخاص' },
    body: {
      en: 'Your custom request has been closed.',
      ar: 'تم إغلاق طلبك الخاص.',
    },
  },
};

function interpolate(text, vars = {}) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/#\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : '',
  );
}

function applyVars(template, vars) {
  if (!template) return null;
  return {
    title: {
      en: interpolate(template.title.en, vars),
      ar: interpolate(template.title.ar, vars),
    },
    body: {
      en: interpolate(template.body.en, vars),
      ar: interpolate(template.body.ar, vars),
    },
  };
}

function buildNotification(template, payloadKey, payloadValue, vars = {}) {
  const localized = applyVars(template, vars);
  if (!localized) return null;
  return {
    ...localized,
    payload: {
      key: payloadKey,
      value: String(payloadValue),
    },
  };
}

module.exports = class NotificationTemplates {
  static forOrderStatus({ orderId, beforeStatus, afterStatus }) {
    let templateKey = afterStatus;

    if (afterStatus === 'pendingAcceptance') {
      if (!beforeStatus) {
        templateKey = 'pendingAcceptance_created';
      } else if (beforeStatus === 'waitingPaymentConfirmation') {
        templateKey = 'pendingAcceptance_paid';
      }
    }

    // Skip waiting-for-gateway — customer is still on payment page
    if (afterStatus === 'waitingPaymentConfirmation') {
      return null;
    }

    const template = ORDER_STATUS_TEMPLATES[templateKey];
    return buildNotification(template, 'order', orderId, { orderId });
  }

  static forReturnStatus({ returnId, afterStatus }) {
    const template = RETURN_STATUS_TEMPLATES[afterStatus];
    return buildNotification(template, 'return', returnId, { returnId });
  }

  static forWithdrawalStatus({ withdrawalId, afterStatus }) {
    const template = WITHDRAWAL_STATUS_TEMPLATES[afterStatus];
    return buildNotification(template, 'wallet', withdrawalId, { withdrawalId });
  }

  static forWalletCredit({ walletId }) {
    return buildNotification(WALLET_CREDIT_TEMPLATE, 'wallet', walletId, {
      walletId,
    });
  }

  static forCustomRequestStatus({ requestId, afterStatus }) {
    const template = CUSTOM_REQUEST_STATUS_TEMPLATES[afterStatus];
    return buildNotification(template, 'customRequest', requestId, {
      requestId,
    });
  }
};
