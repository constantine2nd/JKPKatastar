import express from "express";
import { getAllCemeteries } from "../controllers/cemeteriesController.js";

const router = express.Router();

router.route("/").get(getAllCemeteries);

export default router;
