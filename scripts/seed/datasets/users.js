const { IDS } = require('../ids');

const CUSTOMER_EMAIL = 'ahmed.ali@tomoga.demo';
const CUSTOMER_PASSWORD = 'TomogaDemo123!';
const ADMIN_EMAIL = 'admin@tomoga.demo';
const ADMIN_PASSWORD = 'TomogaAdmin123!';

function buildUsers() {
  return [
    {
      collection: 'user',
      id: IDS.customerAhmed,
      data: {
        authenticationUid: IDS.customerAhmed,
        email: CUSTOMER_EMAIL,
        emailVerified: true,
        firstName: 'Ahmed',
        lastName: 'Ali',
        fullName: 'Ahmed Ali',
        phoneNumber: '+905321234567',
        phoneVerified: true,
        disabled: false,
        avatar: null,
        lang: 'en',
        roles: ['customer'],
        accountType: 'customer',
        providerId: 'password',
        gender: 'male',
        birthDate: '1990-03-15',
        nationality: 'Turkey',
        wishlistShareToken: null,
        joinDate: '2022-01-15',
      },
      auth: {
        email: CUSTOMER_EMAIL,
        password: CUSTOMER_PASSWORD,
        displayName: 'Ahmed Ali',
      },
    },
    {
      collection: 'user',
      id: IDS.adminDemo,
      data: {
        authenticationUid: IDS.adminDemo,
        email: ADMIN_EMAIL,
        emailVerified: true,
        firstName: 'Demo',
        lastName: 'Admin',
        fullName: 'Demo Admin',
        phoneNumber: '+966123456789',
        phoneVerified: true,
        disabled: false,
        lang: 'en',
        roles: ['admin'],
        accountType: 'admin',
        providerId: 'password',
      },
      auth: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: 'Demo Admin',
      },
    },
  ];
}

function buildAddresses() {
  const customerId = IDS.customerAhmed;
  return [
    {
      parentCollection: 'user',
      parentId: customerId,
      subCollection: 'addresses',
      id: IDS.addressHome,
      data: {
        customer_id: customerId,
        label: 'Home',
        name: 'Ahmed Ali',
        first_name: 'Ahmed',
        last_name: 'Ali',
        phoneNumber: '+905321234567',
        email: 'ahmed.ali@email.com',
        address: 'Bağdat Caddesi No:42',
        area: 'Kadıköy',
        city: 'Istanbul',
        province: 'Istanbul',
        country: 'Turkey',
        zip: '34728',
        default: true,
      },
    },
    {
      parentCollection: 'user',
      parentId: customerId,
      subCollection: 'addresses',
      id: IDS.addressOffice,
      data: {
        customer_id: customerId,
        label: 'Office',
        name: 'Ahmed Ali',
        first_name: 'Ahmed',
        last_name: 'Ali',
        phoneNumber: '+905321234567',
        email: 'ahmed.ali@work.com',
        address: 'Levent Plaza, Floor 12',
        area: 'Levent',
        city: 'Istanbul',
        province: 'Istanbul',
        country: 'Turkey',
        zip: '34330',
        default: false,
      },
    },
  ];
}

function buildCustomerSettings() {
  return [
    {
      collection: 'customerSettings',
      id: IDS.settingsAhmed,
      data: {
        customer_id: IDS.customerAhmed,
        orderUpdatesEnabled: true,
        promotionalEmailsEnabled: false,
        newCollectionAlertsEnabled: true,
        newsletterEnabled: true,
        preferredLanguage: 'en',
        defaultCurrency: 'USD',
        shippingRegion: 'Turkey (Istanbul)',
        twoFactorEnabled: false,
        loginAlertsEnabled: true,
        passwordLastChangedAt: new Date('2024-11-01'),
      },
    },
  ];
}

function buildPaymentMethods() {
  return [
    {
      collection: 'paymentMethod',
      id: IDS.paymentVisa,
      data: {
        customer_id: IDS.customerAhmed,
        brand: 'visa',
        last_four: '4242',
        expiry_month: 8,
        expiry_year: 2027,
        cardholder_name: 'Ahmed Ali',
        is_default: true,
        provider_token: 'seed_token_visa',
      },
    },
    {
      collection: 'paymentMethod',
      id: IDS.paymentMastercard,
      data: {
        customer_id: IDS.customerAhmed,
        brand: 'mastercard',
        last_four: '8819',
        expiry_month: 3,
        expiry_year: 2026,
        cardholder_name: 'Ahmed Ali',
        is_default: false,
        provider_token: 'seed_token_mc',
      },
    },
  ];
}

function buildOrders() {
  const user = IDS.customerAhmed;
  const userInfo = {
    id: user,
    authenticationUid: user,
    fullName: 'Ahmed Ali',
    firstName: 'Ahmed',
    lastName: 'Ali',
    phoneNumber: '+905321234567',
    email: CUSTOMER_EMAIL,
  };

  return [
    {
      collection: 'order',
      id: IDS.orderDelivered,
      data: {
        userID: user,
        userInfo,
        addressId: IDS.addressHome,
        orderStatus: 'received',
        financialStatus: 'paid',
        paymentMethod: 'credit',
        useWallet: false,
        items: [
          {
            productId: IDS.productAaltoTable,
            variantId: IDS.variantAaltoDefault,
            quantity: 1,
            price: 1120,
            status: 'received',
          },
        ],
        currency: 'USD',
        vatPercentage: 8.5,
        vatAmount: 95.2,
        totalDiscount: 0,
        shippingCost: 0,
        cashOnDeliveryFees: 0,
        subTotalPrice: 1120,
        totalPrice: 1215.2,
        totalQuantity: 1,
        isCanceled: false,
        isReturned: false,
        orderNumber: 'CSR-2024-0832',
        placedAt: new Date('2024-11-25'),
        deliveredAt: new Date('2024-12-02'),
        shippingMethod: 'Premium White Glove',
        paymentLastFour: '4242',
      },
    },
    {
      collection: 'order',
      id: IDS.orderInProduction,
      data: {
        userID: user,
        userInfo,
        addressId: IDS.addressHome,
        orderStatus: 'inProduction',
        financialStatus: 'paid',
        paymentMethod: 'credit',
        useWallet: false,
        items: [
          {
            productId: IDS.productOrionSofa,
            variantId: IDS.variantOrionDefault,
            quantity: 2,
            price: 6130,
            status: 'inProduction',
          },
        ],
        currency: 'USD',
        vatPercentage: 8.5,
        vatAmount: 1042.1,
        totalDiscount: 0,
        shippingCost: 0,
        subTotalPrice: 12260,
        totalPrice: 13302.1,
        totalQuantity: 2,
        isCanceled: false,
        isReturned: false,
        orderNumber: 'CSR-2024-0847',
        placedAt: new Date('2025-02-12'),
        estimatedDeliveryAt: new Date('2025-03-15'),
      },
    },
  ];
}

function buildCustomRequests() {
  return [
    {
      collection: 'customRequest',
      id: IDS.customRequestOrion,
      data: {
        full_name: 'Ahmed Ali',
        email: CUSTOMER_EMAIL,
        phone: '+905321234567',
        request_type: 'Custom Size',
        description:
          'Looking for a custom Orion configuration: 320cm width, soft linen beige, walnut base.',
        image_urls: [],
        product_id: IDS.productOrionSofa,
        status: 'pending',
        customer_id: IDS.customerAhmed,
      },
    },
  ];
}

function buildReturnRequests() {
  return [
    {
      collection: 'returnRequest',
      id: IDS.returnRequestSample,
      data: {
        type: 'partialrefund',
        status: 'pending',
        returnReason: 'Changed mind',
        comments: 'Would prefer a different finish.',
        photos: [],
        orderID: IDS.orderDelivered,
        userID: IDS.customerAhmed,
        items: [
          {
            productId: IDS.productAaltoTable,
            variantId: IDS.variantAaltoDefault,
            quantity: 1,
            price: 1120,
          },
        ],
      },
    },
  ];
}

function buildUserDatasets() {
  return {
    users: buildUsers(),
    addresses: buildAddresses(),
    customerSettings: buildCustomerSettings(),
    paymentMethods: buildPaymentMethods(),
    orders: buildOrders(),
    customRequests: buildCustomRequests(),
    returnRequests: buildReturnRequests(),
  };
}

module.exports = {
  CUSTOMER_EMAIL,
  CUSTOMER_PASSWORD,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  buildUserDatasets,
};
