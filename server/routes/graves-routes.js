import express from "express";
import {
  saveGrave,
  getGraves,
  getSingleGrave,
  deleteSingleGrave,
  getGravesForCemetery,
  updateGrave,
  saveGravesFromExcel,
} from "../controllers/gravesController.js";

const router = express.Router();

router.route("/all").get(getGraves);
router.route("/all/:id").get(getGravesForCemetery);
router.route("/single/:id").get(getSingleGrave);
router.route("/single/:id").delete(deleteSingleGrave);
router.route("/updategrave").put(updateGrave);

router.route("/single").post(saveGrave);
router.route("/new-from-excel").post(saveGravesFromExcel);

export default router;
