import Cemetery from "../models/cemeteryModel.js";
import Grave from "../models/graveModel.js";
import mongoose from "mongoose";

const getAllCemeteries = async (req, res, next) => {
  try {
    const cemeteries = await Cemetery.find();
    if (cemeteries) {
      res.send(cemeteries);
    } else {
      res.status(400).send({
        message: "Cannot get cemeteries",
      });
    }
  } catch (err) {
    next(err);
  }
};

const addCemetery = async (req, res, next) => {
  try {
    const { name, LAT, LON, zoom } = req.body;
    const newCemetery = await Cemetery.create({
      name,
      LAT,
      LON,
      zoom,
    });
    console.log(newCemetery);
    if (newCemetery) {
      res.status(201).json({
        _id: newCemetery._id,
        name: newCemetery.name,
        LAT: newCemetery.LAT,
        LON: newCemetery.LON,
        zoom: newCemetery.zoom,
      });
    } else {
      res.status(400).send({
        message: "Invalid cemeterydata",
      });
    }
  } catch (error) {
    next(error);
  }
};

const updateCemetery = async (req, res, next) => {
  try {
    const { _id, name, LAT, LON, zoom } = req.body;
    const filter = { _id: _id }; // Criteria to find a row
    const update = { name: name, LAT: LAT, LON: LON, zoom: zoom }; // Fields to update
    const updatedCemetery = await Cemetery.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (updatedCemetery) {
      res.status(200).json({
        _id: updatedCemetery._id,
        name: updatedCemetery.name,
        LAT: updatedCemetery.LAT,
        LON: updatedCemetery.LON,
        zoom: updatedCemetery.zoom,
      });
    } else {
      res.status(400).send({
        message: "Cannot update the cemetery",
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteCemetery = async (req, res, next) => {
  const id = req.params.id;
  try {
    const gravesCount = await Grave.aggregate([
      { $match: { cemetery: new mongoose.Types.ObjectId(id) } },
      { $count: "totalCount" },
    ]);
    console.log(gravesCount);
    if (gravesCount.length > 0) {
      const [{ totalCount }] = gravesCount;
      if (totalCount > 0) {
        res.status(400).send({
          message: "Cannot delete the cemetery",
        });
      }
    }

    const result = await Cemetery.deleteOne({ _id: id });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      res.send({ id: id });
    } else {
      res.status(400).send({
        message: "Nothing to delete",
      });
    }
  } catch (error) {
    next(error);
  }
};

export { getAllCemeteries, addCemetery, updateCemetery, deleteCemetery };
