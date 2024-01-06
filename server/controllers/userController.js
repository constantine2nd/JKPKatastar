import User from "../models/userModel.js";

import generateToken from "../utils/generateToken.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).send({
      message: 'User already exists'
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
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400).send({
      message: 'Cannot add the user'
    });
  }
};

const updateUser = async (req, res) => {
  const { name, email, role, isActive } = req.body;

  console.log(isActive)
  
  const filter = { email: email }; // Criteria to find a row
  const update = { name: name, isActive: isActive, role: role }; // Fields to update

  const updatedUser = await User.findOneAndUpdate(filter, update, {new: true});

  console.log(updatedUser);
  
  if (updatedUser) {
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });
  } else {
    res.status(400).send({
      message: 'Cannot update the user'
    });
  }
};


const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await User.deleteOne({ _id: id });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      res.send({ id: id });
    } else {
      res.status(400).send({
        message: 'Nothing to delete'
      });
    }
    // res.send(objToSend);
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      message: `Cannot delete the user. ${error}`
    });
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
    next(err);
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
    next(err);
  }
};

export { registerUser, updateUser, deleteUser, authUser, getAllUsers };
