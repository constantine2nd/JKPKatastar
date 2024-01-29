import express from "express";
import {
  registerUser,
  updateUser,
  deleteUser,
  authUser,
  getAllUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/adduservisitor").post(registerUser);
router.route("/adduser").post(protect, registerUser);
router.route("/updateuser").put(protect, updateUser);
router.route("/:id").delete(protect, deleteUser);
router.route("/login").post(authUser);
router.route("/").get(protect, getAllUsers);

export default router;
