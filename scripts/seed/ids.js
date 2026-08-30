const { SEED_PREFIX } = require('./config');

function seedId(name) {
  return `${SEED_PREFIX}${name}`;
}

const IDS = {
  brandTomoga: seedId('brand_tomoga'),

  collectionLivingRoom: seedId('collection_living_room'),
  collectionChairs: seedId('collection_chairs'),
  collectionAccessories: seedId('collection_accessories'),
  collectionBanquette: seedId('collection_banquette'),

  categorySofas: seedId('category_sofas'),
  categoryCoffeeTables: seedId('category_coffee_tables'),
  categoryArmchairs: seedId('category_armchairs'),

  productOpalSofa: seedId('product_opal_sofa'),
  productAaltoTable: seedId('product_aalto_table'),
  productEliasArmchair: seedId('product_elias_armchair'),
  productOrionSofa: seedId('product_orion_sofa'),
  productMilanoArmchair: seedId('product_milano_armchair'),
  productVeneziaConsole: seedId('product_venezia_console'),

  variantOpalDefault: seedId('variant_opal_default'),
  variantAaltoDefault: seedId('variant_aalto_default'),
  variantEliasDefault: seedId('variant_elias_default'),
  variantOrionDefault: seedId('variant_orion_default'),
  variantMilanoDefault: seedId('variant_milano_default'),
  variantVeneziaDefault: seedId('variant_venezia_default'),

  inventoryOpal: seedId('inventory_opal'),
  inventoryAalto: seedId('inventory_aalto'),
  inventoryElias: seedId('inventory_elias'),

  projectBosphorus: seedId('project_bosphorus_hotel'),
  showRoomIstanbul: seedId('showroom_istanbul'),
  showRoomParis: seedId('showroom_paris'),

  sliderHero: seedId('slider_hero_home'),
  voucherVip: seedId('voucher_tomogavip10'),

  staticAbout: 'about-us',
  staticTerms: 'terms-and-conditions',
  staticPrivacy: 'privacy-policy',
  staticFaqs: 'faqs',
  staticRefund: 'return-and-refund',

  customerAhmed: seedId('customer_ahmed_ali'),
  adminDemo: seedId('admin_demo'),

  addressHome: seedId('address_home'),
  addressOffice: seedId('address_office'),

  paymentVisa: seedId('payment_visa'),
  paymentMastercard: seedId('payment_mastercard'),

  settingsAhmed: seedId('customer_settings_ahmed'),

  orderDelivered: seedId('order_csr_2024_0832'),
  orderInProduction: seedId('order_csr_2024_0847'),

  customRequestOrion: seedId('custom_request_orion'),
  returnRequestSample: seedId('return_request_sample'),
};

module.exports = { seedId, IDS };
