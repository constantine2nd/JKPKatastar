import express from "express";
import { saveDeacesed } from "../controllers/deceasedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:id").post(protect, saveDeacesed);

export default router;
