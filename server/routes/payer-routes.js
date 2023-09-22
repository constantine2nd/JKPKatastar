import express from "express";
import { savePayer } from "../controllers/payerController.js";

const router = express.Router();

router.route("/:id").post(savePayer);

export default router;
