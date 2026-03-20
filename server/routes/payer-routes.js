import express from "express";
import {
  savePayer,
  deleteSinglePayer,
  updatePayer,
  getPayers,
} from "../controllers/payerController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Officer+ only (payer data is sensitive personal info)
router.route("/all/:id").get(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), getPayers);
router.route("/addpayer/:id").post(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), savePayer);
router.route("/updatepayer").put(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), updatePayer);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), deleteSinglePayer);

export default router;
