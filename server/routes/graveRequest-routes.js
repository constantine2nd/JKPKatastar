import express from "express";
import { getGraveRequests, addGraveRequest, updateGraveRequest, deleteGraveRequest } from "../controllers/graveRequestController.js";

const router = express.Router();

router.route("/all").get(getGraveRequests);
router.route("/addgraverequest").post(addGraveRequest);
router.route("/updategraverequest").put(updateGraveRequest);
router.route("/:id").delete(deleteGraveRequest);

export default router;
