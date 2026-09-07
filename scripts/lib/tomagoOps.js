#!/usr/bin/env node
/**
 * Shared Tomago GraphQL op discovery + Customer/Admin classification.
 */
const path = require('path');

// Avoid noisy Firebase init when loading schemas — ops modules may pull config.
process.env.NODE_ENV = process.env.NODE_ENV || 'staging';

const ALL_QUERIES = require('../../src/api/all-queries-schema');
const ALL_MUTATIONS = require('../../src/api/all-mutations-schema');

const STAGING = 'https://tomago-staging-7125900076.europe-west3.run.app';
const PROD = 'https://tomago-649000455905.europe-west3.run.app';

const PUBLIC_OPS = new Set([
  'authCustomToken',
  'authIsEmailConfigured',
  'authSendPasswordResetEmail',
  'authSendEmailAddressVerificationEmail',
  'authConfirmEmailVerification',
  'authSendSignInWithEmailLink',
  'customerCreateAccount',
  'createAppCheckToken',
  'findTermsAndConditions',
  'findReturnAndRefund',
  'findAboutUs',
  'findFAQs',
  'findPrivacyPolicy',
  'contactUsCreate',
  'settingsFind',
  'brandActiveList',
  'brandListAll',
  'categoryList',
  'retrievingCategoriesTree',
  'sliderActiveList',
  'dealList',
  'dealListAll',
  'dealListItems',
  'optionList',
  'optionFind',
  'findProductReviews',
  'adFind',
  'bannerContainerFind',
  'videoContainerFind',
  'sendOTP',
  'verifyOTP',
]);

/** Customer-first match (checked before admin). */
const CUSTOMER_PATTERNS = [
  /^(listMy|findMy|my|clearMy|setMy|shareMy|isExistsInMy)/i,
  /^(authMe)$/i,
  /^(authUpdateProfile|changeMyPassword|customerCreateAccount|customerDeleteMyAccount)$/i,
  /^(authSend|authConfirm|authUpdateEmail)/i,
  /^(cart|findMyCart|fetchCheckout|fetchCart|mergeAnonymous|applyVoucher|cartRemove)/i,
  /^(wishlist|moveItemToCart)/i,
  /^(orderCreate|userCancelOrder|orderReceived|generateKashier|calculateOrderPricing|orderFindUser|listCustomerOrders|orderTimelineFetch)$/i,
  /^(viewWallet|viewMy|initiateWalletRecharge|addBalance|createWithdrawalRequest|createTransaction)$/i,
  /^(addressCreate|addressUpdate|addressDestroy|addressAutocomplete|findMyDefaultAddress|listMyAddresses|verifyMyPhoneNumber)$/i,
  /^(paymentMethod|myBilling|myCustomRequests|customRequestCreate)$/i,
  /^(reviewCreate|listCustomerReviews|findProductReviews)$/i,
  /^(addDeviceToken|removeDeviceToken|listMyNotifications|notificationUnread|markAsRead)$/i,
  /^(brandActiveList|brandListAll|categoryList|retrievingCategoriesTree|sliderActiveList)$/i,
  /^(dealList|dealListAll|dealListItems|optionList|optionFind)$/i,
  /^(findTerms|findReturn|findAbout|findFAQs|findPrivacy|contactUsCreate|settingsFind)$/i,
  /^(adFind|bannerContainerFind|videoContainerFind)$/i,
  /^(authCustomToken|authIsEmailConfigured|createAppCheckToken)$/i,
  /^(sendOTP|verifyOTP)$/i,
  /^(viewVoucher)$/i,
  /^(createReturnRequest)$/i,
];

const ADMIN_PATTERNS = [
  /^(authMeAdmin|admin|iam)/i,
  /^(auditLog|adminList|customerList|customerFind)$/i,
  /^(addressList|addressFind|listCustomerAddresses)$/i,
  /^(customRequestList|sliderCreate|sliderUpdate|sliderDestroy|sliderFind|sliderList)$/i,
  /^(notificationFind|notificationDestroy|notifyUser|sendToUsers|sendToAll)$/i,
  /^(brandFind|brandList|brandCreate|brandUpdate|brandDestroy|brandActivate|brandDeactivate)$/i,
  /^(categoryFind|categoryCreate|subcategoryCreate|categoryUpdate|categoryDestroy|categoryRemove|categoryActivate|categoryDeactivate|categoryMove)$/i,
  /^(optionCreate|optionUpdate|productCreate|productChangeStatus|productVariantUpdate)$/i,
  /^(verifyBarcodeUsage|verifySkuUsage|inventoryFind|inventoryList|inventoryUpdate|inventoryListArchived|inventoryWithoutDeal)/i,
  /^(reviewFind|reviewList|reviewAutocomplete|reviewUpdate|reviewDestroy)$/i,
  /^(contactUsFind|contactUsList|contactUsDestroy)$/i,
  /^(orderFind|orderList|orderUpdate|adminCancelOrder|orderPending|orderShipped|orderReturn|returnReceived)/i,
  /^(clearUserCart)$/i,
  /^(saveTerms|saveReturn|saveAbout|saveFAQs|savePrivacy)$/i,
  /^(walletList|viewWalletById|adminWallet|createEmptyWallet|voucherList|voucherCreate|voucherDelete)$/i,
  /^(viewMyWithdrawalRequests|withdrawalRequestsList|rejectWithdrawal|acceptWithdrawal|confirmWithdrawal)/i,
  /^(transactionList|listDecoopaAccount|viewTransactionById)$/i,
  /^(findShipment|viewReturnRequests|acceptReturn|confirmReturn|rejectReturn|createFullyRefund|refundReturn)/i,
  /^(settingsSave|dealFind|dealCreate|dealUpdate|dealDestroy|addItemsToDeal|removeItemsFromDeal)$/i,
  /^(bannerContainerSave|videoContainerSave|adList|adCreate|adUpdate|adDestroy)$/i,
  /^(findDecoopaAccount|accountAddFunds|accountDeductFunds)$/i,
  /^(fetchGeneralReport|exportExcel)$/i,
  /^(getPackageStatus|getTrackingLink|getTrackingNumber|testCancel)$/i,
  /^(authStorageToken)$/i,
];

function parseSchema(schemaStr) {
  const raw = String(schemaStr || '').trim();
  const m = raw.match(
    /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\(([^)]*)\))?\s*:\s*(.+)$/s,
  );
  if (!m) return null;
  const name = m[1];
  const argsRaw = (m[2] || '').trim();
  const returnType = m[3].trim().replace(/\s+/g, ' ');
  const args = [];
  if (argsRaw) {
    // split top-level commas (ignore inside [])
    let depth = 0;
    let cur = '';
    for (const ch of argsRaw) {
      if (ch === '[') depth++;
      if (ch === ']') depth--;
      if (ch === ',' && depth === 0) {
        args.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    if (cur.trim()) args.push(cur.trim());
  }
  const parsedArgs = args.map((a) => {
    const am = a.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+)$/);
    if (!am) return null;
    return { name: am[1], type: am[2].trim() };
  }).filter(Boolean);

  return { name, args: parsedArgs, returnType, raw };
}

function isScalarReturn(returnType) {
  const t = returnType.replace(/[!\[\]]/g, '').trim();
  return /^(Boolean|String|Int|Float|ID|JSON|DateTime|Date)$/i.test(t);
}

function sampleVariable(type) {
  const required = type.includes('!');
  const base = type.replace(/[!\[\]]/g, '').trim();
  if (/^ID$/i.test(base)) return 'ID_HERE';
  if (/^String$/i.test(base)) return 'example';
  if (/^Int$/i.test(base)) return 10;
  if (/^Float$/i.test(base)) return 1;
  if (/^Boolean$/i.test(base)) return true;
  if (/FilterInput/i.test(base)) return [];
  if (/SortInput/i.test(base)) return [];
  if (/PaginationInput/i.test(base)) return { limit: 10, offset: 0 };
  if (/Input$/i.test(base)) return {};
  if (type.includes('[')) return [];
  return required ? {} : null;
}

function buildGraphQL(op, kind) {
  const { name, args, returnType } = op;
  const varDefs = args.map((a) => `$${a.name}: ${a.type}`).join(', ');
  const argPass = args.map((a) => `${a.name}: $${a.name}`).join(', ');
  const header = varDefs
    ? `${kind} ${name.charAt(0).toUpperCase() + name.slice(1)}(${varDefs})`
    : `${kind} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  const call = argPass ? `${name}(${argPass})` : name;
  const selection = isScalarReturn(returnType) ? '' : ' { __typename }';
  const query = `${header} {\n  ${call}${selection}\n}`;
  const variables = {};
  for (const a of args) {
    const v = sampleVariable(a.type);
    if (v !== null) variables[a.name] = v;
  }
  return { query, variables };
}

function matchesAny(name, patterns) {
  return patterns.some((p) => p.test(name));
}

function classify(name) {
  const audiences = [];
  if (matchesAny(name, CUSTOMER_PATTERNS) || PUBLIC_OPS.has(name)) {
    audiences.push('Customer');
  }
  if (matchesAny(name, ADMIN_PATTERNS)) {
    audiences.push('Admin');
  }
  // Unmatched → Admin (dashboard covers most remaining CRUD)
  if (!audiences.length) audiences.push('Admin');
  return audiences;
}

function resourceTag(audience, name) {
  const rules =
    audience === 'Customer'
      ? [
          { tag: 'Auth', match: /^(auth|customerCreate|customerDelete|createAppCheck|sendOTP|verifyOTP)/i },
          { tag: 'Catalog', match: /^(brand|category|retrieving|option|dealList|sliderActive|adFind|banner|video)/i },
          { tag: 'Cart & Checkout', match: /^(cart|findMyCart|fetchCheckout|fetchCart|mergeAnonymous|applyVoucher)/i },
          { tag: 'Wishlist', match: /^(wishlist|moveItem|isExists)/i },
          { tag: 'Addresses', match: /^(address|findMyDefault|listMyAddresses|verifyMyPhone)/i },
          { tag: 'Orders', match: /^(order|userCancel|generateKashier|calculateOrder|listCustomerOrders)/i },
          { tag: 'Wallet & Vouchers', match: /^(viewWallet|viewMy|initiateWallet|addBalance|createWithdrawal|createTransaction|viewVoucher)/i },
          { tag: 'Payments & Settings', match: /^(paymentMethod|myBilling|myCustomer|updateMyCustomer|customRequest)/i },
          { tag: 'Reviews & Support', match: /^(review|findProduct|contactUs|findTerms|findReturn|findAbout|findFAQ|findPrivacy|settingsFind)/i },
          { tag: 'Notifications', match: /^(addDevice|removeDevice|listMyNotifications|notificationUnread|markAsRead)/i },
          { tag: 'Returns', match: /^(createReturnRequest)/i },
        ]
      : [
          { tag: 'Auth & IAM', match: /^(authMeAdmin|authStorage|adminInvite|iam|adminList|customerList|customerFind)/i },
          { tag: 'Catalog Admin', match: /^(brand|category|subcategory|option|product|verifyBarcode|verifySku)/i },
          { tag: 'Inventory', match: /^(inventory)/i },
          { tag: 'Orders Admin', match: /^(order|adminCancel|clearUserCart|generateKashier)/i },
          { tag: 'Shipping', match: /^(orderShipped|orderReturn|getPackage|getTracking|findShipment)/i },
          { tag: 'Returns & Refunds', match: /^(return|refund|viewReturn)/i },
          { tag: 'Wallet & Finance', match: /^(wallet|voucher|withdrawal|transaction|decoopa|accountAdd|accountDeduct|listDecoopa)/i },
          { tag: 'CMS & Marketing', match: /^(slider|deal|ad|banner|video|saveTerms|saveReturn|saveAbout|saveFAQ|savePrivacy|settings)/i },
          { tag: 'Customers & Addresses', match: /^(addressList|addressFind|listCustomerAddresses|customRequestList)/i },
          { tag: 'Reviews & Contact', match: /^(review|contactUs)/i },
          { tag: 'Notifications', match: /^(notification|notifyUser|sendTo)/i },
          { tag: 'Reports', match: /^(auditLog|fetchGeneralReport|exportExcel)/i },
        ];
  for (const r of rules) {
    if (r.match.test(name)) return r.tag;
  }
  return 'Other';
}

function loadOps() {
  const ops = [];
  for (const item of ALL_QUERIES) {
    const parsed = parseSchema(item.schema);
    if (!parsed) continue;
    const gql = buildGraphQL(parsed, 'query');
    const audiences = classify(parsed.name);
    ops.push({
      kind: 'query',
      ...parsed,
      ...gql,
      public: PUBLIC_OPS.has(parsed.name),
      audiences,
    });
  }
  for (const item of ALL_MUTATIONS) {
    const parsed = parseSchema(item.schema);
    if (!parsed) continue;
    const gql = buildGraphQL(parsed, 'mutation');
    const audiences = classify(parsed.name);
    ops.push({
      kind: 'mutation',
      ...parsed,
      ...gql,
      public: PUBLIC_OPS.has(parsed.name),
      audiences,
    });
  }
  return ops;
}

module.exports = {
  STAGING,
  PROD,
  PUBLIC_OPS,
  loadOps,
  resourceTag,
  classify,
};
