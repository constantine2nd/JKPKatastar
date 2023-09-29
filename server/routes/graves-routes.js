import express from "express";
import {
  saveGrave,
  getGraves,
  getSingleGrave,
  deleteSingleGrave,
} from "../controllers/gravesController.js";

const router = express.Router();

router.route("/").get(getGraves);
router.route("/:id").get(getSingleGrave);
router.route("/:id").delete(deleteSingleGrave);
router.route("/").post(saveGrave);

export default router;
