import express from "express";
import mongoose from "mongoose";
import Pharmacy from "./models/Pharmacy.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MedChase server running");
});

app.get("/api/pharmacies", async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.json(pharmacies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/api/pharmacies/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid pharmacy id" });
  }
  try {
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    res.json(pharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/api/pharmacies", async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required" });
  }
  try {
    const newPharmacy = await Pharmacy.create({ name, location });
    res.status(201).json(newPharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected.");
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (error) {
    console.log("Database connection failed: " + error.message);
    process.exit(1);
  }
}

connectDB();
