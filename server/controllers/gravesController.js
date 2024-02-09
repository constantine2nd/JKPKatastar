import Grave from "../models/graveModel.js";
import Deceased from "../models/deceasedModel.js";
import Payer from "../models/payerModel.js";
import GraveType from "../models/graveTypeModel.js";
//import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const createDateFromString = (dateString) => {
  const [day, month, year] = dateString.split("/");
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  );
};

const saveGravesFromExcel = async (req, res, next) => {
  // console.log(req.body);
  const { graves, cemeteryId } = req.body;
  // console.log(graves);
  graves.forEach(async (grave) => {
    const graveType = await GraveType.find({ name: grave.type });
    console.log(graveType[0]);
    console.log(graveType[0]._id);
    const newGrave = new Grave({
      number: grave.number,
      row: grave.row,
      field: grave.field,
      LAT: grave.LAT,
      LON: grave.LON,
      graveType: new mongoose.Types.ObjectId(graveType[0]._id),
      cemetery: new mongoose.Types.ObjectId(cemeteryId),
    });
    const createdGrave = await newGrave.save();

    if (grave.deceased && createdGrave) {
      grave.deceased.forEach(async (dec) => {
        const deacesed = new Deceased({
          name: dec.name,
          surname: dec.surname,
          dateBirth: createDateFromString(dec.birth),
          dateDeath: createDateFromString(dec.death),
          grave: new mongoose.Types.ObjectId(createdGrave._id),
        });
        const savedDeceased = await deacesed.save();
      });
    }
  });
};

const saveGrave = async (req, res, next) => {
  console.log(req.body);
  const sentGrave = req.body;
  const grave = new Grave({
    number: sentGrave.graveNumber,
    row: sentGrave.graveRow,
    field: sentGrave.graveField,
    LAT: sentGrave.LAT1,
    LON: sentGrave.LON1,
    capacity: sentGrave.graveCapacity,
    contractTo: sentGrave.contractTo,
    status: sentGrave.status,
    cemetery: new mongoose.Types.ObjectId(sentGrave.cemeteryId),
  });

  //const createdGrave = await grave.save();

  try {
    const createdGrave = await grave.save();

    console.log(createdGrave);
    res.json({ ...createdGrave._doc, numberOfDeceaseds: 0 });
  } catch (error) {
    return res.json({ message: "Cound not store data" });
  }
  //    client.close()

  console.log("POST request");
};

const getGraves = async (req, res, next) => {
  try {
    //const foundGraves = await Grave.find();
    const foundGraves = await Grave.aggregate([
      {
        $lookup: {
          from: "deceaseds", // Ime kolekcije sa preminulima
          localField: "_id", // Polje u grobu koje odgovara ID-ju groba
          foreignField: "grave", // Polje u preminulima koje odgovara ID-ju groba
          as: "deceaseds", // Naziv polja koje sadrži niz preminulih
        },
      },
      {
        $lookup: {
          from: "gravetypes", // Ime druge kolekcije
          localField: "graveType", // Drugo polje sa ObjectId referencom u prvoj kolekciji
          foreignField: "_id", // Polje u drugoj kolekciji koje želite da povežete sa
          as: "graveType", // Ime polja u rezultatu koje će sadržati druge povezane objekte
        },
      },
      {
        $unwind: "$graveType", // Razmicati drugi povezani objekat
      },
      {
        $lookup: {
          from: "cemeteries", // Ime druge kolekcije
          localField: "cemetery", // Drugo polje sa ObjectId referencom u prvoj kolekciji
          foreignField: "_id", // Polje u drugoj kolekciji koje želite da povežete sa
          as: "cemetery", // Ime polja u rezultatu koje će sadržati druge povezane objekte
        },
      },
      {
        $unwind: "$cemetery", // Razmicati drugi povezani objekat
      },
      {
        $project: {
          _id: 1, // Sačuvajte ID groba
          number: 1, // Sačuvajte ime groba
          row: 1, // Sačuvajte ime groba
          field: 1, // Sačuvajte ime groba
          capacity: 1, // Sačuvajte ime groba
          contractTo: 1, // Sačuvajte ime groba
          LAT: 1, // Sačuvajte ime groba
          LON: 1, // Sačuvajte ime groba
          numberOfDeceaseds: { $size: "$deceaseds" }, // Broj preminulih
          graveType: 1,
          status: 1,
          cemetery: 1,
        },
      },
    ]);
    res.json(foundGraves);
  } catch (error) {
    return res.json({ message: "Cound not get data" });
  }
};

const getGravesForCemetery = async (req, res, next) => {
  console.log("getGravesForCemetery");
  console.log(req.params.id);
  let cemeteryId = new mongoose.Types.ObjectId(req.params.id);
  // let cemeteryId = new ObjectId(req.params.id);
  try {
    //let cemeteryId = ObjectId(req.params.id);
    const foundGraves = await Grave.find({ cemetery: cemeteryId });
    /*  const foundGraves = await Grave.aggregate([
      { $match: { cemetery: cemeteryId } },
      {
        $lookup: {
          from: "deceaseds", // Ime kolekcije sa preminulima
          localField: "_id", // Polje u grobu koje odgovara ID-ju groba
          foreignField: "grave", // Polje u preminulima koje odgovara ID-ju groba
          as: "deceaseds", // Naziv polja koje sadrži niz preminulih
        },
      },
      {
        $lookup: {
          from: "gravetypes", // Ime druge kolekcije
          localField: "graveType", // Drugo polje sa ObjectId referencom u prvoj kolekciji
          foreignField: "_id", // Polje u drugoj kolekciji koje želite da povežete sa
          as: "graveType", // Ime polja u rezultatu koje će sadržati druge povezane objekte
        },
      },
      {
        $unwind: "$graveType", // Razmicati drugi povezani objekat
      },
      {
        $lookup: {
          from: "cemeteries", // Ime druge kolekcije
          localField: "cemetery", // Drugo polje sa ObjectId referencom u prvoj kolekciji
          foreignField: "_id", // Polje u drugoj kolekciji koje želite da povežete sa
          as: "cemetery", // Ime polja u rezultatu koje će sadržati druge povezane objekte
        },
      },
      {
        $unwind: "$cemetery", // Razmicati drugi povezani objekat
      },
      {
        $project: {
          _id: 1, // Sačuvajte ID groba
          number: 1, // Sačuvajte ime groba
          row: 1, // Sačuvajte ime groba
          field: 1, // Sačuvajte ime groba
          //   capacity: 1, // Sačuvajte ime groba
          //   contractTo: 1, // Sačuvajte ime groba
          LAT: 1, // Sačuvajte ime groba
          LON: 1, // Sačuvajte ime groba
          numberOfDeceaseds: { $size: "$deceaseds" }, // Broj preminulih
          graveType: 1,
          status: 1,
          cemetery: 1,
        },
      },
    ]); */
    res.json(foundGraves);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not get data" });
  }
};

const getSingleGrave = async (req, res, next) => {
  const graveId = req.params.id;
  try {
    const foundGrave = await Grave.findById(graveId)
      .populate("graveType")
      .populate("cemetery");
    const deceased = await Deceased.find({ grave: graveId });
    const payers = await Payer.find({ grave: graveId });
    let objToSend = { ...foundGrave._doc, deceased: deceased, payers: payers };

    res.send(objToSend);
  } catch (error) {
    return res.json({ message: "Cound not get data" });
  }
};

const deleteSingleGrave = async (req, res, next) => {
  const graveId = req.params.id;
  try {
    const result = await Grave.deleteOne({ _id: graveId });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      res.send({ id: graveId });
    } else {
      res.json({ message: "Nothing to delete" });
    }
    // res.send(objToSend);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not get data" });
  }
};

const updateGrave = async (req, res) => {
  console.log(req.body);
  const {
    _id,
    number,
    field,
    row,
    status,
    "graveType._id": graveTypeId,
    "cemetery._id": cemeteryId,
  } = req.body;
  console.log(graveTypeId);

  const filter = { _id: _id }; // Criteria to find a row
  const update = {
    number: number,
    field: field,
    row: row,
    status: status,
    graveType: new mongoose.Types.ObjectId(graveTypeId),
    cemetery: new mongoose.Types.ObjectId(cemeteryId),
  }; // Fields to update

  const updatedRow = await Grave.findOneAndUpdate(filter, update, { new: true })
    .populate("graveType")
    .populate("cemetery");

  console.log(updatedRow);

  const deceased = await Deceased.find({ grave: _id });

  if (updatedRow) {
    res.status(200).json({
      _id: updatedRow._id,
      number: updatedRow.number,
      field: updatedRow.field,
      row: updatedRow.row,
      capacity: updatedRow.capacity,
      contractTo: updatedRow.contractTo,
      LAT: updatedRow.LAT,
      LON: updatedRow.LON,
      numberOfDeceaseds: deceased.length,
      graveType: updatedRow.graveType,
      status: updatedRow.status,
      cemetery: updatedRow.cemetery,
    });
  } else {
    res.status(400).send({
      message: "Cannot update the grave request",
    });
  }
};

export {
  saveGrave,
  getGraves,
  getSingleGrave,
  deleteSingleGrave,
  getGravesForCemetery,
  updateGrave,
  saveGravesFromExcel,
};
