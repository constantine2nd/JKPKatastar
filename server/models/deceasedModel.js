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

deceasedSchema.index({ grave: 1 });
deceasedSchema.index({ name: 1 });
deceasedSchema.index({ surname: 1 });
deceasedSchema.index({ dateDeath: -1 });

const Deceased = mongoose.model("Deceased", deceasedSchema);

export default Deceased;
