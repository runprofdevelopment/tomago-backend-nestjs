/**
 * Conceptual map: erd.dbml SQL tables → live Firestore collections.
 * Field names in Firestore stay as stored (no live-data renames).
 * Localization {en,ar} ⇔ ERD name_en / name_ar.
 */
module.exports = {
  roles: null, // embedded on user.roles
  admins: 'user', // accountType owner/admin + roles
  customers: 'user', // accountType customer
  otp_challenges: 'OTP-code',
  password_resets: null, // Firebase Auth / custom — TODO: confirm
  customer_addresses: 'user/{id}/addresses',
  customer_notifications: 'user/{id}/notification',
  customer_settings: 'customerSettings',
  payment_methods: 'paymentMethod',
  brands: 'brand',
  collections: 'collection',
  categories: 'category',
  product_options: 'variants_options',
  products: 'product',
  product_images: null, // on product-variants.variant_images / main_image
  product_features: null, // product.features JsonArray
  product_materials: null, // product.materials JsonArray
  product_mechanisms: null, // product.mechanisms JsonArray
  product_option_values: null, // product.variants_options / variant.options_values
  reviews: 'product/{id}/reviews',
  orders: 'order',
  order_items: null, // order.items[]
  customer_requests: 'customRequest',
  request_messages: null,
  shipping_partners: null, // shipment.shipping_company string
  return_requests: 'returnRequest',
  wallets: 'wallet',
  wallet_transactions: 'transaction',
  platform_wallet: 'decoopa-account',
  platform_wallet_transactions: 'transaction',
  transactions: 'transaction',
  refunds: null, // often via returnRequest + transaction — TODO: confirm
  bank_accounts: null, // fields on withdrawalRequest
  withdrawals: 'withdrawalRequest',
  projects: 'project',
  project_images: null, // project.images JsonArray
  project_products: null, // project.featured_product_ids StringArray
  show_rooms: 'showRoom',
  vouchers: 'voucher',
  deals: 'deal',
  deal_products: null, // deal.items[]
  sliders: 'slider',
  top_banners: 'topBanner',
  ads: 'ads',
  video_ads: 'videoAd',
  platform_settings: 'settings',
  faqs: 'staticPages',
  about_us: 'staticPages',
  terms_and_conditions: 'staticPages',
  refund_policy: 'staticPages',
  privacy_policy: 'staticPages',
  contact_messages: 'contactUs',
};
