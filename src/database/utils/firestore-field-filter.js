const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { Change, EventContext } = require('firebase-functions');
const { isEqual } = require('lodash');
const DocumentSnapshot = admin.firestore.DocumentSnapshot;
const FieldPath = admin.firestore.FieldPath;

const isEquivalent = (before, after) => {
  return before && typeof before.isEqual === 'function'
    ? before.isEqual(after)
    : isEqual(before, after);
};

const conditions = {
  CHANGED: (fieldBefore, fieldAfter) =>
    fieldBefore !== undefined &&
    fieldAfter !== undefined &&
    !isEquivalent(fieldBefore, fieldAfter),

  ADDED: (fieldBefore, fieldAfter) =>
    fieldBefore === undefined && fieldAfter,

  REMOVED: (fieldBefore, fieldAfter) =>
    fieldBefore && fieldAfter === undefined,
};

/**
 * @param {string | FieldPath} fieldPath 
 * @param {'ADDED' | 'REMOVED' | 'CHANGED'} operation 
 * @param {(Change<DocumentSnapshot>, EventContext) => <PromiseLike<any> | any>} handler 
 * @returns 
 */
 exports.field = (fieldPath, operation, handler) => {
  functions.logger.log({ fieldPath, operation })
  
  return function(change, context) {
    const fieldBefore = change.before.get(fieldPath);
    const fieldAfter = change.after.get(fieldPath);
    functions.logger.log({
      fieldBefore: fieldBefore,
      fieldAfter: fieldAfter
    });

    return conditions[operation](fieldBefore, fieldAfter)
      ? handler(change, context)
      : Promise.resolve();
  };
};