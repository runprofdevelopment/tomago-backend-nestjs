//#region [ Libraries & Resources ]
const functions = require('firebase-functions');
const handler = require('./controller/triggers-handler');

//#endregion

//#region [ Cloud Functions Config ]
const REGION = 'europe-west1';
const TriggersRuntimeOpts = {
  vpcConnector: 'bitaqatyconnector',
  vpcConnectorEgressSettings: 'ALL_TRAFFIC',
  timeoutSeconds: 540,
  memory: '2GB',
};

const CloudFunctions = functions.region(REGION).runWith(TriggersRuntimeOpts);
//#endregion

const { field } = require('../../backend/src/database/utils/firestore-field-filter-other');
const { isEqual } = require('lodash');
const isEquivalent = (before, after) => {
  return before && typeof before.isEqual === 'function'
    ? before.isEqual(after)
    : isEqual(before, after);
};
const conditions = {
  CHANGED: (fieldBefore, fieldAfter) => fieldBefore !== undefined && fieldAfter !== undefined && !isEquivalent(fieldBefore, fieldAfter),
  ADDED: (fieldBefore, fieldAfter) => fieldBefore === undefined && fieldAfter,
  REMOVED: (fieldBefore, fieldAfter) => fieldBefore && fieldAfter === undefined,
};

function field(fieldPath, operation, change, context, handler) {
  functions.logger.log('fieldPath =', fieldPath)
  functions.logger.log('operation =', operation)

  const fieldBefore = change.before.get(fieldPath);
  const fieldAfter = change.after.get(fieldPath);
  functions.logger.log('Field =', {
    befor: fieldBefore,
    after: fieldAfter
  })
  functions.logger.log('conditions =', conditions[operation](fieldBefore, fieldAfter))
  conditions[operation](fieldBefore, fieldAfter)
    ? handler(change, context)
    : Promise.resolve();
};

exports.order = {
  created: CloudFunctions.firestore.document('order/{orderId}').onCreate(handler.checkMyWallet),
  updated: CloudFunctions.firestore.document('order/{orderId}').onUpdate(handler.checkMyWallet),
}
