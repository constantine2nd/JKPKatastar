import express from "express";
import {
  savePayer,
  deleteSinglePayer,
  updatePayer,
} from "../controllers/payerController.js";

const router = express.Router();

router.route("/:id").post(savePayer);
router.route("/single/:id").delete(deleteSinglePayer);
router.route("/updatepayer").put(updatePayer);

export default router;
