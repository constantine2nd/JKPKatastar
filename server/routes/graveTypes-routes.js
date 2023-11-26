import express from "express";
import { getAllGraveTypes, addGraveType, updateGraveType, deleteGraveType } from "../controllers/graveTypesController.js";

const router = express.Router();

router.route("/all").get(getAllGraveTypes);
router.route("/addgravetype").post(addGraveType);
router.route("/updategravetype").put(updateGraveType);
router.route("/:id").delete(deleteGraveType);

export default router;
