import express from "express";
import {
  getDeceased,
  saveDeceased,
} from "../controllers/deceasedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getDeceased);
router.route("/:id").post(protect, saveDeceased);

export default router;
