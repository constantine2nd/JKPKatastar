import Deceased from "../models/deceasedModel.js";

const saveDeacesed = async (req, res, next) => {
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
    res.json(createdDeacesed);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Cound not store data" });
  }
  //    client.close()

  console.log("POST request");
};

export { saveDeacesed };
