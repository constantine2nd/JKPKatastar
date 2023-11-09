import express from "express";
import { getAllGraveTypes } from "../controllers/graveTypesController.js";

const router = express.Router();

router.route("/all").get(getAllGraveTypes);
/*router.route("/all/:id").get();
router.route("/single/:id").get();
router.route("/single/:id").delete();

router.route("/").post(); */

export default router;
