import mongoose from "mongoose";
import GraveRequest from "../models/graveRequestModel.js";
import Grave from "../models/graveModel.js";
import { addLog } from "../utils/log.js";

const getGraveRequests = async (req, res, next) => {
  try {
    const allRows = await GraveRequest.find().sort({ createdAt: "desc" });
    if (allRows) {
      addLog(req.userId, "GET_GRAVE_REQUESTS", { count: allRows.length });
      res.send(allRows);
    } else {
      res.status(400).send({
        message: "Cannot get cemeteries",
      });
    }
  } catch (err) {
    next(err);
  }
};

const addGraveRequest = async (req, res, next) => {
  try {
    const { graveId, name, surname, email, phone, status, createdAt } =
      req.body;

    const foundGrave = await Grave.findById(graveId);
    if (!foundGrave) {
      return res.status(404).send({ message: "Grave not found" });
    }
    if (foundGrave.status === "OCCUPIED") {
      res.status(400).send({
        message: "Grave is not free",
      });
    } else {
      foundGrave.status = "OCCUPIED";
      const updatedGrave = await foundGrave.save();
      console.log(updatedGrave);
      const newRow = await GraveRequest.create({
        grave: new mongoose.Types.ObjectId(graveId),
        name: name,
        surname: surname,
        email: email,
        phone: phone,
        status: status,
        createdAt: createdAt,
      });
      console.log(newRow);
      if (newRow) {
        addLog(req.userId || "visitor", "CREATE_GRAVE_REQUEST", newRow);
        res.status(201).json({
          _id: newRow._id,
          grave: newRow.grave,
          name: newRow.name,
          surname: newRow.surname,
          email: newRow.email,
          phone: newRow.phone,
          status: newRow.status,
          createdAt: newRow.createdAt,
        });
      } else {
        res.status(400).send({
          message: "Invalid Grave Request data",
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

const updateGraveRequest = async (req, res, next) => {
  try {
    const { _id, status, name, surname, email, phone, createdAt } = req.body;

    const existingRequest = await GraveRequest.findById(_id);
    if (!existingRequest) {
      return res.status(404).send({ message: "Grave request not found" });
    }

    // Free the grave when a request is denied
    if (status === "DENIED" && existingRequest.status !== "DENIED") {
      await Grave.findByIdAndUpdate(existingRequest.grave, { status: "FREE" });
    }

    const filter = { _id: _id };
    const update = {
      status: status,
      name: name,
      surname: surname,
      email: email,
      phone: phone,
      createdAt: createdAt,
    };

    const updatedRow = await GraveRequest.findOneAndUpdate(filter, update, {
      new: true,
    });

    console.log(updatedRow);

    if (updatedRow) {
      addLog(req.userId, "UPDATE_GRAVE_REQUEST", { id: updatedRow._id, status: updatedRow.status });
      res.status(200).json({
        _id: updatedRow._id,
        grave: updatedRow.grave,
        name: updatedRow.name,
        surname: updatedRow.surname,
        email: updatedRow.email,
        phone: updatedRow.phone,
        createdAt: updatedRow.createdAt,
        status: updatedRow.status,
      });
    } else {
      res.status(400).send({
        message: "Cannot update the grave request",
      });
    }
  } catch (err) {
    next(err);
  }
};

const deleteGraveRequest = async (req, res, next) => {
  const id = req.params.id;
  try {
    const request = await GraveRequest.findById(id);
    if (!request) {
      return res.status(404).send({ message: "Nothing to delete" });
    }

    // Free the grave if the request was still pending
    if (request.status === "REQUESTED") {
      await Grave.findByIdAndUpdate(request.grave, { status: "FREE" });
    }

    const result = await GraveRequest.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      addLog(req.userId, "DELETE_GRAVE_REQUEST", { id });
      res.send({ id: id });
    } else {
      res.status(400).send({ message: "Nothing to delete" });
    }
  } catch (err) {
    next(err);
  }
};

export {
  getGraveRequests,
  addGraveRequest,
  updateGraveRequest,
  deleteGraveRequest,
};
