import Grave from "../models/graveModel.js";
import Deceased from "../models/deceasedModel.js";

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
  });

  //const createdGrave = await grave.save();

  try {
    createdGrave = await grave.save();
    res.json(createdGrave);
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
        },
      },
    ]);
    res.json(foundGraves);
  } catch (error) {
    return res.json({ message: "Cound not get data" });
  }
};

const getSingleGrave = async (req, res, next) => {
  const graveId = req.params.id;
  try {
    const foundGrave = await Grave.findById(graveId);
    const deceased = await Deceased.find({ grave: graveId });
    let objToSend = { ...foundGrave._doc, deceased: deceased };

    res.send(objToSend);
  } catch (error) {
    return res.json({ message: "Cound not get data" });
  }
};

export { saveGrave, getGraves, getSingleGrave };
