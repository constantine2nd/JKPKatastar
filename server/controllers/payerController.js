import Payer from "../models/payerModel.js";
import { Types } from "mongoose";

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

export { savePayer };
