import express from "express";
import multer from "multer";
import { bulkImport, previewImport } from "../controllers/importController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { MAINTAINER } from "../utils/constant.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/preview", protect, requireRole(MAINTAINER), upload.single("file"), previewImport);
router.post("/:collection", protect, requireRole(MAINTAINER), upload.single("file"), bulkImport);

export default router;
