import express from "express";
import {
  getDeceased,
  saveDeceased,
  getDeceasedPaginate,
  deleteSingleDeceased,
  updateDeceased,
  getDeceasedForGrave,
  getDeceasedSearch,
} from "../controllers/deceasedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getDeceased);
router.route("/paginate").get(getDeceasedPaginate);
router.route("/search").get(getDeceasedSearch);
router.route("/all/:id").get(getDeceasedForGrave);
router.route("/adddeceased/:id").post(saveDeceased);
router.route("/updatedeceased").put(updateDeceased);
router.route("/:id").delete(deleteSingleDeceased);

export default router;
