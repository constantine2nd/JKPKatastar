import express from "express";
import multer from "multer";
import { fullBackup, fullRestore } from "../controllers/backupController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { MAINTAINER } from "../utils/constant.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.get("/full", protect, requireRole(MAINTAINER), fullBackup);
router.post("/restore", protect, requireRole(MAINTAINER), upload.single("file"), fullRestore);

export default router;
