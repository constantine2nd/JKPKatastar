import User from "../models/userModel.js";

import generateToken from "../utils/generateToken.js";

const registerUser = async (req, res, next) => { //When an error is thrown inside asynchronous code you, you need to tell express to handle the error by passing it to the next function:
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email }); // Email must be unique

    if (userExists) {
      res.status(400).send({
        message: "User already exists",
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
    });
    console.log(newUser);
    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        password: newUser.password,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).send({
        message: "Cannot add the user",
      });
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;

    console.log(isActive);

    const filter = { email: email }; // Criteria to find a row
    const update = { name: name, isActive: isActive, role: role }; // Fields to update

    const updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    console.log(updatedUser);

    if (updatedUser) {
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        password: updatedUser.password,
      });
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

const authUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
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
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    next(err); // Inside async code you have to pass the error to the next function, else your api will crash
  }
};

export { registerUser, updateUser, deleteUser, authUser, getAllUsers };
