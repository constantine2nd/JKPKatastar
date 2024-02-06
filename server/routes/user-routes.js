import express from "express";
import {
  registerUser,
  addUser,
  updateUser,
  deleteUser,
  verifyEmail,
  authUser,
  getAllUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/adduservisitor").post(registerUser);
router.route("/adduser").post(protect, addUser);
router.route("/updateuser").put(protect, updateUser);
router.route("/verify-email").put(verifyEmail);
router.route("/:id").delete(protect, deleteUser);
router.route("/login").post(authUser);
router.route("/").get(protect, getAllUsers);

export default router;
