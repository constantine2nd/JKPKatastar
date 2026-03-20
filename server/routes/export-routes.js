import express from "express";
import { exportCollection } from "../controllers/exportController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { MAINTAINER } from "../utils/constant.js";

const router = express.Router();

router.get("/:collection", protect, requireRole(MAINTAINER), exportCollection);

export default router;
