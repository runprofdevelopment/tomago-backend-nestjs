const { last } = require("lodash");
const Address = require("../../database/models/address");

const COLLECTION_NAME = 'settings';
const DEFAULT_ID = 'default';
const DEFAULT_SETTINGS = {
  id: DEFAULT_ID,
  vat: 0,
  cashOnDeliveryFees: 0,
  freeShippingAmount: 0, // free shipping amount
  shippingCost: 0, // shipping cost
  pickupAddress: {
    address: null,
    last_name: null,
    first_name: null,
    phoneNumber: null,
    area: null,
    city: null,
    province: null,
    country: null,
    zip: null,
    province_code: null,
    country_code: null
  },
  returnAddress: {
    address: null,
    last_name: null,
    first_name: null,
    phoneNumber: null,
    area: null,
    city: null,
    province: null,
    country: null,
    zip: null,
    province_code: null,
    country_code: null
  }
};




module.exports = {
  COLLECTION_NAME,
  DEFAULT_ID,
  DEFAULT_SETTINGS,
};