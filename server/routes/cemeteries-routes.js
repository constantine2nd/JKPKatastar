import express from "express";
import { getAllCemeteries, updateCemetery } from "../controllers/cemeteriesController.js";

const router = express.Router();

router.route("/").get(getAllCemeteries);
router.route("/updatecemetery").put(updateCemetery);

export default router;
