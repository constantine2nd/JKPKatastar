import express from "express";
import {
  saveGrave,
  getGraves,
  getSingleGrave,
  deleteSingleGrave,
  getGravesForCemetery,
} from "../controllers/gravesController.js";

const router = express.Router();

router.route("/all").get(getGraves);
router.route("/all/:id").get(getGravesForCemetery);
router.route("/single/:id").get(getSingleGrave);
router.route("/single/:id").delete(deleteSingleGrave);

router.route("/single").post(saveGrave);

export default router;
