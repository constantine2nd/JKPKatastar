import express from "express";
import { getGraveRequests, addGraveRequest, updateGraveRequest, deleteGraveRequest } from "../controllers/graveRequestController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { OFFICER, ADMINISTRATOR } from "../utils/constant.js";

const router = express.Router();

// Public: visitors can submit grave requests
router.route("/addgraverequest").post(addGraveRequest);

// Officer+ only
router.route("/all").get(protect, requireRole(OFFICER, ADMINISTRATOR), getGraveRequests);
router.route("/updategraverequest").put(protect, requireRole(OFFICER, ADMINISTRATOR), updateGraveRequest);
router.route("/:id").delete(protect, requireRole(OFFICER, ADMINISTRATOR), deleteGraveRequest);

export default router;
