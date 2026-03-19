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
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/all").get(getGraves);
router.route("/all/:id").get(getGravesForCemetery);
router.route("/single/:id").get(getSingleGrave);
router.route("/single/:id").delete(protect, deleteSingleGrave);
router.route("/updategrave").put(protect, updateGrave);

router.route("/single").post(protect, saveGrave);
router.route("/new-from-excel").post(protect, saveGravesFromExcel);

export default router;
