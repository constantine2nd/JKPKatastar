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

export { getAllCemeteries };
