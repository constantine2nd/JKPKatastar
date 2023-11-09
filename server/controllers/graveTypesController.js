import GraveType from "../models/graveTypeModel.js";

const getAllGraveTypes = async (req, res, next) => {
  try {
    /* const graveType = new GraveType({
      name: "tip2",
      capacity: 6,
      description: "bla bla gggg rgdgegr",
    });
    const createdType = await graveType.save();
    console.log(createdType); */
    const graveTypes = await GraveType.find();

    if (graveTypes) {
      res.send(graveTypes);
    } else {
      res.status(401);
      throw new Error("Server error");
    }
  } catch (err) {
    next(err);
  }
};

export { getAllGraveTypes };
