const admin = require('firebase-admin');
const lodash = require('lodash');
const HelperFunctions = require('../../utils/helperFunctions');

/**
 * => Query limitations
 * - The following list summarizes Cloud Firestore query limitations:
 * - [1] Cloud Firestore provides limited support for logical OR queries.
 * - [2] In a compound query, range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field.
 * - [12] You can't order your query by a field included in an equality (==) or in clause.
 */
module.exports = class FirestoreFilterHelper {
  static applyFilter(ref, filter, sorts = []) {
    try {
      this.mapDateToTimeStampIfFound(filter);
      let hasFilterConstraint = false;
      const orderByFieldsMandatory = [];
      const sortSpecs = Array.isArray(sorts) && sorts.length
        ? sorts
        : [{ field: 'createdAt', direction: 'asc' }];
      const primarySort = sortSpecs[0];

      for (const iterator of filter) {
        if (iterator.values && iterator.values.length) {
          iterator.value = iterator.values;
        }

        const FIELD_NAME = iterator.field;
        const OPERATOR = this.mapOperator(iterator.operator);
        const VALUE = iterator.value;

        if (OPERATOR == 'like') {
          const searchField = FIELD_NAME.includes('normalize') ? FIELD_NAME : `normalize_${FIELD_NAME}`;
          const searchText = HelperFunctions.stringNormalization(VALUE);
          ref = ref.orderBy(searchField, primarySort.direction).startAt(searchText).endAt(searchText + "\uf8ff");
          hasFilterConstraint = true;
          return { ref, hasFilterConstraint };
        } else if (OPERATOR === 'startsWith') {
          ref = ref.where(FIELD_NAME, '>=', VALUE).where(FIELD_NAME, '<=', VALUE + '\uf8ff');
        } else {
          ref = ref.where(FIELD_NAME, OPERATOR, VALUE);
        }

        if (OPERATOR === '!=' || OPERATOR === 'not-in' || OPERATOR === '<' || OPERATOR === '<=' || OPERATOR === '>' || OPERATOR === '>=') {
          orderByFieldsMandatory.push(FIELD_NAME);
        }
      }

      const directionForField = (fieldName) => {
        const match = sortSpecs.find((spec) => spec.field === fieldName);
        return match ? match.direction : primarySort.direction;
      };

      const mandatory = [];
      for (const fieldName of orderByFieldsMandatory) {
        if (!mandatory.includes(fieldName)) {
          mandatory.push(fieldName);
        }
      }

      const orderedFields = [...mandatory];
      for (const spec of sortSpecs) {
        if (!orderedFields.includes(spec.field)) {
          orderedFields.push(spec.field);
        }
      }

      orderedFields.forEach((fieldName) => {
        const fields = filter.map(el => el.field);

        if (fields.includes(fieldName) && fieldName == 'id') {
          hasFilterConstraint = true;
        } else {
          ref = ref.orderBy(fieldName, directionForField(fieldName));
        }
      });

      return { ref, hasFilterConstraint }
    } catch (error) {
      throw error;
    }
  }

  static castValue(value) {
    if (Array.isArray(value)) {
      const values = []
      value.forEach(val => {
        if (!isNaN(val)) values.push(parseFloat(val))
        else values.push(val)
      })
      return values
    }

    if (value == 'true' || value == true) return true
    else if (value == 'false' || value == false) return false
    else if (value && !isNaN(value) && !value.toString().startsWith('+')) return parseFloat(value)
    else if (typeof value == 'string') return value
    else return null
  }

  static mapOperator(operator) {
    switch (operator) {
      case 'less': case '<': return '<';
      case 'lessEqual': case '<=': return '<=';
      case 'greater': case '>': return '>';
      case 'greaterEqual': case '>=': return '>=';
      case 'equal': case '==': return '==';
      case 'notEqual': case '!=': return '!=';
      case 'in': return 'in';
      case 'notIn': case 'not-in': return 'not-in';
      case 'arrayContains': case 'array-contains': return 'array-contains';
      case 'arrayContainsAny': case 'array-contains-any': return 'array-contains-any';
      case 'startsWith': return 'startsWith';
      case 'like': return 'like';
      default: return null
    }
  }

  static isDateFilterField(fieldName) {
    return /(?:At|_date|Date)$/i.test(fieldName);
  }

  static mapDateToTimeStampIfFound(filter) {
    try {
      for (const fi of filter) {
        if (!fi.value || !this.isDateFilterField(fi.field)) {
          continue;
        }

        const date = new Date(fi.value);
        if (date instanceof Date && !isNaN(date)) {
          fi.value = admin.firestore.Timestamp.fromDate(date);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static get LESS() { return '<'; }
  static get LESS_EQUAL() { return '<='; }
  static get GREATER() { return '>'; }
  static get GREATER_EQUAL() { return '>='; }
  static get EQUAL() { return '=='; }
  static get NOT_EQUAL() { return '!='; }
  static get IN() { return 'in'; }
  static get NOT_IN() { return 'notIn'; }
  static get ARRAY_CONTAINS() { return 'arrayContains'; }
  static get ARRAY_CONTAINS_ANY() { return 'arrayContainsAny'; }
  static get STARTS_WITH() { return 'startsWith'; }
  static get LIKE() { return 'like'; }
};
