import express from "express";
import {
  getDeceased,
  saveDeceased,
  getDeceasedPaginate,
  deleteSingleDeceased,
  updateDeceased,
} from "../controllers/deceasedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getDeceased);
router.route("/paginate").get(getDeceasedPaginate);
router.route("/:id").post(protect, saveDeceased);
router.route("/single/:id").delete(deleteSingleDeceased);
router.route("/updatedeceased").put(updateDeceased);

export default router;
