import GraveType from "../models/graveTypeModel.js";
import mongoose from "mongoose";

const getAllGraveTypes = async (req, res, next) => {
  try {
    /* const graveType = new GraveType({
      name: "tip2",
      capacity: 6,
      description: "bla bla gggg rgdgegr",
    });
    const createdType = await graveType.save();
    console.log(createdType); */
    const graveTypes = await GraveType.find();

    if (graveTypes) {
      res.send(graveTypes);
    } else {
      res.status(401);
      throw new Error("Server error");
    }
  } catch (err) {
    next(err);
  }
};


const addGraveType = async (req, res) => {
  const { name, capacity, description } = req.body;

  const newGraveType = await GraveType.create({
    name,
    capacity,
    description,
  });
  console.log(newGraveType);
  if (newGraveType) {
    res.status(201).json({
      _id: newGraveType._id,
      name: newGraveType.name,
      capacity: newGraveType.capacity,
      description: newGraveType.description,
    });
  } else {
    res.status(400);
    throw new Error("Invalid grave type data");
  }
};

const updateGraveType = async (req, res) => {
  const { id, name, capacity, description } = req.body;
  console.log(req.body);
  const filter = { _id: id }; // Criteria to find a row
  const update = { name: name, capacity: capacity, description: description }; // Fields to update

  const updatedGraveType = await GraveType.findOneAndUpdate(filter, update, {new: true});

  console.log(updatedGraveType);
  
  if (updatedGraveType) {
    res.status(200).json({
      _id: updatedGraveType._id,
      name: updatedGraveType.name,
      capacity: updatedGraveType.capacity,
      description: updatedGraveType.description,
    });
  } else {
    res.status(400);
    throw new Error("Cannot update the grave type");
  }
};


const deleteGraveType = async (req, res, next) => {
  const id = req.params.id;
  try {GraveType
    const gravesTypesCount = await GraveType.aggregate([
      { $match: { graveType: new mongoose.Types.ObjectId(id) } },
      { $count: "totalCount" }
    ]);
    console.log(gravesTypesCount)
    if (gravesTypesCount.length > 0) {
      const [{totalCount}] = gravesTypesCount
      if (totalCount > 0) {
        res.status(400);
        throw new Error("Cannot delete the grave type");
      }
    }
    

    const result = await GraveType.deleteOne({ _id: id });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      res.send({ id: id });
    } else {
      res.json({ message: "Nothing to delete" });
    }
    // res.send(objToSend);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cannot delete the grave type" });
  }
};

export { getAllGraveTypes, addGraveType, updateGraveType, deleteGraveType };
