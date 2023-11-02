import mongoose from "mongoose";

const graveSchema = mongoose.Schema({
  number: {
    type: Number,
  },
  row: {
    type: Number,
  },
  field: {
    type: Number,
  },
  LAT: {
    type: Number,
  },
  LON: {
    type: Number,
  },
  capacity: {
    type: Number,
  },
  contractTo: {
    type: Date,
  },
  cemetery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cemetery",
  },
});

const Grave = mongoose.model("Grave", graveSchema);

export default Grave;
