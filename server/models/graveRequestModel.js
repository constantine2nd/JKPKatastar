import mongoose from "mongoose";

const graveRequestSchema = mongoose.Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  grave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grave",
  },
});

const GraveRequest = mongoose.model("GraveRequest", graveRequestSchema);

export default GraveRequest;
