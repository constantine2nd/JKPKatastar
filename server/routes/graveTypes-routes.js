import express from "express";
import { getAllGraveTypes, addGraveType, updateGraveType, deleteGraveType } from "../controllers/graveTypesController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Public read
router.route("/all").get(getAllGraveTypes);

// Officer+ writes
router.route("/addgravetype").post(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), addGraveType);
router.route("/updategravetype").put(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), updateGraveType);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), deleteGraveType);

export default router;
