import express from "express";
import {
  registerUser,
  authUser,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/adduser").post(registerUser);
router.route("/login").post(authUser);
router.route("/").get(getAllUsers);

export default router;
