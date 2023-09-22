import mongoose from "mongoose";

const payerSchema = mongoose.Schema({
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
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  jmbg: {
    type: Number,
  },
  active: {
    type: Boolean,
  },
});

const Payer = mongoose.model("Payer", payerSchema);

export default Payer;
