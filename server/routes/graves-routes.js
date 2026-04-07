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
  getContractExpiryReport,
} from "../controllers/gravesController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Public reads
router.route("/contract-expiry-report").get(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), getContractExpiryReport);
router.route("/paginate").get(getGravesPaginated);
router.route("/all").get(getGraves);
router.route("/all/:id").get(getGravesForCemetery);
router.route("/single/:id").get(getSingleGrave);

// Officer+ writes
router.route("/single").post(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), saveGrave);
router.route("/single/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), deleteSingleGrave);
router.route("/updategrave").put(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), updateGrave);
router.route("/new-from-excel").post(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), saveGravesFromExcel);

export default router;
