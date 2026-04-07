import Grave from "../models/graveModel.js";
import Deceased from "../models/deceasedModel.js";
import Payer from "../models/payerModel.js";
import GraveType from "../models/graveTypeModel.js";
import GraveRequest from "../models/graveRequestModel.js";
//import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { addLog } from "../utils/log.js";

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
    let status = "FREE";
    if (grave.deceased && grave.deceased.length > 0) {
      status = "OCCUPIED";
    }

    const newGrave = new Grave({
      number: grave.number,
      row: grave.row,
      field: grave.field,
      LAT: grave.LAT,
      LON: grave.LON,
      status: status,
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
    LAT: sentGrave.LAT,
    LON: sentGrave.LON,
    graveType: new mongoose.Types.ObjectId(sentGrave.graveType),
    cemetery: new mongoose.Types.ObjectId(sentGrave.cemetery),
  });

  //const createdGrave = await grave.save();

  try {
    const createdGrave = await grave.save();

    console.log(createdGrave);
    addLog(req.userId, "CREATE_GRAVE", createdGrave);
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
    /*   const transformedGraves = foundGraves.map(grave=>{
      return{
      _id: grave._id, 
          number: grave.number, 
          row: grave.row, 
          field: grave.field, 
          capacity: grave.capacity, 
          contractTo: grave.contractTo, 
          LAT: grave.LAT,
          LON: grave.LON, 
          numberOfDeceaseds: grave.numberOfDeceaseds,
          graveType: grave.graveType,
          status: 1,
          cemetery: 1
    }}) */
    console.log(foundGraves.length);
    res.json(foundGraves);
  } catch (error) {
    return res.json({ message: "Cound not get data" });
  }
};

const getGravesPaginated = async (req, res, next) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const size = parseInt(req.query.size) || 20;

    const matchFilter = {};

    if (req.query.cemeteryIds) {
      const ids = req.query.cemeteryIds.split(",").filter(Boolean);
      if (ids.length > 0) {
        matchFilter.cemetery = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }
    if (req.query.number) {
      const num = parseInt(req.query.number);
      if (!isNaN(num)) matchFilter.number = { $in: [num, String(num)] };
    }
    if (req.query.field) {
      const num = parseInt(req.query.field);
      if (!isNaN(num)) matchFilter.field = { $in: [num, String(num)] };
    }
    if (req.query.row) {
      const num = parseInt(req.query.row);
      if (!isNaN(num)) matchFilter.row = { $in: [num, String(num)] };
    }
    if (req.query.graveTypeId) {
      matchFilter.graveType = new mongoose.Types.ObjectId(req.query.graveTypeId);
    }
    if (req.query.status) {
      matchFilter.status = req.query.status;
    }
    if (req.query.contractFrom || req.query.contractTo) {
      matchFilter.contractTo = {};
      if (req.query.contractFrom) matchFilter.contractTo.$gte = new Date(req.query.contractFrom);
      if (req.query.contractTo) matchFilter.contractTo.$lte = new Date(req.query.contractTo);
    }

    if (req.query.payerName || req.query.payerSurname) {
      const payerFilter = {};
      if (req.query.payerName) payerFilter.name = { $regex: req.query.payerName, $options: "i" };
      if (req.query.payerSurname) payerFilter.surname = { $regex: req.query.payerSurname, $options: "i" };
      const graveIds = await Payer.distinct("grave", payerFilter);
      matchFilter._id = { $in: graveIds };
    }

    const hasFilter = Object.keys(matchFilter).length > 0;

    const [data, totalItems] = await Promise.all([
      Grave.aggregate([
        // Filter FIRST so pagination operates on the matching subset
        ...(hasFilter ? [{ $match: matchFilter }] : []),
        { $sort: { _id: 1 } },
        { $skip: start },
        { $limit: size },
        // Deceased count — uses index on deceaseds.grave
        {
          $lookup: {
            from: "deceaseds",
            let: { graveId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$grave", "$$graveId"] } } },
              { $count: "count" },
            ],
            as: "deceasedCount",
          },
        },
        // GraveType — fetch only needed fields
        {
          $lookup: {
            from: "gravetypes",
            let: { graveTypeId: "$graveType" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$graveTypeId"] } } },
              { $project: { name: 1, capacity: 1 } },
            ],
            as: "graveType",
          },
        },
        { $unwind: { path: "$graveType", preserveNullAndEmptyArrays: true } },
        // Cemetery — fetch only needed fields
        {
          $lookup: {
            from: "cemeteries",
            let: { cemeteryId: "$cemetery" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$cemeteryId"] } } },
              { $project: { name: 1 } },
            ],
            as: "cemetery",
          },
        },
        { $unwind: { path: "$cemetery", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            number: 1,
            row: 1,
            field: 1,
            capacity: 1,
            contractTo: 1,
            LAT: 1,
            LON: 1,
            numberOfDeceaseds: { $ifNull: [{ $arrayElemAt: ["$deceasedCount.count", 0] }, 0] },
            graveType: 1,
            status: 1,
            cemetery: 1,
          },
        },
      ]),
      hasFilter ? Grave.countDocuments(matchFilter) : Grave.countDocuments(),
    ]);

    res.json({ data, totalItems });
  } catch (error) {
    next(error);
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
    //Provera da li ima pokojnika
    const deceasedCount = await Deceased.aggregate([
      { $match: { grave: new mongoose.Types.ObjectId(graveId) } },
      { $count: "totalCount" },
    ]);
    console.log("Number of deceased: ", deceasedCount);
    if (deceasedCount.length > 0) {
      const [{ totalCount }] = deceasedCount;
      if (totalCount > 0) {
        res.status(400).send({
          message:
            "Cannot delete the grave, you must first delete all deceased",
        });
        return;
      }
    }
    //Provera da li ima platioca
    const payersCount = await Payer.aggregate([
      { $match: { grave: new mongoose.Types.ObjectId(graveId) } },
      { $count: "totalCount" },
    ]);
    console.log("Number of payers: ", payersCount);
    if (payersCount.length > 0) {
      const [{ totalCount }] = payersCount;
      if (totalCount > 0) {
        res.status(400).send({
          message: "Cannot delete the grave, you must first delete all payers",
        });
        return;
      }
    }
    //Provera da li ima zahteva
    const requestsCount = await GraveRequest.aggregate([
      { $match: { grave: new mongoose.Types.ObjectId(graveId) } },
      { $count: "totalCount" },
    ]);
    console.log("Number of grave requests: ", requestsCount);
    if (requestsCount.length > 0) {
      const [{ totalCount }] = requestsCount;
      if (totalCount > 0) {
        res.status(400).send({
          message:
            "Cannot delete the grave, you must first delete all grave requests",
        });
        return;
      }
    }

    const result = await Grave.deleteOne({ _id: graveId });
    console.log(result);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      addLog(req.userId, "DELETE_GRAVE", { id: graveId });
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
    contractTo,
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
    contractTo: contractTo || null,
    graveType: new mongoose.Types.ObjectId(graveTypeId),
    cemetery: new mongoose.Types.ObjectId(cemeteryId),
  }; // Fields to update

  const updatedRow = await Grave.findOneAndUpdate(filter, update, { new: true })
    .populate("graveType")
    .populate("cemetery");

  console.log(updatedRow);

  const deceased = await Deceased.find({ grave: _id });

  if (updatedRow) {
    addLog(req.userId, "UPDATE_GRAVE", { id: updatedRow._id });
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

const getContractExpiryReport = async (req, res, next) => {
  try {
    const now = new Date();
    const in30 = new Date(now); in30.setDate(in30.getDate() + 30);
    const in60 = new Date(now); in60.setDate(in60.getDate() + 60);
    const in90 = new Date(now); in90.setDate(in90.getDate() + 90);

    // Fetch all graves with contractTo set, within 90 days or already expired
    const graves = await Grave.aggregate([
      {
        $match: {
          contractTo: { $ne: null, $exists: true, $lte: in90 },
        },
      },
      {
        $lookup: {
          from: "cemeteries",
          let: { cemeteryId: "$cemetery" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$cemeteryId"] } } },
            { $project: { name: 1 } },
          ],
          as: "cemetery",
        },
      },
      { $unwind: { path: "$cemetery", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "gravetypes",
          let: { graveTypeId: "$graveType" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$graveTypeId"] } } },
            { $project: { name: 1 } },
          ],
          as: "graveType",
        },
      },
      { $unwind: { path: "$graveType", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "payers",
          let: { graveId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$grave", "$$graveId"] }, { $eq: ["$active", true] }] } } },
            { $project: { name: 1, surname: 1, phone: 1 } },
          ],
          as: "activePayer",
        },
      },
      {
        $project: {
          _id: 1,
          number: 1,
          field: 1,
          row: 1,
          contractTo: 1,
          status: 1,
          cemetery: 1,
          graveType: 1,
          activePayer: { $arrayElemAt: ["$activePayer", 0] },
        },
      },
      { $sort: { contractTo: 1 } },
    ]);

    const expired = [];
    const within30 = [];
    const within60 = [];
    const within90 = [];

    for (const g of graves) {
      const d = new Date(g.contractTo);
      if (d < now) expired.push(g);
      else if (d <= in30) within30.push(g);
      else if (d <= in60) within60.push(g);
      else within90.push(g);
    }

    res.json({
      generatedAt: now,
      summary: {
        expired: expired.length,
        within30days: within30.length,
        within60days: within60.length,
        within90days: within90.length,
      },
      expired,
      within30days: within30,
      within60days: within60,
      within90days: within90,
    });
  } catch (error) {
    next(error);
  }
};

export {
  saveGrave,
  getGraves,
  getGravesPaginated,
  getSingleGrave,
  deleteSingleGrave,
  getGravesForCemetery,
  updateGrave,
  saveGravesFromExcel,
  getContractExpiryReport,
};
