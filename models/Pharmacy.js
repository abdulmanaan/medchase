import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
}, { versionKey: false });

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
export default Pharmacy;
