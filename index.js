// Import required modules
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
require("dotenv").config()

// Create the express app
const app = express()

// Middleware
app.use(cors())
app.use(bodyParser.json())

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error:"))
db.once("open", () => {
  console.log("Connected to MongoDB")
})

// Define the email schema and model
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
})

const Email = mongoose.model("Email", emailSchema)

// Routes
app.post("/api/waiting-list", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const existingEmail = await Email.findOne({ email })
    if (existingEmail) {
      return res.status(409).json({ message: "Email is already registered" })
    }

    const newEmail = new Email({ email })
    await newEmail.save()

    res.status(201).json({ message: "Email added to the waiting list" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Default route
app.get("/", (req, res) => {
  console.log(process.env)
  res.send("CodingQueue Waiting List API")
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
