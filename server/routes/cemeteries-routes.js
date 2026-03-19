import express from "express";
import { getAllCemeteries, addCemetery, updateCemetery, deleteCemetery } from "../controllers/cemeteriesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAllCemeteries);
router.route("/addcemetery").post(protect, addCemetery);
router.route("/updatecemetery").put(protect, updateCemetery);
router.route("/:id").delete(protect, deleteCemetery);

export default router;
