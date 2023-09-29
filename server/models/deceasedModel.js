import mongoose from "mongoose";

const deceasedSchema = mongoose.Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  grave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grave",
  },
  dateBirth: {
    type: Date,
  },
  dateDeath: {
    type: Date,
  },
});

const Deceased = mongoose.model("Deceased", deceasedSchema);

export default Deceased;
