import mongoose from "mongoose";
import Cemetery from "../models/cemeteryModel.js";
import GraveType from "../models/graveTypeModel.js";
import Grave from "../models/graveModel.js";
import Deceased from "../models/deceasedModel.js";
import Payer from "../models/payerModel.js";
import User from "../models/userModel.js";

const COLLECTION_MAP = {
  cemeteries: Cemetery,
  gravetypes: GraveType,
  graves: Grave,
  deceaseds: Deceased,
  payers: Payer,
  users: User,
};

/**
 * Convert MongoDB Extended JSON values to native JS types.
 * Handles { "$oid": "..." } → ObjectId and { "$date": "..." } → Date.
 */
function convertExtendedJson(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(convertExtendedJson);
  }

  if (typeof value === "object") {
    if ("$oid" in value) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    if ("$date" in value) {
      return new Date(value.$date);
    }
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = convertExtendedJson(value[key]);
    }
    return result;
  }

  return value;
}

// POST /api/import/:collection
const bulkImport = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const Model = COLLECTION_MAP[collection];

    if (!Model) {
      return res.status(400).json({
        message: `Unknown collection "${collection}". Allowed: ${Object.keys(COLLECTION_MAP).join(", ")}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    let records;
    try {
      records = JSON.parse(req.file.buffer.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid JSON file." });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({ message: "JSON must be an array of records." });
    }

    const converted = records.map(convertExtendedJson);

    const result = await Model.insertMany(converted, {
      ordered: false,
      rawResult: true,
    });

    const inserted = result.insertedCount ?? converted.length;
    return res.status(200).json({ inserted, total: converted.length, errors: [] });
  } catch (err) {
    // insertMany with ordered:false throws BulkWriteError but still has partial results
    if (err.name === "MongoBulkWriteError" || err.code === 11000) {
      const inserted = err.result?.nInserted ?? 0;
      const errors = (err.writeErrors ?? []).map((e) => ({
        index: e.index,
        message: e.errmsg ?? e.message,
      }));
      return res.status(207).json({
        inserted,
        total: err.result?.insertedCount !== undefined
          ? err.result.nInserted + errors.length
          : errors.length + inserted,
        errors,
      });
    }
    next(err);
  }
};

// GET /api/import/preview  (reads first N records from uploaded file, no DB write)
const previewImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    let records;
    try {
      records = JSON.parse(req.file.buffer.toString("utf8"));
    } catch {
      return res.status(400).json({ message: "Invalid JSON file." });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({ message: "JSON must be an array of records." });
    }

    const preview = records.slice(0, 10);
    return res.status(200).json({ total: records.length, preview });
  } catch (err) {
    next(err);
  }
};

export { bulkImport, previewImport };
