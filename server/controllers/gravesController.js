import Grave from "../models/graveModel.js";
import Deceased from "../models/deceasedModel.js";
import Payer from "../models/payerModel.js";
//import { ObjectId } from "mongodb";
import mongoose from "mongoose";

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
    //const foundGraves = await Grave.find();
    const foundGraves = await Grave.aggregate([
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
          capacity: 1, // Sačuvajte ime groba
          contractTo: 1, // Sačuvajte ime groba
          LAT: 1, // Sačuvajte ime groba
          LON: 1, // Sačuvajte ime groba
          numberOfDeceaseds: { $size: "$deceaseds" }, // Broj preminulih
          graveType: 1,
          cemetery: 1,
        },
      },
    ]);
    res.json(foundGraves);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not get data" });
  }
};

const getSingleGrave = async (req, res, next) => {
  const graveId = req.params.id;
  try {
    const foundGrave = await Grave.findById(graveId).populate("graveType");
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

export {
  saveGrave,
  getGraves,
  getSingleGrave,
  deleteSingleGrave,
  getGravesForCemetery,
};
