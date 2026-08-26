const algoliasearch = require('algoliasearch');
const fs = require('fs');

const SOURCE_APP_ID = 'YXJAJXC0PG';
const SOURCE_API_KEY = '3a91e1d0eb2d1070d979966c35f78ca6';
const SOURCE_INDEX_NAME = 'CATEGORIES';

const client = algoliasearch(SOURCE_APP_ID, SOURCE_API_KEY);
const index = client.initIndex(SOURCE_INDEX_NAME);

async function exportSelectedFields() {
  let records = [];

  console.log(
    '📤 Exporting product, brand, and category from:',
    SOURCE_INDEX_NAME,
  );

  await index.browseObjects({
    batch: (batch) => {
      // Extract only the fields you need
      const filteredBatch = batch.map((record) => ({
        objectID: record.objectID, // Keep objectID to maintain record integrity
        roots: record.roots || null,
        id: record.id || null,
      }));
      records = records.concat(filteredBatch);
    },
  });

  fs.writeFileSync(
    'algolia_selected_backup_Category.json',
    JSON.stringify(records, null, 4),
  );

  console.log(
    `✅ Export completed! Saved ${records.length} records to algolia_selected_backup.json`,
  );
}

exportSelectedFields().catch(console.error);
