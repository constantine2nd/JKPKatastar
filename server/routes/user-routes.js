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
import { ADMINISTRATOR, MAINTAINER } from "../utils/constant.js";

const router = express.Router();

// Public
router.route("/adduservisitor").post(registerUser);
router.route("/login").post(authUser);
router.route("/verify-email").put(verifyEmail);
router.route("/reset-password-initiation").post(resetPasswordInitiation);
router.route("/reset-password").put(resetPassword);

// Administrator + Maintainer
router.route("/adduser").post(protect, requireRole(ADMINISTRATOR, MAINTAINER), addUser);
router.route("/updateuser").put(protect, requireRole(ADMINISTRATOR, MAINTAINER), updateUser);
router.route("/:id").delete(protect, requireRole(ADMINISTRATOR, MAINTAINER), deleteUser);
router.route("/").get(protect, requireRole(ADMINISTRATOR, MAINTAINER), getAllUsers);

export default router;
