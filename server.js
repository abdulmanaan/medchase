import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const pharmacies = [
  { id: 1, name: "National Pharmacy", location: "Quaid-e-Azam Road, Gojra" },
  { id: 2, name: "Care Pharmacy", location: "Painsara Road, Gojra" },
  { id: 3, name: "Fareed Pharmacy", location: "Mongi Road, Gojra" },
  { id: 4, name: "Kuchbhi Pharmacy", location: "Kuchbhi Road, Gojra" },
];

app.get("/", (req, res) => {
  res.send("MedChase server running");
});

app.get("/api/pharmacies", (req, res) => {
  res.json(pharmacies);
});

app.get("/api/pharmacies/:id", (req, res) => {
  const found = pharmacies.find((p) => p.id.toString() === req.params.id);
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ message: "Pharmacy not found" });
  }
});

app.post("/api/pharmacies", (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required" });
  }
  const newPharmacy = {
    id: pharmacies.length + 1,
    name: name,
    location: location,
  };
  pharmacies.push(newPharmacy);
  res.status(201).json(newPharmacy);
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
