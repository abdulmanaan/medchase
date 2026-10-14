import mongoose from "mongoose";

// Shape of a pharmacy document
const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
  },
  { versionKey: false },
);

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

export default Pharmacy;
