const admin = require('firebase-admin');

const BATCH_LIMIT = 450;

function stripNulls(obj) {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) {
    return obj.map(stripNulls).filter((v) => v !== undefined);
  }
  if (obj instanceof Date) return obj;
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      const cleaned = stripNulls(val);
      if (cleaned !== undefined) acc[key] = cleaned;
      return acc;
    }, {});
  }
  return obj;
}

class FirestoreSeedWriter {
  constructor({ dryRun = false, prefix = 'seed_', db = null } = {}) {
    this.dryRun = dryRun;
    this.prefix = prefix;
    this.db = db || admin.firestore();
    this.pending = [];
    this.stats = { written: 0, deleted: 0, skipped: 0 };
  }

  async flush() {
    if (this.pending.length === 0) return;

    if (this.dryRun) {
      this.stats.skipped += this.pending.length;
      this.pending.forEach(({ ref, data, merge }) => {
        console.log(`  [dry-run] set ${ref.path}${merge ? ' (merge)' : ''}`);
      });
      this.pending = [];
      return;
    }

    const batch = this.db.batch();
    this.pending.forEach(({ ref, data, merge }) => {
      if (merge) batch.set(ref, data, { merge: true });
      else batch.set(ref, data);
    });
    await batch.commit();
    this.stats.written += this.pending.length;
    this.pending = [];
  }

  queueSet(collectionPath, id, data, { merge = false } = {}) {
    const ref = this.db.collection(collectionPath).doc(id);
    const payload = stripNulls({
      id,
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (!merge) {
      payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }
    this.pending.push({ ref, data: payload, merge });
    if (this.pending.length >= BATCH_LIMIT) {
      return this.flush();
    }
    return Promise.resolve();
  }

  queueSetOnRef(ref, id, data, { merge = false } = {}) {
    const payload = stripNulls({
      id,
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (!merge) {
      payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }
    this.pending.push({ ref, data: payload, merge });
    if (this.pending.length >= BATCH_LIMIT) {
      return this.flush();
    }
    return Promise.resolve();
  }

  ref(collection, id) {
    return this.db.collection(collection).doc(id);
  }

  subRef(parentCollection, parentId, subCollection, id) {
    return this.db
      .collection(parentCollection)
      .doc(parentId)
      .collection(subCollection)
      .doc(id);
  }

  async clearSeedDocuments(collections) {
    for (const collectionName of collections) {
      const snap = await this.db.collection(collectionName).get();
      const toDelete = snap.docs.filter((doc) => doc.id.startsWith(this.prefix));

      if (toDelete.length === 0) continue;

      console.log(`  Clearing ${toDelete.length} seed docs from ${collectionName}`);

      if (this.dryRun) {
        toDelete.forEach((doc) => console.log(`  [dry-run] delete ${doc.ref.path}`));
        this.stats.skipped += toDelete.length;
        continue;
      }

      for (let i = 0; i < toDelete.length; i += BATCH_LIMIT) {
        const batch = this.db.batch();
        toDelete.slice(i, i + BATCH_LIMIT).forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        this.stats.deleted += Math.min(BATCH_LIMIT, toDelete.length - i);
      }
    }
  }

  async clearSeedSubcollections(parentCollection, subCollectionName) {
    const parents = await this.db.collection(parentCollection).get();
    for (const parent of parents.docs) {
      if (!parent.id.startsWith(this.prefix)) continue;
      const subs = await parent.ref.collection(subCollectionName).get();
      const toDelete = subs.docs.filter((d) => d.id.startsWith(this.prefix));
      if (toDelete.length === 0) continue;

      console.log(
        `  Clearing ${toDelete.length} seed docs from ${parent.ref.path}/${subCollectionName}`,
      );

      if (this.dryRun) {
        toDelete.forEach((doc) => console.log(`  [dry-run] delete ${doc.ref.path}`));
        continue;
      }

      const batch = this.db.batch();
      toDelete.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      this.stats.deleted += toDelete.length;
    }
  }

  async finish() {
    await this.flush();
    return this.stats;
  }
}

module.exports = FirestoreSeedWriter;
