/**
 * Validates in-memory FK relations in seed datasets (no Firestore required).
 */
const { buildCatalogDatasets } = require('./datasets/catalog');
const { buildCmsDatasets } = require('./datasets/cms');
const { buildUserDatasets } = require('./datasets/users');

function indexById(docs) {
  const map = new Map();
  docs.forEach((doc) => {
    if (doc.id) map.set(doc.id, doc);
  });
  return map;
}

function runChecks() {
  const catalog = buildCatalogDatasets();
  const cms = buildCmsDatasets();
  const users = buildUserDatasets();

  const flat = [...catalog, ...cms];
  const byId = indexById(flat);

  const checks = [];

  function assert(label, ok) {
    checks.push({ label, ok });
  }

  // category → collection
  flat
    .filter((d) => d.collection === 'category')
    .forEach((cat) => {
      assert(
        `category ${cat.id} → collection ${cat.data.collection_id}`,
        byId.has(cat.data.collection_id),
      );
    });

  // product → brand, category, collection
  flat
    .filter((d) => d.collection === 'product')
    .forEach((p) => {
      assert(`product ${p.id} → brand`, byId.has(p.data.brand_id));
      assert(`product ${p.id} → category`, byId.has(p.data.category_id));
      assert(`product ${p.id} → collection`, byId.has(p.data.collection_id));
    });

  // variant → product
  flat
    .filter((d) => d.collection === 'product-variants')
    .forEach((v) => {
      assert(`variant ${v.id} → product`, byId.has(v.data.product_id));
    });

  // inventory → product
  flat
    .filter((d) => d.collection === 'inventory')
    .forEach((inv) => {
      assert(`inventory ${inv.id} → product`, byId.has(inv.data.productId));
    });

  // project → products
  flat
    .filter((d) => d.collection === 'project')
    .forEach((proj) => {
      (proj.data.featured_product_ids || []).forEach((pid) => {
        assert(`project ${proj.id} → product ${pid}`, byId.has(pid));
      });
    });

  // showRoom → project (optional)
  flat
    .filter((d) => d.collection === 'showRoom' && d.data.project_id)
    .forEach((sr) => {
      assert(`showRoom ${sr.id} → project`, byId.has(sr.data.project_id));
    });

  const productIds = new Set(
    flat.filter((d) => d.collection === 'product').map((d) => d.id),
  );

  // orders → products in items
  users.orders.forEach((order) => {
    (order.data.items || []).forEach((item) => {
      assert(
        `order ${order.id} → product ${item.productId}`,
        productIds.has(item.productId),
      );
    });
    assert(
      `order ${order.id} → customer`,
      order.data.userID === users.users[0].id,
    );
  });

  // custom request → product + customer
  users.customRequests.forEach((cr) => {
    assert(`customRequest → product`, productIds.has(cr.data.product_id));
    assert(`customRequest → customer`, cr.data.customer_id === users.users[0].id);
  });

  const failed = checks.filter((c) => !c.ok);
  checks.forEach(({ label, ok }) => {
    console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  });

  console.log(`\n${checks.length - failed.length}/${checks.length} relation checks passed`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

console.log('=== Seed dataset relation verify ===\n');
runChecks();
