import express from "express";
import { getGraveRequests, addGraveRequest, updateGraveRequest, deleteGraveRequest } from "../controllers/graveRequestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/all").get(protect, getGraveRequests);
router.route("/addgraverequest").post(addGraveRequest);
router.route("/updategraverequest").put(protect, updateGraveRequest);
router.route("/:id").delete(protect, deleteGraveRequest);

export default router;
