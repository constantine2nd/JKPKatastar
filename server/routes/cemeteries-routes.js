import express from "express";
import { getAllCemeteries, addCemetery, updateCemetery, deleteCemetery } from "../controllers/cemeteriesController.js";

const router = express.Router();

router.route("/").get(getAllCemeteries);
router.route("/addcemetery").post(addCemetery);
router.route("/updatecemetery").put(updateCemetery);
router.route("/:id").delete(deleteCemetery);

export default router;
