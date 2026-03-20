import express from "express";
import { getGraveRequests, addGraveRequest, updateGraveRequest, deleteGraveRequest } from "../controllers/graveRequestController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Public: visitors can submit grave requests
router.route("/addgraverequest").post(addGraveRequest);

// Officer+ only
router.route("/all").get(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), getGraveRequests);
router.route("/updategraverequest").put(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), updateGraveRequest);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR, MAINTAINER), deleteGraveRequest);

export default router;
