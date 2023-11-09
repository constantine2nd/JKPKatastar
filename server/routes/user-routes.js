import express from "express";
import {
  registerUser,
  updateUser,
  deleteUser,
  authUser,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/adduser").post(registerUser);
router.route("/updateuser").put(updateUser);
router.route("/:id").delete(deleteUser);
router.route("/login").post(authUser);
router.route("/").get(getAllUsers);

export default router;
