import User from "../models/userModel.js";
import { MAINTAINER } from "../utils/constant.js";
import {
  sendVerifyEmail,
  sendResetPasswordEmail,
} from "../utils/emailClient.js";
import generateToken from "../utils/generateToken.js";
import { pseudoRandomToken } from "../utils/pseudoRandomGenerator.js";
import bcrypt from "bcryptjs";

const registerUser = async (req, res, next) => {
  //When an error is thrown inside asynchronous code you, you need to tell express to handle the error by passing it to the next function:
  try {
    const { name, email, password, repeatedPassword } = req.body;
    const userExists = await User.findOne({ email }); // Email must be unique

    if (userExists) {
      res.status(400).send({
        message: "err-user-exists",
      });
    }

    if (repeatedPassword != null && password == repeatedPassword) {
      // All good
    } else {
      res.status(400).send({
        message: "err-confirm-password",
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
    });
    console.log(newUser);
    if (newUser) {
      // Send email
      sendVerifyEmail(email, newUser.pseudoRandomToken);

      // Return successful respponse
      res.status(201).json({
        ...newUser._doc,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).send({
        message: "err-cannot-add-user",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  } finally {
  }
};

const addUser = async (req, res, next) => {
  //When an error is thrown inside asynchronous code you, you need to tell express to handle the error by passing it to the next function:
  try {
    const { name, email, password, role, isActive, isVerified, avatarUrl } = req.body;
    const userExists = await User.findOne({ email }); // Email must be unique

    if (userExists) {
      res.status(400).send({
        message: "err-user-exists",
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      isActive,
      isVerified,
      avatarUrl,
    });
    console.log(newUser);
    if (newUser) {
      // Return successful respponse
      res.status(201).json({
        ...newUser._doc,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).send({
        message: "Cannot add the user",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  } finally {
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, isVerified, avatarUrl, password } = req.body;

    if (role === MAINTAINER && req.userRole !== MAINTAINER) {
      return res.status(403).send({ message: "Forbidden: only a MAINTAINER can assign the MAINTAINER role." });
    }

    console.log(isActive);

    const filter = { email: email }; // Criteria to find a row
    const update = {
      name: name,
      isActive: isActive,
      role: role,
      isVerified: isVerified,
      avatarUrl: avatarUrl,
    }; // Fields to update

    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    console.log(updatedUser);

    if (updatedUser) {
      const { password: _pw, ...userDoc } = updatedUser._doc;
      res.status(200).json(userDoc);
    } else {
      res.status(400).send({
        message: "Cannot update the user",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await User.deleteOne({ _id: id });
    console.log(result);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      res.send({ id: id });
    } else {
      res.status(400).send({
        message: "Nothing to delete",
      });
    }
    // res.send(objToSend);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const filter = { pseudoRandomToken: token }; // Criteria to find a row
    const update = { isVerified: true }; // Fields to update

    const verifyUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    console.log(verifyUser);

    if (verifyUser) {
      res.status(200).json({
        ...verifyUser._doc,
      });
    } else {
      res.status(400).send({
        message: "Cannot verify the email address",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

const authUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      res.status(401).send({
        message: "err-username-mandatory",
      });
      return;
    }

    if (!password) {
      res.status(401).send({
        message: "err-password-mandatory",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).send({
        message: "err-invalid-credentials",
      });
      return;
    }

    if (user.isVerified === false) {
      res.status(401).send({
        message: "err-user-not-verified",
      });
      return;
    }

    if (await user.matchPassword(password)) {
      res.json({
        ...user._doc,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).send({
        message: "err-invalid-credentials",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

const resetPasswordInitiation = async (req, res, next) => {
  try {
    const { email } = req.body;
    const filter = { email: email }; // Criteria to find a row
    const update = { pseudoRandomToken: pseudoRandomToken(128) }; // Fields to update
    
    const user = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (user) {
      // Send email
      sendResetPasswordEmail(email, user.pseudoRandomToken);
      res.status(200).json({
        ...user._doc,
      });
    } else {
      res.status(400).send({
        message: "err-cannot-reset-password",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, "repeated-password": repeatedPassword } = req.body;
    const filter = { pseudoRandomToken: token }; // Criteria to find a row
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const update = { password: hashedPassword }; // Fields to update

    if (repeatedPassword == null || password !== repeatedPassword) {
      return res.status(400).send({
        message: "err-confirm-password",
      });
    }

    const resetPasswordUser = await User.findOneAndUpdate(
      filter,
      { ...update, pseudoRandomToken: null },
      { new: true }
    );

    console.log(resetPasswordUser);

    if (resetPasswordUser) {
      res.status(200).json({
        ...resetPasswordUser._doc,
      });
    } else {
      res.status(400).send({
        message: "err-cannot-reset-password",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (users) {
      res.send(users);
    } else {
      res.status(401);
      throw new Error("err-cannot-get-users");
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

export {
  registerUser,
  addUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resetPasswordInitiation,
  resetPassword,
  authUser,
  getAllUsers,
};
