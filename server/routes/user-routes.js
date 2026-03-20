import express from "express";
import {
  registerUser,
  addUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resetPasswordInitiation,
  resetPassword,
  authUser,
  getAllUsers,
} from "../controllers/userController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { ADMINISTRATOR } from "../utils/constant.js";

const router = express.Router();

// Public
router.route("/adduservisitor").post(registerUser);
router.route("/login").post(authUser);
router.route("/verify-email").put(verifyEmail);
router.route("/reset-password-initiation").post(resetPasswordInitiation);
router.route("/reset-password").put(resetPassword);

// Administrator only
router.route("/adduser").post(protect, requireRole(ADMINISTRATOR), addUser);
router.route("/updateuser").put(protect, requireRole(ADMINISTRATOR), updateUser);
router.route("/:id").delete(protect, requireRole(ADMINISTRATOR), deleteUser);
router.route("/").get(protect, requireRole(ADMINISTRATOR), getAllUsers);

export default router;
