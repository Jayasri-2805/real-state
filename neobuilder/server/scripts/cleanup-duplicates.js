import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Company from '../src/models/Company.js';
import User from '../src/models/User.js';
import * as masters from '../src/models/masters/index.js';

async function findModels() {
  const models = [Company, User];
  for (const key of Object.keys(masters)) {
    const val = masters[key];
    if (val && val.collection && val.modelName) models.push(val);
  }
  // dedupe by modelName
  const seen = new Set();
  return models.filter((m) => {
    if (!m || !m.modelName) return false;
    if (seen.has(m.modelName)) return false;
    seen.add(m.modelName);
    return true;
  });
}

function indexFieldsToArray(indexObj) {
  return Object.keys(indexObj || {}).filter((k) => indexObj[k] === 1 || indexObj[k] === -1);
}

async function cleanupModel(model) {
  const indexes = model.schema.indexes().filter(([, opts]) => opts && opts.unique);
  if (!indexes.length) return { model: model.modelName, removed: 0 };

  let totalRemoved = 0;
  for (const [indexFields] of indexes) {
    const fields = indexFieldsToArray(indexFields);
    if (!fields.length) continue;

    // Build aggregation _id grouping object
    const groupId = {};
    for (const f of fields) groupId[f] = `$${f}`;

    const dupGroups = await model.aggregate([
      { $group: { _id: groupId, count: { $sum: 1 }, docs: { $push: { _id: '$_id', updatedAt: '$updatedAt', createdAt: '$createdAt' } } } },
      { $match: { count: { $gt: 1 } } },
    ]).allowDiskUse(true);

    for (const g of dupGroups) {
      const docs = g.docs.sort((a, b) => {
        const aT = a.updatedAt || a.createdAt || 0;
        const bT = b.updatedAt || b.createdAt || 0;
        return bT - aT; // keep most recently updated
      });
      const toRemove = docs.slice(1).map((d) => d._id);
      if (toRemove.length) {
        const res = await model.deleteMany({ _id: { $in: toRemove } });
        totalRemoved += res.deletedCount || 0;
        console.log(`[cleanup] ${model.modelName}: removed ${res.deletedCount || 0} dup docs for index [${fields.join(',')}]`);
      }
    }
  }

  return { model: model.modelName, removed: totalRemoved };
}

async function main() {
  console.log('[cleanup] Starting duplicate cleanup (dry-run=false)');
  await connectDB();

  const models = await findModels();
  const summary = [];
  for (const m of models) {
    try {
      const result = await cleanupModel(m);
      summary.push(result);
    } catch (err) {
      console.error(`[cleanup] Error processing ${m.modelName}:`, err.message);
    }
  }

  console.log('[cleanup] Summary:');
  for (const s of summary) console.log(`  - ${s.model}: removed ${s.removed}`);

  await mongoose.disconnect();
  console.log('[cleanup] Done');
}

// Only run when invoked directly. This file is destructive: it deletes documents.
if (process.argv[1].endsWith('cleanup-duplicates.js')) {
  console.log('\nWARNING: This script will permanently delete duplicate documents from the database.');
  console.log('Set environment variable DRY_RUN=1 to perform a dry run (no deletions).');

  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
  if (dryRun) {
    console.log('[cleanup] Running in dry-run mode: no documents will be deleted.');
  }

  // Wrap deletion function to respect DRY_RUN
  const originalDeleteMany = mongoose.Model.deleteMany;
  if (dryRun) {
    mongoose.Model.deleteMany = async function (filter) {
      console.log('[dry-run] deleteMany', this.modelName, JSON.stringify(filter));
      return { deletedCount: 0 };
    };
  }

  main().catch((err) => {
    console.error('[cleanup] Fatal error:', err);
    process.exitCode = 1;
  });
}

export default {};
