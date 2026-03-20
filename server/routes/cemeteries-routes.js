import express from "express";
import { getAllCemeteries, addCemetery, updateCemetery, deleteCemetery } from "../controllers/cemeteriesController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR } from "../utils/constant.js";

const router = express.Router();

// Public read
router.route("/").get(getAllCemeteries);

// Officer+ writes
router.route("/addcemetery").post(protect, requireRole(OFFICER, ADMINISTRATOR), addCemetery);
router.route("/updatecemetery").put(protect, requireRole(OFFICER, ADMINISTRATOR), updateCemetery);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR), deleteCemetery);

export default router;
