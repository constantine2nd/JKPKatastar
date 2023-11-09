import mongoose from "mongoose";

const graveTypeSchema = mongoose.Schema({
  name: {
    type: String,
  },
  capacity: {
    type: Number,
  },
  description: {
    type: String,
  },
});

const GraveType = mongoose.model("GraveType", graveTypeSchema);

export default GraveType;
