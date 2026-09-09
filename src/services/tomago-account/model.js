// Firestore collection name is unchanged so existing wallet documents stay readable.
const COLLECTION_NAME = 'decoopa-account';
const DEFAULT_ACCOUNT_ID = 'default';
const ACCOUNT_USER_ID = 'tomago';
const ACCOUNT_OPERATION = 'tomago-account';

const TOMAGO_ACCOUNT = {
  id: DEFAULT_ACCOUNT_ID,
  balance: 0,
  currency: 'EGP',
};

module.exports = {
  COLLECTION_NAME,
  DEFAULT_ACCOUNT_ID,
  ACCOUNT_USER_ID,
  ACCOUNT_OPERATION,
  TOMAGO_ACCOUNT,
};