import Deceased from "../models/deceasedModel.js";
import mongoose from "mongoose";
import { addLog } from "../utils/log.js";

const saveDeceased = async (req, res, next) => {
  const sentDeacesed = req.body;
  console.log(sentDeacesed);

  const graveId = req.params.id;
  console.log(graveId);
  const deacesed = new Deceased({
    name: sentDeacesed.name,
    surname: sentDeacesed.surname,
    dateBirth: sentDeacesed.dateBirth,
    dateDeath: sentDeacesed.dateDeath,
    grave: graveId,
  });

  //const createdGrave = await grave.save();

  try {
    const createdDeacesed = await deacesed.save();
    console.log("TRy-CATCH");
    console.log(createdDeacesed);
    addLog(req.userId, "CREATE_DECEASED", createdDeacesed);
    res.json(createdDeacesed);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not store data" });
  }
  //    client.close()

  console.log("POST request");
};

const getDeceased = async (req, res, next) => {
  try {
    const deceased = await Deceased.find()
      .populate({
        path: "grave",
        populate: {
          path: "cemetery",
        },
      })
      .populate({
        path: "grave",
        populate: {
          path: "graveType",
        },
      });

    if (deceased) {
      res.send(deceased);
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    next(err);
  }
};

const getDeceasedPaginate = async (req, res, next) => {
  try {
    console.log(req.query);
    const { start = 0, size = 10, filters, sorting, globalFilter } = req.query;
    //filtriranje po kolonama
    const filter = {};
    const parsedFilters = JSON.parse(filters);
    parsedFilters.forEach((f) => {
      if (f.id.toUpperCase().startsWith("DATE")) {
        if (!f.value[0] && !f.value[1]) {
          return;
        }

        let obj = {};
        if (f.value[0]) {
          obj.$gte = new Date(f.value[0]);
        }
        if (f.value[1]) {
          obj.$lte = new Date(f.value[1]);
        }
        filter[f.id] = obj;
      } else {
        filter[f.id] = new RegExp(f.value, "i");
      }
    });
    console.log(filter);
    //globalno filtriranje
    const globalSearch = new RegExp(globalFilter, "i");
    const globalFilterSearch = [
      { name: globalSearch },
      { surname: globalSearch },
    ];
    console.log(globalFilterSearch);
    //sortiranje
    const parsedSorting = JSON.parse(sorting);
    const sortingArray = [];
    parsedSorting.forEach((s) => {
      const columnName = s.id;
      const sort = s.desc ? -1 : 1;
      sortingArray.push([columnName, sort]);
    });

    const deceased = await Deceased.find(filter)
      .or(globalFilterSearch)
      .collation({ locale: "en", strength: 2 })
      .sort(sortingArray)
      .skip(start)
      .limit(parseInt(size));
    // .excec();
    //console.log(deceased);

    const totalDeceased = await Deceased.find(filter)
      .or(globalFilterSearch)
      .countDocuments();
    console.log(totalDeceased);
    //  res.send(deceased);
    res.json({
      data: deceased,
      totalItems: totalDeceased,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSingleDeceased = async (req, res, next) => {
  const deceasedId = req.params.id;
  try {
    const result = await Deceased.deleteOne({ _id: deceasedId });
    console.log(res);
    if (result.deletedCount === 1) {
      console.log("deleted count 1");
      addLog(req.userId, "DELETE_DECEASED", { id: deceasedId });
      res.send({ id: deceasedId });
    } else {
      res.json({ message: "Nothing to delete" });
    }
    // res.send(objToSend);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not get data" });
  }
};

const updateDeceased = async (req, res) => {
  const { _id, name, surname, dateBirth, dateDeath } = req.body;

  const filter = { _id: _id }; // Criteria to find a row
  const update = {
    name: name,
    surname: surname,
    dateBirth: dateBirth,
    dateDeath: dateDeath,
  }; // Fields to update

  const updatedDeceased = await Deceased.findOneAndUpdate(filter, update, {
    new: true,
  });

  console.log(updatedDeceased);

  if (updatedDeceased) {
    addLog(req.userId, "UPDATE_DECEASED", { id: updatedDeceased._id });
    res.status(200).json({
      _id: updatedDeceased._id,
      name: updatedDeceased.name,
      surname: updatedDeceased.surname,
      dateBirth: updatedDeceased.dateBirth,
      dateDeath: updatedDeceased.dateDeath,
    });
  } else {
    res.status(400);
    throw new Error("Cannot update the deceased");
  }
};

const getDeceasedForGrave = async (req, res, next) => {
  const graveId = req.params.id;
  try {
    const deceased = await Deceased.find({ grave: graveId });
    if (deceased) {
      res.send(deceased);
    } else {
      res.status(400).send({
        message: "Server error",
      });
    }
  } catch (error) {
    next(error);
  }
};

const getDeceasedSearch = async (req, res, next) => {
  const { cemeteryIds, name, surname, deathDateFrom, deathDateTo, birthDateFrom, birthDateTo } = req.query;
  const start = parseInt(req.query.start) || 0;
  const size = parseInt(req.query.size) || 20;

  const cemeteryIdsArray = cemeteryIds
    ? cemeteryIds.split(",").map((id) => new mongoose.Types.ObjectId(id))
    : [];

  const pipeline = [];

  // 1. Match on indexed deceased fields first — reduces documents before joins
  const deceasedMatch = {};
  if (name) deceasedMatch.name = { $regex: name, $options: "i" };
  if (surname) deceasedMatch.surname = { $regex: surname, $options: "i" };
  if (birthDateFrom || birthDateTo) {
    deceasedMatch.dateBirth = {};
    if (birthDateFrom) deceasedMatch.dateBirth.$gte = new Date(birthDateFrom);
    if (birthDateTo) deceasedMatch.dateBirth.$lt = new Date(birthDateTo);
  }
  if (deathDateFrom || deathDateTo) {
    deceasedMatch.dateDeath = {};
    if (deathDateFrom) deceasedMatch.dateDeath.$gte = new Date(deathDateFrom);
    if (deathDateTo) deceasedMatch.dateDeath.$lt = new Date(deathDateTo);
  }
  if (Object.keys(deceasedMatch).length > 0) {
    pipeline.push({ $match: deceasedMatch });
  }

  // 2. Lookup graves — apply cemetery filter inside the join
  pipeline.push({
    $lookup: {
      from: "graves",
      localField: "grave",
      foreignField: "_id",
      pipeline: [
        ...(cemeteryIdsArray.length ? [{ $match: { cemetery: { $in: cemeteryIdsArray } } }] : []),
        { $project: { cemetery: 1 } },
      ],
      as: "graveInfo",
    },
  });

  // 3. Drop records where no matching grave was found (cemetery filter did not match)
  if (cemeteryIdsArray.length > 0) {
    pipeline.push({ $match: { "graveInfo.0": { $exists: true } } });
  }

  // 4. Facet: count total matching records and fetch one page
  pipeline.push({
    $facet: {
      totalItems: [{ $count: "count" }],
      data: [
        { $skip: start },
        { $limit: size },
        {
          $lookup: {
            from: "cemeteries",
            localField: "graveInfo.cemetery",
            foreignField: "_id",
            as: "cemeteryInfo",
          },
        },
        {
          $project: {
            name: 1,
            surname: 1,
            dateBirth: 1,
            dateDeath: 1,
            cemetery: { $arrayElemAt: ["$cemeteryInfo.name", 0] },
            graveId: { $arrayElemAt: ["$graveInfo._id", 0] },
          },
        },
      ],
    },
  });

  try {
    const [result] = await Deceased.aggregate(pipeline);
    res.send({
      data: result.data,
      totalItems: result.totalItems[0]?.count ?? 0,
    });
  } catch (err) {
    next(err);
  }
};

export {
  saveDeceased,
  getDeceased,
  getDeceasedPaginate,
  deleteSingleDeceased,
  updateDeceased,
  getDeceasedForGrave,
  getDeceasedSearch,
};
