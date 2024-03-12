import GraveType from "../models/graveTypeModel.js";
import mongoose from "mongoose";

const getAllGraveTypes = async (req, res, next) => {
  try {
    const graveTypes = await GraveType.find();
    if (graveTypes) {
      res.send(graveTypes);
    } else {
      res.status(400).send({
        message: "Server error",
      });
    }
  } catch (err) {
    next(err);
  }
};

const addGraveType = async (req, res, next) => {
  try {
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
      res.status(400).send({
        message: "Invalid grave type data",
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateGraveType = async (req, res, next) => {
  try {
    const { _id, name, capacity, description } = req.body;
    console.log(req.body);
    const filter = { _id: _id }; // Criteria to find a row
    const update = { name: name, capacity: capacity, description: description }; // Fields to update
    const updatedGraveType = await GraveType.findOneAndUpdate(filter, update, {
      new: true,
    });
    if (updatedGraveType) {
      res.status(200).json({
        _id: updatedGraveType._id,
        name: updatedGraveType.name,
        capacity: updatedGraveType.capacity,
        description: updatedGraveType.description,
      });
    } else {
      res.status(400).send({
        message: "Cannot update the grave type",
      });
    }
  } catch (err) {
    next(err);
  }
};

const deleteGraveType = async (req, res, next) => {
  const id = req.params.id;
  try {
    //Provera da li ima grobnih mesta ovog tipa
    const gravesCount = await Grave.aggregate([
      { $match: { graveType: new mongoose.Types.ObjectId(id) } },
      { $count: "totalCount" },
    ]);
    console.log(gravesCount);
    if (gravesCount.length > 0) {
      const [{ totalCount }] = gravesCount;
      if (totalCount > 0) {
        res.status(400).send({
          message:
            "Cannot delete the grave type, you must first delete all graves of this grave type",
        });
        return;
      }
    }

    const result = await GraveType.deleteOne({ _id: id });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log(`deleted row with id ${id}`);
      res.send({ id: id });
    } else {
      res.status(400).send({
        message: "Nothing to delete",
      });
    }
  } catch (err) {
    next(err);
  }
};

export { getAllGraveTypes, addGraveType, updateGraveType, deleteGraveType };
