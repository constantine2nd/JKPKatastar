import express from "express";
import {
  getDeceased,
  saveDeceased,
  getDeceasedPaginate,
} from "../controllers/deceasedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getDeceased);
router.route("/paginate").get(getDeceasedPaginate);
router.route("/:id").post(protect, saveDeceased);

export default router;
