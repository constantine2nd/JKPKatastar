import Payer from "../models/payerModel.js";

const savePayer = async (req, res, next) => {
  console.log(req.body);
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
    createdPayer = await payer.save();
    res.json(createdPayer);
  } catch (error) {
    return res.json({ message: "Cound not store data" });
  }
  //    client.close()

  console.log("POST request");
};

export { savePayer };
