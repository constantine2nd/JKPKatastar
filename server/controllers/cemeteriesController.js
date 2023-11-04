import Cemetery from "../models/cemeteryModel.js";

const getAllCemeteries = async (req, res, next) => {
  try {
    console.log("get all cemeteries");

    const cemeteries = await Cemetery.find();

    if (cemeteries) {
      res.send(cemeteries);
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    next(err);
  }
};


const updateCemetery = async (req, res) => {
  const { id, name, LAT, LON, zoom } = req.body;
  
  const filter = { _id: id }; // Criteria to find a row
  const update = { name: name, LAT: LAT, LON: LON, zoom: zoom }; // Fields to update

  const updatedCemetery = await Cemetery.findOneAndUpdate(filter, update, {new: true});

  console.log(updatedCemetery);
  
  if (updatedCemetery) {
    res.status(200).json({
      _id: updatedCemetery._id,
      name: updatedCemetery.name,
      LAT: updatedCemetery.LAT,
      LON: updatedCemetery.LON,
      zoom: updatedCemetery.zoom,
    });
  } else {
    res.status(400);
    throw new Error("Cannot update the cemetery");
  }
};

export { getAllCemeteries, updateCemetery };
