import Payer from "../models/payerModel.js";
import { Types } from "mongoose";

const getPayers = async (req, res, next) => {
  const graveId = req.params.id;
  try {
    const payers = await Payer.find({ grave: graveId });
    if (payers) {
      res.send(payers);
    } else {
      res.status(400).send({
        message: "Server error",
      });
    }
  } catch (error) {
    next(error);
  }
};

const savePayer = async (req, res, next) => {
  // console.log(req.body);
  const sentPayer = req.body;
  console.log(sentPayer);
  const graveId = req.params.id;
  const payer = new Payer({
    name: sentPayer.name,
    surname: sentPayer.surname,
    address: sentPayer.address,
    phone: sentPayer.phone,
    jmbg: sentPayer.jmbg,
    active: sentPayer.active,
    grave: graveId,
  });

  //const createdGrave = await grave.save();

  try {
    const updateSucced = await Payer.updateMany(
      { grave: new Types.ObjectId(graveId) },
      { $set: { active: false } }
    );
    const createdPayer = await payer.save();
    console.log(updateSucced);
    console.log(createdPayer);
    res.json(createdPayer);
  } catch (error) {
    return res.json({ message: "Cound not store data" });
  }
  //    client.close()

  console.log("POST request");
};

const deleteSinglePayer = async (req, res, next) => {
  const payerId = req.params.id;
  try {
    const result = await Payer.deleteOne({ _id: payerId });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      res.send({ id: payerId });
    } else {
      res.json({ message: "Nothing to delete" });
    }
    // res.send(objToSend);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not get data" });
  }
};

const updatePayer = async (req, res) => {
  const { _id, name, surname, address, phone, jmbg, active = true } = req.body;
  console.log(req.body);

  const filter = { _id: _id }; // Criteria to find a row
  const update = {
    name: name,
    surname: surname,
    address: address,
    phone: phone,
    jmbg: jmbg,
    active: active,
  }; // Fields to update

  const updatedPayer = await Payer.findOneAndUpdate(
    filter,
    update
    /*   , {
    new: true,
  } */
  );

  console.log(updatedPayer);

  if (updatedPayer) {
    res.status(200).json({
      _id: updatedPayer._id,
      name: updatedPayer.name,
      surname: updatedPayer.surname,
      address: updatedPayer.address,
      phone: updatedPayer.phone,
      jmbg: updatedPayer.jmbg,
      active: updatedPayer.active,
    });
  } else {
    res.status(400);
    throw new Error("Cannot update the payer");
  }
};

export { savePayer, deleteSinglePayer, updatePayer, getPayers };
