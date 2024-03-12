import mongoose from "mongoose";

const logSchema = mongoose.Schema({
  userName: {
    type: String,
  },
  action: {
    type: String,
  },
  data: {
    type: String,
  },
});

const Log = mongoose.model("Log", logSchema);

export default Log;
