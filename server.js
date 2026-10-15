import express from "express";
import mongoose from "mongoose";
import Pharmacy from "./models/Pharmacy.js";
import Medicine from "./models/Medicine.js";

// Make user text safe to use inside a regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const app = express();

// Read JSON from request bodies into req.body
app.use(express.json());

// Return static files
app.use(express.static("public"));

// Get all pharmacies
app.get("/api/pharmacies", async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.json(pharmacies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get one pharmacy by id and its medicines
app.get("/api/pharmacies/:id", async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid pharmacy id" });
  }

  try {
    // Find the pharmacy
    const pharmacy = await Pharmacy.findById(id);

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // Get its medicines, A to Z
    const medicines = await Medicine.find({ pharmacy: id }).sort({ name: 1 });

    res.json({ pharmacy, medicines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Register a new pharmacy
app.post("/api/pharmacies", async (req, res) => {
  const name = req.body.name?.trim();
  const location = req.body.location?.trim();

  // Validate input
  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required" });
  }

  try {
    // Save the new pharmacy
    const newPharmacy = await Pharmacy.create({ name, location });
    res.status(201).json(newPharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Add a medicine to a pharmacy
app.post("/api/pharmacies/:id/medicines", async (req, res) => {
  const { id } = req.params;
  const name = req.body.name?.trim();

  // Validate input
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid pharmacy id" });
  }
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    // Make sure the pharmacy exists
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // Block duplicates (case-insensitive)
    const existingMedicine = await Medicine.findOne({
      name,
      pharmacy: id,
    }).collation({ locale: "en", strength: 2 });
    if (existingMedicine) {
      return res.status(409).json({
        message: "Medicine already exists in this pharmacy",
      });
    }

    // Save the new medicine
    const newMedicine = await Medicine.create({ name, pharmacy: id });
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete a medicine
app.delete("/api/medicines/:id", async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid medicine id" });
  }

  try {
    // Make sure the medicine exists
    const deletedMedicine = await Medicine.findByIdAndDelete(id);
    if (!deletedMedicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(200).json({ message: "Medicine deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Edit a medicine
app.patch("/api/medicines/:id", async (req, res) => {
  const { id } = req.params;
  const name = req.body.name?.trim();

  // Validate input
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid medicine id" });
  }
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    // Find the medicine to edit
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Block duplicates: another medicine in the same pharmacy with this name
    const duplicates = await Medicine.findOne({
      name,
      pharmacy: medicine.pharmacy,
      _id: { $ne: id },
    }).collation({ locale: "en", strength: 2 });
    if (duplicates) {
      return res
        .status(409)
        .json({ message: "Medicine already exists in this pharmacy" });
    }

    // Save the new name
    medicine.name = name;
    await medicine.save();
    res.json(medicine);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Search a medicine
app.get("/api/search", async (req, res) => {
  const medicine = req.query.medicine?.trim();

  // Validate input
  if (!medicine) {
    return res.status(400).json({ message: "Medicine name is required" });
  }

  const pattern = escapeRegex(medicine);

  try {
    // Find all pharmacies which have this medicine
    const medicines = await Medicine.find({
      name: { $regex: pattern, $options: "i" },
    })
      .populate("pharmacy")
      .sort({ name: 1 });

    res.json(medicines);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Connect to the database first, then start the server
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Database connection failed: " + error.message);
    process.exit(1);
  }
}

connectDB();
