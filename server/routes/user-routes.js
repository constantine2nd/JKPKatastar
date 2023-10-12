import express from "express";
import { registerUser, authUser } from "../controllers/userController.js";

const router = express.Router();
router.route("/adduser").post(registerUser);
router.route("/login").post(authUser);

export default router;
