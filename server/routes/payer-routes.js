import express from "express";
import {
  savePayer,
  deleteSinglePayer,
  updatePayer,
  getPayers,
} from "../controllers/payerController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR } from "../utils/constant.js";

const router = express.Router();

// Officer+ only (payer data is sensitive personal info)
router.route("/all/:id").get(protect, requireRole(OFFICER, ADMINISTRATOR), getPayers);
router.route("/addpayer/:id").post(protect, requireRole(OFFICER, ADMINISTRATOR), savePayer);
router.route("/updatepayer").put(protect, requireRole(OFFICER, ADMINISTRATOR), updatePayer);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR), deleteSinglePayer);

export default router;
