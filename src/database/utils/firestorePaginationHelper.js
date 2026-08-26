const admin = require('firebase-admin');
const lodash = require('lodash');
const assert = require('assert');
// const moment = require('moment');
const FirebaseHelper = require('./firebaseHelper');

module.exports = class FirestorePaginationHelper {
  hasFilterConstraint = false

  /**
   * @param {Object} param
   * @param {String} param.collectionName This is collection name or collection ref 
   * @param {Integer} param.pageSize Number of records to be returned
   * @param {String} param.field 
   * @param {String} param.orderBy 
   * @param {'asc'|'desc'} param.sortBy 
   * @param {JSON[]} param.filter 
   * @param {'single'|'group'} param.queryType 
   */
  constructor({ collectionName, pageSize, field, orderBy, sortBy, filter, queryType }) {
    this.pageSize = pageSize;
    this.orderBy = orderBy;
    this.sortBy = sortBy || 'asc';
    this.field = field;
    
    const response = FirebaseHelper._generateRef(collectionName, filter, orderBy, sortBy, queryType);
    this.ref = response.ref;
    this.hasFilterConstraint = response.hasFilterConstraint;
  }

  async firstPage() {
    this.action = 'current';
    console.log('Get first page....');
    return this.hasFilterConstraint 
      ? this.ref 
      : this.ref.limit(this.pageSize);
  }

  async nextPage(pagination) {
    this.action = 'next';
    if (pagination.page && pagination.page > 0 && !this.hasFilterConstraint) {
      return this._nextPageByCurrentPage(pagination.page);
    } else if (pagination.offset && pagination.offset > 0 && !this.hasFilterConstraint) {
      return this._nextPageByOffset(pagination.offset);
    } else if (pagination.doc && pagination.doc[this.field] && !this.hasFilterConstraint) {
      return this._nextPageByDocument(pagination.doc);
    } else {
      return this.firstPage();
    }
  }

  async prevPage(pagination) {
    this.action = 'prev';
    if (pagination.page && pagination.page > 1 && !this.hasFilterConstraint) {
      return this._prevPageByCurrentPage(pagination.page);
    } else if (pagination.offset && pagination.offset > 0 && !this.hasFilterConstraint) {
      return this._prevPageByOffset(pagination.offset);
    } else if (pagination.doc && pagination.doc[this.field] && !this.hasFilterConstraint) {
      return this._prevPageByDocument(pagination.doc);
    } else {
      return this.firstPage();
    }
  }

//#region [ By document / record ]
  async _nextPageByDocument(last) {
    console.log('Get next page by document / record....');
    let value = last[this.field];
    // const value_is_date = lodash.isDate(value);
    const value_is_date = this.isDateString(value);
    console.log('Value Before = ', value);
    console.log('Value IS Date =', value_is_date);
    if (value_is_date) {
      value = FirebaseHelper.convertToTimestampIfIsNot(new Date(value));
    }
    console.log('Value After = ', value);
    return this.ref.startAfter(value).limit(this.pageSize);
  }

  async _prevPageByDocument(first) {
    console.log('Get previous page by document / record....');
    let value = first[this.field];
    // const value_is_date = lodash.isDate(value);
    const value_is_date = this.isDateString(value);
    console.log('Value Before = ', value);
    console.log('Value IS Date =', value_is_date);
    if (value_is_date) {
      value = FirebaseHelper.convertToTimestampIfIsNot(new Date(value));
    }
    console.log('Value After = ', value);
    return this.ref.endBefore(value).limitToLast(this.pageSize);
  }
//#endregion

//#region [ By current page number ]
  async currentPage(currentPage) {
    console.log('Get current page by current page number....');
    assert((currentPage > 0), 'Page number must be greater than zero');  

    const offset = currentPage > 0 
      ? (currentPage - 1) * this.pageSize 
      : 0;
    const limit = currentPage > 0 ? this.pageSize : 0;
    return this.ref.limit(limit).offset(offset);
  }

  async _nextPageByCurrentPage(currentPage) {
    console.log('Get next page by current page number....');
    assert((currentPage > 0), 'Page number must be greater than zero');  

    const offset = currentPage * this.pageSize;

    return this.ref.limit(this.pageSize).offset(offset);
  }

  async _prevPageByCurrentPage(currentPage) {
    console.log('Get previous page by current page number....');
    assert((currentPage > 1), 'Page number must be greater than one');  
    
    const offset = (currentPage - 2) * this.pageSize;

    return this.ref.limit(this.pageSize).offset(offset);
  }
//#endregion

//#region [ By offset number ]
  async _nextPageByOffset(offset) {
    console.log('Get next page by offset number....');
    assert((offset >= 0), 'The offset must be non-negative number');  
    
    return this.ref.limit(this.pageSize).offset(offset);
  }

  async _prevPageByOffset(offset) {
    console.log('Get previous page by offset number....');
    assert((offset >= 0), 'The offset must be non-negative number');  
  
    return this.ref.limit(this.pageSize).offset(offset);
  }
//#endregion

  async getPagination(collection) {
    if (!collection || !collection.length || this.hasFilterConstraint) {
      return { totalCount: 0, pagesNumber:0, pageSize: 0, isFirstPage: true, isLastPage: true }
    }
    
    const firstDocument = collection[0];
    const lastDocument = collection[collection.length - 1];
    const hasPreviousDocument = await this.hasPreviousDocument(firstDocument);
    const hasNextDocument = (collection.length < this.pageSize && this.action != 'prev') ? false : await this.hasNextDocument(lastDocument);
    const totalCount = await this.count();
   
    return {
      // currentPage: 0,
      // totalRowsNumber: totalCount,
      // firstRowIndex: 0,
      // endRowIndex: collection.length - 1,
      totalCount: totalCount,
      pagesNumber: Math.ceil(totalCount / this.pageSize),
      pageSize: collection.length,
      isFirstPage: !hasPreviousDocument,
      isLastPage: !hasNextDocument,
    }
  }

  async hasNextDocument(last) {
    console.log('Get next document by last document / record....');
    let value = last[this.field];
    // const value_is_date = lodash.isDate(value);
    const value_is_date = this.isDateString(value);
    console.log('Value Before = ', value);
    console.log('Value IS Date =', value_is_date);
    if (value_is_date) {
      value = FirebaseHelper.convertToTimestampIfIsNot(new Date(value));
    }
    console.log('Value After = ', value);
    return (await this.ref.startAfter(value).limit(1).get()).size > 0;
  }

  async hasPreviousDocument(first) {
    console.log('Get previous document by first document / record....');
    let value = first[this.field];
    // const value_is_date = lodash.isDate(value);
    const value_is_date = this.isDateString(value);
    console.log('is number =', lodash.isNumber(value));
    console.log('Value Before = ', value);
    console.log('Value IS Date =', value_is_date);                                                
    if (value_is_date) {
      value = FirebaseHelper.convertToTimestampIfIsNot(new Date(value));
    }
    console.log('Value After = ', value);
    const doc = FirebaseHelper.mapCollection(await this.ref.endBefore(value).limitToLast(1).get());
    // console.log('Previous document =', doc);

    return doc.length > 0 && doc.filter(el => el.id !== first.id).length;
    // return (await this.ref.endBefore(value).limitToLast(1).get()).size > 0;
  }

  async count() {
    const snapshot = await this.ref.count().get();
    return snapshot.data().count;
  }

  isDateString(str) {
    // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    // return dateRegex.test(str);
    const date = new Date(str);
    return !isNaN(date);
  };
};