const functions = require('firebase-functions');
const { isEqual } = require('lodash');

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

// exports.field = (fieldPath, operation, handler) => {
//     return (change, context) => {
//         const fieldBefore = change.before.get(fieldPath);
//         const fieldAfter = change.after.get(fieldPath);
//         return conditions[operation](fieldBefore, fieldAfter)
//             ? handler(change, context)
//             : Promise.resolve();
//     };
// };

exports.field = (
  fieldPath,
  operation,
  change,
  context,
  handler,
) => {
  functions.logger.log('fieldPath =', fieldPath);
  functions.logger.log('operation =', operation);
  functions.logger.log('change =', change);
  functions.logger.log('context =', context);

  const fieldBefore = change.before.get(fieldPath);
  const fieldAfter = change.after.get(fieldPath);
  conditions[operation](fieldBefore, fieldAfter)
    ? handler(change, context)
    : Promise.resolve();
};
