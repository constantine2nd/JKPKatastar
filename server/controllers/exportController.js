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
 * Convert a lean Mongoose document to MongoDB Extended JSON format
 * so that the output is directly re-importable via the import wizard.
 *   ObjectId  → { "$oid": "..." }
 *   Date      → { "$date": "..." }
 */
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

// GET /api/export/:collection
const exportCollection = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const Model = COLLECTION_MAP[collection];

    if (!Model) {
      return res.status(400).json({
        message: `Unknown collection "${collection}". Allowed: ${Object.keys(COLLECTION_MAP).join(", ")}`,
      });
    }

    const docs = await Model.find().lean();
    const converted = docs.map(toExtendedJson);
    const json = JSON.stringify(converted, null, 2);

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${collection}-export.json"`
    );
    res.send(json);
  } catch (err) {
    next(err);
  }
};

export { exportCollection };
