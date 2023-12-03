import express from "express";
import {
  savePayer,
  deleteSinglePayer,
  updatePayer,
  getPayers,
} from "../controllers/payerController.js";

const router = express.Router();

router.route("/all/:id").get(getPayers);
router.route("/addpayer/:id").post(savePayer);
router.route("/updatepayer").put(updatePayer);
router.route("/:id").delete(deleteSinglePayer);

export default router;
