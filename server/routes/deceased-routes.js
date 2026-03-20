import express from "express";
import {
  getDeceased,
  saveDeceased,
  getDeceasedPaginate,
  deleteSingleDeceased,
  updateDeceased,
  getDeceasedForGrave,
  getDeceasedSearch,
} from "../controllers/deceasedController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Public reads
router.route("/").get(getDeceased);
router.route("/paginate").get(getDeceasedPaginate);
router.route("/search").get(getDeceasedSearch);
router.route("/all/:id").get(getDeceasedForGrave);

// Officer+ writes
router.route("/adddeceased/:id").post(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), saveDeceased);
router.route("/updatedeceased").put(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), updateDeceased);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), deleteSingleDeceased);

export default router;
