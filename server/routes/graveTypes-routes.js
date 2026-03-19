import express from "express";
import { getAllGraveTypes, addGraveType, updateGraveType, deleteGraveType } from "../controllers/graveTypesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/all").get(getAllGraveTypes);
router.route("/addgravetype").post(protect, addGraveType);
router.route("/updategravetype").put(protect, updateGraveType);
router.route("/:id").delete(protect, deleteGraveType);

export default router;
