import mongoose from "mongoose";

// Shape of a medicine document; each medicine belongs to one pharmacy
const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
  },
  { versionKey: false },
);

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
