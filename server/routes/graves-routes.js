import express from "express";
import {
  saveGrave,
  getGraves,
  getGravesPaginated,
  getSingleGrave,
  deleteSingleGrave,
  getGravesForCemetery,
  updateGrave,
  saveGravesFromExcel,
} from "../controllers/gravesController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR } from "../utils/constant.js";

const router = express.Router();

// Public reads
router.route("/paginate").get(getGravesPaginated);
router.route("/all").get(getGraves);
router.route("/all/:id").get(getGravesForCemetery);
router.route("/single/:id").get(getSingleGrave);

// Officer+ writes
router.route("/single").post(protect, requireRole(OFFICER, ADMINISTRATOR), saveGrave);
router.route("/single/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR), deleteSingleGrave);
router.route("/updategrave").put(protect, requireRole(OFFICER, ADMINISTRATOR), updateGrave);
router.route("/new-from-excel").post(protect, requireRole(OFFICER, ADMINISTRATOR), saveGravesFromExcel);

export default router;
