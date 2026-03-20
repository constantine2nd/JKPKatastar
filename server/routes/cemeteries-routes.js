import express from "express";
import { getAllCemeteries, addCemetery, updateCemetery, deleteCemetery } from "../controllers/cemeteriesController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Public read
router.route("/").get(getAllCemeteries);

// Officer+ writes
router.route("/addcemetery").post(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), addCemetery);
router.route("/updatecemetery").put(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), updateCemetery);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), deleteCemetery);

export default router;
