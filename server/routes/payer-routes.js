import express from "express";
import {
  savePayer,
  deleteSinglePayer,
  updatePayer,
  getPayers,
} from "../controllers/payerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/all/:id").get(protect, getPayers);
router.route("/addpayer/:id").post(protect, savePayer);
router.route("/updatepayer").put(protect, updatePayer);
router.route("/:id").delete(protect, deleteSinglePayer);

export default router;
