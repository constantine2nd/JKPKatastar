import mongoose from "mongoose";
import zlib from "zlib";
import Cemetery from "../models/cemeteryModel.js";
import GraveType from "../models/graveTypeModel.js";
import Grave from "../models/graveModel.js";
import Deceased from "../models/deceasedModel.js";
import Payer from "../models/payerModel.js";
import User from "../models/userModel.js";

// Order matters: referenced collections before referencing ones
const BACKUP_ORDER = ["gravetypes", "cemeteries", "users", "graves", "deceaseds", "payers"];

const COLLECTION_MAP = {
  cemeteries: Cemetery,
  gravetypes: GraveType,
  graves: Grave,
  deceaseds: Deceased,
  payers: Payer,
  users: User,
};

function toExtendedJson(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof mongoose.Types.ObjectId) return { $oid: value.toHexString() };
  if (value instanceof Date) return { $date: value.toISOString() };
  if (Array.isArray(value)) return value.map(toExtendedJson);
  if (typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = toExtendedJson(value[key]);
    }
    return result;
  }
  return value;
}

function convertExtendedJson(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(convertExtendedJson);
  if (typeof value === "object") {
    if ("$oid" in value) return new mongoose.Types.ObjectId(value.$oid);
    if ("$date" in value) return new Date(value.$date);
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = convertExtendedJson(value[key]);
    }
    return result;
  }
  return value;
}

// GET /api/backup/full
const fullBackup = async (req, res, next) => {
  try {
    const collections = {};
    for (const name of BACKUP_ORDER) {
      const docs = await COLLECTION_MAP[name].find().lean();
      collections[name] = docs.map(toExtendedJson);
    }

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      collections,
    };

    const timestamp = new Date().toISOString().slice(0, 10);
    const json = Buffer.from(JSON.stringify(backup, null, 2), "utf8");
    zlib.gzip(json, (err, compressed) => {
      if (err) return next(err);
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", `attachment; filename="backup-${timestamp}.json.gz"`);
      res.send(compressed);
    });
    return;
  } catch (err) {
    next(err);
  }
};

// POST /api/backup/restore
const fullRestore = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    let rawBuffer = req.file.buffer;
    const isGzip = rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b;
    if (isGzip) {
      try {
        rawBuffer = zlib.gunzipSync(rawBuffer);
      } catch {
        return res.status(400).json({ message: "Failed to decompress gzip file." });
      }
    }

    let backup;
    try {
      backup = JSON.parse(rawBuffer.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid JSON file." });
    }

    if (!backup.collections || typeof backup.collections !== "object") {
      return res.status(400).json({ message: "Invalid backup format." });
    }

    const results = {};
    for (const name of BACKUP_ORDER) {
      const records = backup.collections[name];
      if (!records || !Array.isArray(records) || records.length === 0) {
        results[name] = { inserted: 0, total: 0, errors: [] };
        continue;
      }

      const converted = records.map(convertExtendedJson);
      try {
        const result = await COLLECTION_MAP[name].insertMany(converted, {
          ordered: false,
          rawResult: true,
        });
        results[name] = { inserted: result.insertedCount ?? converted.length, total: converted.length, errors: [] };
      } catch (err) {
        if (err.name === "MongoBulkWriteError" || err.code === 11000) {
          const inserted = err.result?.nInserted ?? 0;
          const errors = (err.writeErrors ?? []).map((e) => ({
            index: e.index,
            message: e.errmsg ?? e.message,
          }));
          results[name] = { inserted, total: converted.length, errors };
        } else {
          throw err;
        }
      }
    }

    const totalInserted = Object.values(results).reduce((s, r) => s + r.inserted, 0);
    const totalRecords = Object.values(results).reduce((s, r) => s + r.total, 0);
    const hasErrors = Object.values(results).some((r) => r.errors.length > 0);

    res.status(hasErrors ? 207 : 200).json({ results, totalInserted, totalRecords });
  } catch (err) {
    next(err);
  }
};

export { fullBackup, fullRestore };
