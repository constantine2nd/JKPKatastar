import mongoose from "mongoose";

const cemeterySchema = mongoose.Schema({
  name: {
    type: String,
  },
  LAT: {
    type: Number,
  },
  LON: {
    type: Number,
  },
  zoom: {
    type: Number,
  },
});

const Cemetery = mongoose.model("Cemetery", cemeterySchema);

export default Cemetery;
